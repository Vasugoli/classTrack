import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
	getAuditLogs,
	getAuditStats,
	getUserAuditLogs,
	exportAuditLogs,
	cleanupAuditLogs
} from "../controllers/auditController";

const router = Router();

/**
 * Audit log routes for security monitoring and compliance
 * All routes require authentication and admin privileges
 */

// Get audit logs with filtering and pagination
// GET /api/audit/logs
router.get(
	"/logs",
	requireAuth,
	getAuditLogs
);

// Get audit statistics and summary
// GET /api/audit/stats
router.get(
	"/stats",
	requireAuth,
	getAuditStats
);

// Get audit logs for a specific user
// GET /api/audit/user/:userId
router.get(
	"/user/:userId",
	requireAuth,
	getUserAuditLogs
);

// Export audit logs to CSV
// GET /api/audit/export
router.get(
	"/export",
	requireAuth,
	exportAuditLogs
);

// Clean up old audit logs
// DELETE /api/audit/cleanup
router.delete(
	"/cleanup",
	requireAuth,
	cleanupAuditLogs
);

export default router;