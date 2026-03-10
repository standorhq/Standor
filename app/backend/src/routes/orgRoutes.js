import express from "express";
import { 
    getUserOrgs, 
    createOrg, 
    updateOrg, 
    deleteOrg, 
    inviteMember, 
    removeMember, 
    leaveOrg, 
    updateMemberRole 
} from "../controllers/orgController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getUserOrgs);
router.post("/", createOrg);
router.patch("/:orgId", updateOrg);
router.delete("/:orgId", deleteOrg);
router.post("/:orgId/invites", inviteMember);
router.delete("/:orgId/members/:userId", removeMember);
router.delete("/:orgId/leave", leaveOrg);
router.patch("/:orgId/members/:userId/role", updateMemberRole);

export default router;
