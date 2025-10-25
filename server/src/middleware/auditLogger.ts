import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { extractDeviceInfo } from "../utils/deviceUtils";

/**
 * Audit logger middleware that tracks all attendance-related events
 * Logs actions, IP addresses, device info, and other relevant data for security auditing
 */

export interface AuditAction {
	LOGIN: "LOGIN";
	LOGOUT: "LOGOUT";
	DEVICE_BIND: "DEVICE_BIND";
	DEVICE_BIND_FAIL: "DEVICE_BIND_FAIL";
	ATTENDANCE_ATTEMPT: "ATTENDANCE_ATTEMPT";
	ATTENDANCE_SUCCESS: "ATTENDANCE_SUCCESS";
	ATTENDANCE_FAIL: "ATTENDANCE_FAIL";
	DEVICE_MISMATCH: "DEVICE_MISMATCH";
	GEO_VIOLATION: "GEO_VIOLATION";
	TOKEN_INVALID: "TOKEN_INVALID";
	TOKEN_EXPIRED: "TOKEN_EXPIRED";
	TOKEN_USED: "TOKEN_USED";
	UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS";
	SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY";
}

export const AUDIT_ACTIONS: AuditAction = {
	LOGIN: "LOGIN",
	LOGOUT: "LOGOUT",
	DEVICE_BIND: "DEVICE_BIND",
	DEVICE_BIND_FAIL: "DEVICE_BIND_FAIL",
	ATTENDANCE_ATTEMPT: "ATTENDANCE_ATTEMPT",
	ATTENDANCE_SUCCESS: "ATTENDANCE_SUCCESS",
	ATTENDANCE_FAIL: "ATTENDANCE_FAIL",
	DEVICE_MISMATCH: "DEVICE_MISMATCH",
	GEO_VIOLATION: "GEO_VIOLATION",
	TOKEN_INVALID: "TOKEN_INVALID",
	TOKEN_EXPIRED: "TOKEN_EXPIRED",
	TOKEN_USED: "TOKEN_USED",
	UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
	SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY"
};

/**
 * Extracts client IP address from request headers
 * Handles various proxy headers and fallbacks
 */
function getClientIP(req: Request): string {
	const forwarded = req.headers["x-forwarded-for"];
	const realIP = req.headers["x-real-ip"];
	const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

	if (forwarded) {
		// x-forwarded-for can contain multiple IPs, take the first one
		const forwardedArray = Array.isArray(forwarded) ? forwarded : [forwarded];
		const firstIP = forwardedArray[0].split(",")[0].trim();
		return firstIP;
	}

	if (realIP) {
		return Array.isArray(realIP) ? realIP[0] : realIP;
	}

	return remoteAddress || "unknown";
}

/**
 * Creates an audit log entry in the database
 * Safely handles errors to prevent middleware from breaking the request flow
 */
export async function createAuditLog(
	userId: string,
	action: keyof AuditAction,
	req: Request,
	details?: Record<string, any>,
	location?: string
): Promise<void> {
	try {
		const deviceInfo = extractDeviceInfo(req.headers);
		const ipAddress = getClientIP(req);

		await prisma.auditLog.create({
			data: {
				userId,
				action,
				ipAddress,
				deviceId: deviceInfo.userAgent.substring(0, 255), // Truncate if too long
				location,
				details: details || {},
				timestamp: new Date()
			}
		});

		console.log(`[AUDIT] ${action} by user ${userId} from ${ipAddress}`);
	} catch (error) {
		// Log to console but don't throw - audit logging should not break the main flow
		console.error("[AUDIT ERROR] Failed to create audit log:", error);
	}
}

/**
 * Middleware factory that creates an audit logger for specific actions
 * Usage: auditLogger('ATTENDANCE_ATTEMPT')
 */
export function auditLogger(action: keyof AuditAction) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Extract user ID from JWT payload (set by auth middleware)
			const user = (req as any).user;
			if (!user?.id) {
				console.warn("[AUDIT] No user found in request for audit logging");
				return next();
			}

			// Extract relevant details from request
			const details: Record<string, any> = {
				method: req.method,
				url: req.originalUrl,
				userAgent: req.headers["user-agent"] || "unknown"
			};

			// Add request body details for POST requests (excluding sensitive data)
			if (req.method === "POST" && req.body) {
				const sanitizedBody = { ...req.body };
				// Remove sensitive fields
				delete sanitizedBody.password;
				delete sanitizedBody.token;
				delete sanitizedBody.deviceFingerprint;
				details.requestData = sanitizedBody;
			}

			// Extract location if provided
			let location;
			if (req.body?.latitude && req.body?.longitude) {
				location = `${req.body.latitude},${req.body.longitude}`;
			}

			await createAuditLog(user.id, action, req, details, location);
		} catch (error) {
			console.error("[AUDIT ERROR] Audit logger middleware failed:", error);
		}

		next();
	};
}

/**
 * Response audit logger that logs the outcome of operations
 * Should be called after the main operation completes
 */
export async function auditResponse(
	req: Request,
	userId: string,
	action: keyof AuditAction,
	success: boolean,
	details?: Record<string, any>
): Promise<void> {
	try {
		const responseDetails = {
			...details,
			success,
			timestamp: new Date().toISOString()
		};

		await createAuditLog(userId, action, req, responseDetails);
	} catch (error) {
		console.error("[AUDIT ERROR] Failed to log response:", error);
	}
}

/**
 * Middleware to log failed authentication attempts
 * Can be used for suspicious activity detection
 */
export async function auditFailedAuth(
	email: string,
	reason: string,
	req: Request
): Promise<void> {
	try {
		const ipAddress = getClientIP(req);
		const deviceInfo = extractDeviceInfo(req.headers);

		// Create a special audit log for failed auth (no userId since auth failed)
		console.log(`[AUDIT] Failed auth attempt for ${email}: ${reason} from ${ipAddress}`);

		// You could extend this to store failed attempts in a separate table
		// or implement rate limiting based on IP/email combinations
	} catch (error) {
		console.error("[AUDIT ERROR] Failed to log auth failure:", error);
	}
}

/**
 * Middleware to detect and log suspicious activities
 * Can be extended with more sophisticated detection logic
 */
export function detectSuspiciousActivity() {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = (req as any).user;
			if (!user) return next();

			const ipAddress = getClientIP(req);
			const userAgent = req.headers["user-agent"] || "";

			// Basic suspicious activity detection
			const suspiciousPatterns = [
				userAgent.includes("bot"),
				userAgent.includes("crawler"),
				userAgent.includes("spider"),
				userAgent.length < 10,
				ipAddress.includes("127.0.0.1") && process.env.NODE_ENV === "production"
			];

			if (suspiciousPatterns.some(pattern => pattern)) {
				await createAuditLog(
					user.id,
					"SUSPICIOUS_ACTIVITY",
					req,
					{
						reason: "Suspicious user agent or IP pattern detected",
						userAgent,
						ipAddress
					}
				);
			}
		} catch (error) {
			console.error("[AUDIT ERROR] Suspicious activity detection failed:", error);
		}

		next();
	};
}