import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
	getSuggestions,
	listTasks,
	createTask,
	updateTask,
	deleteTask,
} from "../controllers/productivity_controller";

const router = Router();

// Simple rule-based suggestion using user's interests/goals
router.get("/suggestions", requireAuth, getSuggestions);

// Tasks CRUD
router.get("/tasks", requireAuth, listTasks);

router.post("/tasks", requireAuth, createTask);

router.patch("/tasks/:id", requireAuth, updateTask);

router.delete("/tasks/:id", requireAuth, deleteTask);

export default router;
