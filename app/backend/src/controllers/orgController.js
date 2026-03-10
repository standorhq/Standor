import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { logAuditEvent } from "../lib/auditLogger.js";

// Helper to check org access
const getOrgIfAuthorized = async (orgId, userId, requiredRoles = ["owner", "admin", "member"]) => {
    const org = await Organization.findById(orgId).populate("members.userId", "name email profileImage");
    if (!org) return null;

    if (org.ownerId.toString() === userId.toString() && requiredRoles.includes("owner")) return org;

    const member = org.members.find(m => m.userId?._id.toString() === userId.toString());
    if (member && requiredRoles.includes(member.role)) return org;

    return null;
};

export const getUserOrgs = async (req, res) => {
    try {
        const orgs = await Organization.find({
            $or: [
                { ownerId: req.user._id },
                { "members.userId": req.user._id }
            ]
        }).populate("members.userId", "name email profileImage");
        res.status(200).json(orgs);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const createOrg = async (req, res) => {
    try {
        const { name, slug } = req.body;
        const exists = await Organization.findOne({ slug });
        if (exists) return res.status(400).json({ detail: "Organization slug already taken" });

        const org = await Organization.create({
            name,
            slug,
            ownerId: req.user._id,
            members: [{ userId: req.user._id, role: "owner" }],
            invites: []
        });

        await logAuditEvent({ req, userId: req.user._id, action: "org_created", metadata: { orgId: org._id, slug } });

        res.status(201).json(org);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const updateOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { name, retentionDays } = req.body;
        
        const org = await getOrgIfAuthorized(orgId, req.user._id, ["owner", "admin"]);
        if (!org) return res.status(403).json({ detail: "Not authorized or not found" });

        if (name) org.name = name;
        if (retentionDays !== undefined) org.retentionDays = retentionDays;
        
        await org.save();
        res.status(200).json(org);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const deleteOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const org = await getOrgIfAuthorized(orgId, req.user._id, ["owner"]);
        if (!org) return res.status(403).json({ detail: "Not authorized or not found" });

        await Organization.findByIdAndDelete(orgId);
        
        await logAuditEvent({ req, userId: req.user._id, action: "org_deleted", metadata: { orgId } });
        
        res.status(200).json({ message: "Organization deleted" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const inviteMember = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { email, role } = req.body;

        const org = await getOrgIfAuthorized(orgId, req.user._id, ["owner", "admin"]);
        if (!org) return res.status(403).json({ detail: "Not authorized or not found" });

        // Simple mock for invite: In a real app we'd email them a link.
        // We'll just add it to pending invites.
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        org.invites.push({ email, role: role || "member", expiresAt });
        
        await org.save();
        await logAuditEvent({ req, userId: req.user._id, action: "org_member_invited", metadata: { orgId, invitedEmail: email } });
        res.status(200).json({ message: "Invitation sent", invite: org.invites[org.invites.length - 1] });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { orgId, userId } = req.params;
        const org = await getOrgIfAuthorized(orgId, req.user._id, ["owner", "admin"]);
        if (!org) return res.status(403).json({ detail: "Not authorized or not found" });

        if (org.ownerId.toString() === userId) {
            return res.status(400).json({ detail: "Cannot remove the owner" });
        }

        org.members = org.members.filter(m => m.userId?._id.toString() !== userId);
        await org.save();
        await logAuditEvent({ req, userId: req.user._id, action: "org_member_removed", metadata: { orgId, removedUserId: userId } });
        res.status(200).json({ message: "Member removed" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const leaveOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const org = await getOrgIfAuthorized(orgId, req.user._id);
        if (!org) return res.status(404).json({ detail: "Not found" });

        if (org.ownerId.toString() === req.user._id.toString()) {
            return res.status(400).json({ detail: "Owner cannot leave the organization. Transfer ownership or delete." });
        }

        org.members = org.members.filter(m => m.userId?._id.toString() !== req.user._id.toString());
        await org.save();
        await logAuditEvent({ req, userId: req.user._id, action: "org_left", metadata: { orgId } });
        res.status(200).json({ message: "Successfully left the organization" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const updateMemberRole = async (req, res) => {
    try {
        const { orgId, userId } = req.params;
        const { role } = req.body;

        const org = await getOrgIfAuthorized(orgId, req.user._id, ["owner"]);
        if (!org) return res.status(403).json({ detail: "Not authorized or not found" });

        if (org.ownerId.toString() === userId) {
            return res.status(400).json({ detail: "Cannot change the owner's role directly" });
        }

        const member = org.members.find(m => m.userId?._id.toString() === userId);
        if (!member) return res.status(404).json({ detail: "Member not found" });

        member.role = role;
        await org.save();
        res.status(200).json({ message: "Role updated" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};
