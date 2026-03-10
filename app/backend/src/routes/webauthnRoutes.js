import express from "express";
import { 
    getCredentials, 
    deleteCredential, 
    getRegistrationOptions, 
    verifyRegistration, 
    getAuthOptions, 
    verifyAuth 
} from "../controllers/webauthnController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Protected routes (for managing passkeys)
router.get("/credentials", protectRoute, getCredentials);
router.delete("/:credentialId", protectRoute, deleteCredential);
router.post("/register/options", protectRoute, getRegistrationOptions);
router.post("/register/verify", protectRoute, verifyRegistration);

// Public routes (for logging in)
router.post("/authenticate/options", getAuthOptions);
router.post("/authenticate/verify", verifyAuth);

export default router;
