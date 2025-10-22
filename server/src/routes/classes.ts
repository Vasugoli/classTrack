import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { listClasses, createClass } from "../controllers/classes_controller";

const router = Router();

// List classes (teachers see their own by default; admin can see all with ?all=1)
router.get("/", requireAuth, listClasses);

router.post("/", requireAuth, requireRole("TEACHER", "ADMIN"), createClass);

export default router;
