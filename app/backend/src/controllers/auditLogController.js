import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5); // Adjust limit as needed
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};
