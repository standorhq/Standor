import express from "express";
import { ssoLogin, ssoCallback } from "../controllers/ssoController.js";

const router = express.Router();

// Placeholder routes for SAML / OIDC integration
router.get("/login", ssoLogin);
router.post("/callback", ssoCallback);

export default router;
