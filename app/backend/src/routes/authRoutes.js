import express from "express";
import { 
    googleAuth, getMe, googleAuthRedirect, googleAuthCallback, 
    updateProfile, changePassword, unlinkProvider, exportData, 
    deleteAccount, updateGovernance, verifyPassword, verifyEmail, resendVerification,
    getSessions, revokeSession, logoutEverywhere 
} from "../controllers/authController.js";
import { mfaSetup, mfaEnable, mfaVerify, mfaDisable, mfaRegenerateBackupCodes } from "../controllers/mfaController.js";
import { listApiKeys, createApiKey, revokeApiKey } from "../controllers/apiKeyController.js";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Public routes
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.post("/google", googleAuth);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/mfa/verify", mfaVerify);

// Protected routes
router.get("/me", protectRoute, getMe);
router.patch("/me", protectRoute, updateProfile);
router.post("/change-password", protectRoute, changePassword);
router.post("/verify-password", protectRoute, verifyPassword);
router.delete("/providers/:provider", protectRoute, unlinkProvider);
router.get("/export-data", protectRoute, exportData);
router.delete("/delete-account", protectRoute, deleteAccount);
router.patch("/governance", protectRoute, updateGovernance);

router.get("/sessions", protectRoute, getSessions);
router.delete("/sessions/:createdAt", protectRoute, revokeSession);
router.post("/logout-everywhere", protectRoute, logoutEverywhere);

router.post("/mfa/setup", protectRoute, mfaSetup);
router.post("/mfa/enable", protectRoute, mfaEnable);
router.post("/mfa/disable", protectRoute, mfaDisable);
router.post("/mfa/regenerate-backup-codes", protectRoute, mfaRegenerateBackupCodes);

router.get("/api-keys", protectRoute, listApiKeys);
router.post("/api-keys", protectRoute, createApiKey);
router.delete("/api-keys/:name", protectRoute, revokeApiKey);

router.get("/audit-logs", protectRoute, getAuditLogs);

export default router;
