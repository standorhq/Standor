import { 
    generateRegistrationOptions, 
    verifyRegistrationResponse, 
    generateAuthenticationOptions, 
    verifyAuthenticationResponse 
} from "@simplewebauthn/server";
import { ENV } from "../lib/env.js";
import Passkey from "../models/Passkey.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { logAuditEvent } from "../lib/auditLogger.js";

const rpName = "Standor";
// For E.g., http://localhost:5173 -> localhost. For https://standor.io -> standor.io
const origin = ENV.CLIENT_URL || "http://localhost:5173";
const rpID = new URL(origin).hostname;

export const getCredentials = async (req, res) => {
    try {
        const passkeys = await Passkey.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(passkeys);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const deleteCredential = async (req, res) => {
    try {
        const { credentialId } = req.params;
        await Passkey.findOneAndDelete({ userId: req.user._id, credentialID: credentialId });
        await logAuditEvent({ req, userId: req.user._id, action: "passkey_removed" });
        res.status(200).json({ message: "Passkey deleted" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const getRegistrationOptions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const userPasskeys = await Passkey.find({ userId: user._id });

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user._id.toString(),
            userName: user.email,
            excludeCredentials: userPasskeys.map(p => ({
                id: Buffer.from(p.credentialID, 'base64url'),
                type: 'public-key',
                transports: p.transports,
            })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'cross-platform',
            },
        });

        user.currentWebAuthnChallenge = options.challenge;
        await user.save();

        res.status(200).json(options);
    } catch (error) {
        console.error("error in registration options", error)
        res.status(500).json({ detail: "Server error" });
    }
};

export const verifyRegistration = async (req, res) => {
    try {
        const { response, keyName } = req.body;
        const user = await User.findById(req.user._id);
        const expectedChallenge = user.currentWebAuthnChallenge;

        if (!expectedChallenge) return res.status(400).json({ detail: "No active challenge" });

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

            await Passkey.create({
                userId: user._id,
                name: keyName || "My Passkey",
                credentialID: Buffer.from(credentialID).toString('base64url'),
                credentialPublicKey: Buffer.from(credentialPublicKey),
                counter,
                deviceType: credentialDeviceType,
                backedUp: credentialBackedUp,
                transports: response.response.transports || [],
            });

            user.currentWebAuthnChallenge = null;
            await user.save();

            await logAuditEvent({ req, userId: user._id, action: "passkey_added", metadata: { name: keyName }});

            res.status(200).json({ success: true, message: "Passkey added" });
        } else {
            res.status(400).json({ detail: "Verification failed" });
        }
    } catch (error) {
        console.error("error verify registration", error)
        res.status(500).json({ detail: error.message || "Server error" });
    }
};

// Typically called when logged out during login flow
export const getAuthOptions = async (req, res) => {
    try {
        const { email } = req.body; // Can be empty if username-less flow
        let expectedUser;
        let passkeys = [];

        if (email) {
            expectedUser = await User.findOne({ email });
            if (expectedUser) {
                passkeys = await Passkey.find({ userId: expectedUser._id });
            }
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: passkeys.map(p => ({
                id: Buffer.from(p.credentialID, 'base64url'),
                type: 'public-key',
                transports: p.transports,
            })),
            userVerification: 'preferred',
        });

        // Store the challenge context. 
        // If we don't know the user yet, we could store it globally with a nonce, but for now
        // Assuming user enters email first in login flow.
        if (expectedUser) {
            expectedUser.currentWebAuthnChallenge = options.challenge;
            await expectedUser.save();
        }

        res.status(200).json(options);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const verifyAuth = async (req, res) => {
    try {
        const { response } = req.body;
        const passkey = await Passkey.findOne({ credentialID: response.id });
        if (!passkey) return res.status(400).json({ detail: "Passkey not found" });

        const user = await User.findById(passkey.userId);
        const expectedChallenge = user.currentWebAuthnChallenge;

        if (!expectedChallenge) return res.status(400).json({ detail: "No active challenge" });

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: Buffer.from(passkey.credentialID, 'base64url'),
                credentialPublicKey: passkey.credentialPublicKey,
                counter: passkey.counter,
                transports: passkey.transports,
            },
        });

        if (verification.verified) {
            passkey.counter = verification.authenticationInfo.newCounter;
            passkey.lastUsed = new Date();
            await passkey.save();

            user.currentWebAuthnChallenge = null;
            await user.save();

            // Issue token
            const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, { expiresIn: "7d" });

            res.status(200).json({ 
                success: true, 
                token, 
                user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage } 
            });
        } else {
            res.status(400).json({ detail: "Authentication failed" });
        }
    } catch (error) {
        res.status(500).json({ detail: error.message || "Server error" });
    }
};
