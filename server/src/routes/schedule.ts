import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
	listSchedule,
	createSchedule,
	deleteSchedule,
} from "../controllers/schedule_controller";

const router = Router();

// List current user's weekly schedule
router.get("/", requireAuth, listSchedule);

router.post("/", requireAuth, createSchedule);

// Delete a schedule entry by id
router.delete("/:id", requireAuth, deleteSchedule);

export default router;
