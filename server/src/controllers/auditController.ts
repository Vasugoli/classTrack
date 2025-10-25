import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "../middleware/auditLogger";

/**
 * Audit Controller
 * Handles audit log viewing and management (admin only)
 */

// Schema for audit log filtering
const auditFilterSchema = z.object({
	userId: z.string().optional(),
	action: z.string().optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.number().min(1).max(1000).default(100),
	offset: z.number().min(0).default(0),
	ipAddress: z.string().optional(),
	deviceId: z.string().optional()
});

/**
 * Gets audit logs with filtering and pagination (admin only)
 * GET /api/audit/logs
 */
export async function getAuditLogs(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		// Only admins can view audit logs
		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted to access audit logs" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		// Parse and validate query parameters
		const filters = auditFilterSchema.parse({
			userId: req.query.userId,
			action: req.query.action,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
			offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
			ipAddress: req.query.ipAddress,
			deviceId: req.query.deviceId
		});

		// Build where clause based on filters
		const where: any = {};

		if (filters.userId) {
			where.userId = filters.userId;
		}

		if (filters.action) {
			where.action = filters.action;
		}

		if (filters.startDate || filters.endDate) {
			where.timestamp = {};
			if (filters.startDate) {
				where.timestamp.gte = new Date(filters.startDate);
			}
			if (filters.endDate) {
				where.timestamp.lte = new Date(filters.endDate);
			}
		}

		if (filters.ipAddress) {
			where.ipAddress = {
				contains: filters.ipAddress,
				mode: "insensitive"
			};
		}

		if (filters.deviceId) {
			where.deviceId = {
				contains: filters.deviceId,
				mode: "insensitive"
			};
		}

		// Get total count for pagination
		const totalCount = await prisma.auditLog.count({ where });

		// Get audit logs with filters
		const auditLogs = await prisma.auditLog.findMany({
			where,
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						role: true,
						enrollmentNo: true
					}
				}
			},
			orderBy: {
				timestamp: "desc"
			},
			take: filters.limit,
			skip: filters.offset
		});

		return res.json({
			logs: auditLogs.map(log => ({
				id: log.id,
				userId: log.userId,
				user: log.user,
				action: log.action,
				ipAddress: log.ipAddress,
				deviceId: log.deviceId,
				location: log.location,
				timestamp: log.timestamp,
				details: log.details
			})),
			pagination: {
				total: totalCount,
				limit: filters.limit,
				offset: filters.offset,
				hasMore: filters.offset + filters.limit < totalCount
			},
			filters: {
				applied: filters,
				availableActions: Object.values(AUDIT_ACTIONS)
			}
		});

	} catch (error) {
		console.error("[AUDIT] Failed to get audit logs:", error);

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: "Invalid filter parameters",
				code: "VALIDATION_ERROR",
				details: error.errors
			});
		}

		return res.status(500).json({
			error: "Failed to retrieve audit logs",
			code: "AUDIT_ERROR"
		});
	}
}

/**
 * Gets audit statistics and summary (admin only)
 * GET /api/audit/stats
 */
export async function getAuditStats(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted to access audit stats" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		// Get date range (default to last 30 days)
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);

		// Get total log count
		const totalLogs = await prisma.auditLog.count();

		// Get logs in date range
		const recentLogs = await prisma.auditLog.count({
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				}
			}
		});

		// Get action counts
		const actionCounts = await prisma.auditLog.groupBy({
			by: ['action'],
			_count: {
				action: true
			},
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: {
				_count: {
					action: 'desc'
				}
			}
		});

		// Get unique users count
		const uniqueUsers = await prisma.auditLog.findMany({
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				}
			},
			select: {
				userId: true
			},
			distinct: ['userId']
		});

		// Get top IP addresses
		const topIPs = await prisma.auditLog.groupBy({
			by: ['ipAddress'],
			_count: {
				ipAddress: true
			},
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				},
				ipAddress: {
					not: null
				}
			},
			orderBy: {
				_count: {
					ipAddress: 'desc'
				}
			},
			take: 10
		});

		// Get failed attempts
		const failedAttempts = await prisma.auditLog.count({
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				},
				action: {
					in: [
						AUDIT_ACTIONS.ATTENDANCE_FAIL,
						AUDIT_ACTIONS.DEVICE_BIND_FAIL,
						AUDIT_ACTIONS.DEVICE_MISMATCH,
						AUDIT_ACTIONS.GEO_VIOLATION,
						AUDIT_ACTIONS.TOKEN_INVALID,
						AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
						AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY
					]
				}
			}
		});

		return res.json({
			summary: {
				totalLogs,
				recentLogs: recentLogs,
				uniqueActiveUsers: uniqueUsers.length,
				failedAttempts,
				dateRange: {
					start: startDate.toISOString(),
					end: endDate.toISOString()
				}
			},
			actionBreakdown: actionCounts.map(item => ({
				action: item.action,
				count: item._count.action
			})),
			topIPAddresses: topIPs.map(item => ({
				ipAddress: item.ipAddress,
				count: item._count.ipAddress
			})),
			securityMetrics: {
				failedAttendanceAttempts: await prisma.auditLog.count({
					where: {
						timestamp: { gte: startDate, lte: endDate },
						action: AUDIT_ACTIONS.ATTENDANCE_FAIL
					}
				}),
				deviceMismatches: await prisma.auditLog.count({
					where: {
						timestamp: { gte: startDate, lte: endDate },
						action: AUDIT_ACTIONS.DEVICE_MISMATCH
					}
				}),
				geoViolations: await prisma.auditLog.count({
					where: {
						timestamp: { gte: startDate, lte: endDate },
						action: AUDIT_ACTIONS.GEO_VIOLATION
					}
				}),
				suspiciousActivities: await prisma.auditLog.count({
					where: {
						timestamp: { gte: startDate, lte: endDate },
						action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY
					}
				})
			}
		});

	} catch (error) {
		console.error("[AUDIT] Failed to get audit stats:", error);
		return res.status(500).json({
			error: "Failed to retrieve audit statistics",
			code: "STATS_ERROR"
		});
	}
}

/**
 * Gets audit logs for a specific user (admin only)
 * GET /api/audit/user/:userId
 */
export async function getUserAuditLogs(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted to access user audit logs" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		const { userId } = req.params;
		const limit = parseInt(req.query.limit as string) || 50;
		const offset = parseInt(req.query.offset as string) || 0;

		// Check if user exists
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				enrollmentNo: true
			}
		});

		if (!targetUser) {
			return res.status(404).json({
				error: "User not found",
				code: "USER_NOT_FOUND"
			});
		}

		// Get audit logs for the user
		const auditLogs = await prisma.auditLog.findMany({
			where: { userId },
			orderBy: { timestamp: "desc" },
			take: limit,
			skip: offset
		});

		const totalCount = await prisma.auditLog.count({
			where: { userId }
		});

		return res.json({
			user: targetUser,
			logs: auditLogs,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + limit < totalCount
			}
		});

	} catch (error) {
		console.error("[AUDIT] Failed to get user audit logs:", error);
		return res.status(500).json({
			error: "Failed to retrieve user audit logs",
			code: "USER_AUDIT_ERROR"
		});
	}
}

/**
 * Exports audit logs to CSV format (admin only)
 * GET /api/audit/export
 */
export async function exportAuditLogs(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted to export audit logs" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		// Get date range from query params
		const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

		const auditLogs = await prisma.auditLog.findMany({
			where: {
				timestamp: {
					gte: startDate,
					lte: endDate
				}
			},
			include: {
				user: {
					select: {
						email: true,
						name: true,
						role: true
					}
				}
			},
			orderBy: {
				timestamp: "desc"
			}
		});

		// Generate CSV content
		const csvHeader = "Timestamp,User Email,User Name,Role,Action,IP Address,Device ID,Location,Details\n";
		const csvRows = auditLogs.map(log => {
			const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
			return [
				log.timestamp.toISOString(),
				log.user.email,
				log.user.name,
				log.user.role,
				log.action,
				log.ipAddress || '',
				log.deviceId || '',
				log.location || '',
				`"${details}"`
			].join(',');
		}).join('\n');

		const csvContent = csvHeader + csvRows;

		// Set headers for file download
		const fileName = `audit_logs_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

		// Log the export action
		await createAuditLog(
			user.id,
			AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, // Using this as there's no EXPORT action
			req,
			{
				reason: "Audit logs exported",
				dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
				recordCount: auditLogs.length
			}
		);

		return res.send(csvContent);

	} catch (error) {
		console.error("[AUDIT] Failed to export audit logs:", error);
		return res.status(500).json({
			error: "Failed to export audit logs",
			code: "EXPORT_ERROR"
		});
	}
}

/**
 * Cleans up old audit logs (admin only)
 * DELETE /api/audit/cleanup
 */
export async function cleanupAuditLogs(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted audit log cleanup" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		// Get retention period from query (default 90 days)
		const retentionDays = parseInt(req.query.retentionDays as string) || 90;
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

		// Count logs to be deleted
		const logsToDelete = await prisma.auditLog.count({
			where: {
				timestamp: {
					lt: cutoffDate
				}
			}
		});

		// Delete old logs
		const result = await prisma.auditLog.deleteMany({
			where: {
				timestamp: {
					lt: cutoffDate
				}
			}
		});

		// Log the cleanup action
		await createAuditLog(
			user.id,
			AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, // Using this as there's no CLEANUP action
			req,
			{
				reason: "Audit log cleanup performed",
				retentionDays,
				deletedCount: result.count,
				cutoffDate: cutoffDate.toISOString()
			}
		);

		return res.json({
			success: true,
			deletedCount: result.count,
			retentionDays,
			cutoffDate: cutoffDate.toISOString(),
			message: `Successfully deleted ${result.count} audit logs older than ${retentionDays} days`
		});

	} catch (error) {
		console.error("[AUDIT] Failed to cleanup audit logs:", error);
		return res.status(500).json({
			error: "Failed to cleanup audit logs",
			code: "CLEANUP_ERROR"
		});
	}
}