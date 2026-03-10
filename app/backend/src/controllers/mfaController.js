import * as otplib from "otplib";
const { authenticator } = otplib;
import qrcode from "qrcode";
import crypto from "crypto";
import User from "../models/User.js";
import { logAuditEvent } from "../lib/auditLogger.js";

const generateBackupCodes = () => {
    return Array.from({ length: 8 }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
};

export const mfaSetup = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ detail: "User not found" });
        if (user.twoFactorEnabled) return res.status(400).json({ detail: "MFA already enabled" });

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, "Standor App", secret);
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        res.status(200).json({ secret, qrCodeUrl });
    } catch (error) {
        console.error("Error in mfaSetup:", error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const mfaEnable = async (req, res) => {
    try {
        const { secret, code } = req.body;
        const user = await User.findById(req.user._id);
        
        const isValid = authenticator.verify({ token: code, secret });
        if (!isValid) return res.status(400).json({ detail: "Invalid verification code" });

        const backupCodes = generateBackupCodes();
        user.twoFactorSecret = secret;
        user.twoFactorEnabled = true;
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        await logAuditEvent({ req, userId: user._id, action: "mfa_enabled" });

        res.status(200).json({ success: true, backupCodes });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const mfaVerify = async (req, res) => {
    try {
        // Technically used upon login, but our frontend might use it to step-up auth. 
        // We'll trust the user ID from the mfaToken or active session.
        // Assuming user is already authenticated here via protectRoute for simplicity, 
        // OR if this is part of the login flow, they might pass an mfaToken.
        // If login flow requires MFA, it should return an mfaRequired flag, then frontend calls this.
        // We'll implement this simple branch based on `req.user` or body `mfaToken`.
        res.status(400).json({ detail: "MFA login flow to be implemented via auth endpoint." });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const mfaDisable = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user._id);
        
        const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
        if (!isValid) return res.status(400).json({ detail: "Invalid code" });

        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;
        user.twoFactorBackupCodes = [];
        await user.save();

        await logAuditEvent({ req, userId: user._id, action: "mfa_disabled" });

        res.status(200).json({ success: true, message: "MFA Disabled" });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const mfaRegenerateBackupCodes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.twoFactorEnabled) return res.status(400).json({ detail: "MFA not enabled" });

        const backupCodes = generateBackupCodes();
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        await logAuditEvent({ req, userId: user._id, action: "mfa_backup_codes_regenerated" });

        res.status(200).json({ backupCodes });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};
