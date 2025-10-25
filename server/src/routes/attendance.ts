import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { checkDeviceBinding } from "../middleware/checkDeviceBinding";
import { checkGeoLock } from "../middleware/checkGeoLock";
import {
    auditLogger,
    detectSuspiciousActivity,
} from "../middleware/auditLogger";
import {
    markAttendance,
    generateSessionToken,
    getTodayAttendance,
    getAttendanceHistory,
    getAttendanceByClass,
} from "../controllers/attendance_controller";

const router = Router();

/**
 * Secure attendance marking route with complete middleware stack
 * POST /api/attendance/mark
 *
 * Middleware order is critical for security:
 * 1. requireAuth - Verify JWT token
 * 2. auditLogger - Log attendance attempt
 * 3. detectSuspiciousActivity - Check for suspicious patterns
 * 4. checkDeviceBinding - Verify device is bound to user
 * 5. checkGeoLock - Verify user is within campus boundaries
 * 6. markAttendance - Actually mark the attendance
 */
router.post(
    "/mark",
    requireAuth,
    auditLogger("ATTENDANCE_ATTEMPT"),
    detectSuspiciousActivity(),
    checkDeviceBinding(),
    checkGeoLock(),
    markAttendance,
);

/**
 * Generate session token for attendance (teachers only)
 * POST /api/attendance/token
 */
router.post(
    "/token",
    requireAuth,
    requireRole("TEACHER"),
    auditLogger("TOKEN_INVALID"), // Using this as there's no TOKEN_GENERATE action
    generateSessionToken,
);

/**
 * Get today's attendance for current user
 * GET /api/attendance/today
 */
router.get("/today", requireAuth, getTodayAttendance);

/**
 * Get attendance history for current user
 * GET /api/attendance/history
 */
router.get("/history", requireAuth, getAttendanceHistory);

/**
 * Get attendance records for a specific class (teachers/admins only)
 * GET /api/attendance/class/:classId
 */
router.get(
    "/class/:classId",
    requireAuth,
    requireRole("TEACHER", "ADMIN"),
    getAttendanceByClass,
);

export default router;
