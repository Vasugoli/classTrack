import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
	listClasses,
	createClass,
	updateClass,
	deleteClass,
} from "../controllers/classes_controller";

const router = Router();

// List classes (teachers see their own by default; admin can see all with ?all=1)
router.get("/", requireAuth, listClasses);

// Create a new class
router.post("/", requireAuth, requireRole("TEACHER", "ADMIN"), createClass);

// Update a class
router.put(
	"/:classId",
	requireAuth,
	requireRole("TEACHER", "ADMIN"),
	updateClass
);

// Delete a class
router.delete(
	"/:classId",
	requireAuth,
	requireRole("TEACHER", "ADMIN"),
	deleteClass
);

export default router;
