import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
	getProfile,
	updateProfile,
	listAllUsers,
	updateUserRole,
	deleteUser,
} from "../controllers/users_controller";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

// Admin/Teacher routes - both can view users (with filtering)
router.get("/all", requireAuth, requireRole("ADMIN", "TEACHER"), listAllUsers);

// Admin only - update roles
router.patch(
	"/:userId/role",
	requireAuth,
	requireRole("ADMIN"),
	updateUserRole
);

// Admin/Teacher - delete users (with restrictions)
router.delete(
	"/:userId",
	requireAuth,
	requireRole("ADMIN", "TEACHER"),
	deleteUser
);

export default router;
