import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
	markAttendance,
	getTodayAttendance,
	getAttendanceHistory,
	getAttendanceByClass,
} from "../controllers/attendance_controller";

const router = Router();

router.post("/mark", requireAuth, markAttendance);
router.get("/today", requireAuth, getTodayAttendance);
router.get("/history", requireAuth, getAttendanceHistory);
router.get(
	"/class/:classId",
	requireAuth,
	requireRole("TEACHER", "ADMIN"),
	getAttendanceByClass
);

export default router;
