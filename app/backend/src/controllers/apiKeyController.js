import crypto from "crypto";
import bcrypt from "bcryptjs";
import ApiKey from "../models/ApiKey.js";
import { logAuditEvent } from "../lib/auditLogger.js";

export const listApiKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find({ userId: req.user._id }).select("-hashedKey");
        res.status(200).json(keys);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const createApiKey = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ detail: "API key name is required" });

        const existingCount = await ApiKey.countDocuments({ userId: req.user._id });
        if (existingCount >= 10) return res.status(400).json({ detail: "Maximum of 10 API keys allowed" });

        // Generate 32-byte secure random string
        const rawKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
        const keyPrefix = rawKey.substring(0, 7) + "..." + rawKey.substring(rawKey.length - 4);
        
        const salt = await bcrypt.genSalt(10);
        const hashedKey = await bcrypt.hash(rawKey, salt);

        await ApiKey.create({
            userId: req.user._id,
            name,
            keyPrefix,
            hashedKey,
        });

        await logAuditEvent({ req, userId: req.user._id, action: "api_key_created", metadata: { name } });

        res.status(201).json({ name, key: rawKey });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ detail: "An API key with this name already exists" });
        res.status(500).json({ detail: "Server error" });
    }
};

export const revokeApiKey = async (req, res) => {
    try {
        const { name } = req.params;
        const deleted = await ApiKey.findOneAndDelete({ userId: req.user._id, name });
        if (!deleted) return res.status(404).json({ detail: "API key not found" });
        
        await logAuditEvent({ req, userId: req.user._id, action: "api_key_revoked", metadata: { name } });

        res.status(200).json({ message: "API key revoked" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};
