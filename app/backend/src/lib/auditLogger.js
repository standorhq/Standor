import AuditLog from "../models/AuditLog.js";
import { UAParser } from "ua-parser-js";

export const logAuditEvent = async ({ req, userId, action, metadata = {} }) => {
    try {
        const parser = new UAParser(req.headers['user-agent']);
        const agent = parser.getBrowser().name 
            ? `${parser.getBrowser().name} on ${parser.getOS().name}` 
            : req.headers['user-agent'] || "Unknown Device";
        
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown IP";

        await AuditLog.create({
            userId,
            action,
            ipAddress: ip,
            userAgent: agent,
            metadata,
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
};
