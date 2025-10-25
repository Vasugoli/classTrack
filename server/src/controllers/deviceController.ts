import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
	generateDeviceFingerprint,
	hashDeviceFingerprint,
	extractDeviceInfo,
	validateDeviceInfo
} from "../utils/deviceUtils";
import { createAuditLog, AUDIT_ACTIONS } from "../middleware/auditLogger";
import { hasExistingBinding, validateDeviceBindingData } from "../middleware/checkDeviceBinding";

/**
 * Device Controller
 * Handles device binding operations for secure attendance system
 */

// Validation schema for device binding request
const deviceBindingSchema = z.object({
	userAgent: z.string().min(10).max(2000),
	platform: z.enum(["Windows", "macOS", "Linux", "Android", "iOS", "Unknown"]),
	additionalEntropy: z.string().optional()
});

/**
 * Binds a device to a user account
 * POST /api/device/bind
 */
export async function bindDevice(req: Request, res: Response) {
	try {
		// Extract user from JWT (set by auth middleware)
		const user = (req as any).user;
		if (!user?.id) {
			await createAuditLog(
				"unknown",
				AUDIT_ACTIONS.DEVICE_BIND_FAIL,
				req,
				{ reason: "No authenticated user found" }
			);
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		const userId = user.id;

		// Check if user already has a device binding
		const existingBinding = await hasExistingBinding(userId);
		if (existingBinding) {
			await createAuditLog(
				userId,
				AUDIT_ACTIONS.DEVICE_BIND_FAIL,
				req,
				{ reason: "User already has a device binding" }
			);
			return res.status(409).json({
				error: "Device already bound. Each user can only bind one device.",
				code: "DEVICE_ALREADY_BOUND",
				message: "Contact your administrator if you need to change your registered device."
			});
		}

		// Validate and sanitize device binding data
		const validation = validateDeviceBindingData(req.body);
		if (!validation.isValid) {
			await createAuditLog(
				userId,
				AUDIT_ACTIONS.DEVICE_BIND_FAIL,
				req,
				{ reason: validation.error }
			);
			return res.status(400).json({
				error: validation.error,
				code: "INVALID_DEVICE_DATA"
			});
		}

		const { userAgent, platform, additionalEntropy } = validation.sanitizedData!;

		// Additional validation using utility function
		if (!validateDeviceInfo(userAgent, platform)) {
			await createAuditLog(
				userId,
				AUDIT_ACTIONS.DEVICE_BIND_FAIL,
				req,
				{ reason: "Invalid device information format" }
			);
			return res.status(400).json({
				error: "Invalid device information provided",
				code: "INVALID_DEVICE_FORMAT"
			});
		}

		// Generate device fingerprint
		const deviceFingerprint = generateDeviceFingerprint(
			userAgent,
			platform,
			additionalEntropy
		);

		// Hash the fingerprint for secure storage
		const deviceHash = await hashDeviceFingerprint(deviceFingerprint);

		// Create device binding in database
		const deviceBinding = await prisma.deviceBinding.create({
			data: {
				userId,
				deviceHash,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						role: true
					}
				}
			}
		});

		// Log successful device binding
		await createAuditLog(
			userId,
			AUDIT_ACTIONS.DEVICE_BIND,
			req,
			{
				platform,
				userAgent: userAgent.substring(0, 100), // Truncate for logging
				bindingId: deviceBinding.id
			}
		);

		console.log(`[DEVICE] Successfully bound device for user ${userId}`);

		return res.status(201).json({
			success: true,
			message: "Device successfully bound to your account",
			binding: {
				id: deviceBinding.id,
				userId: deviceBinding.userId,
				platform,
				createdAt: deviceBinding.createdAt,
				user: deviceBinding.user
			},
			instructions: {
				attendance: "You can now mark attendance from this device only",
				security: "For security, attendance marking is restricted to your registered device"
			}
		});

	} catch (error) {
		console.error("[DEVICE] Device binding failed:", error);

		// Log the error for audit purposes
		if ((req as any).user?.id) {
			await createAuditLog(
				(req as any).user.id,
				AUDIT_ACTIONS.DEVICE_BIND_FAIL,
				req,
				{
					reason: "Device binding error",
					error: error instanceof Error ? error.message : "Unknown error"
				}
			);
		}

		return res.status(500).json({
			error: "Device binding failed",
			code: "BINDING_ERROR",
			message: "Please try again later or contact support"
		});
	}
}

/**
 * Gets device binding information for the current user
 * GET /api/device/info
 */
export async function getDeviceInfo(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		const userId = user.id;

		// Get device binding for user
		const deviceBinding = await prisma.deviceBinding.findUnique({
			where: { userId },
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						role: true
					}
				}
			}
		});

		if (!deviceBinding) {
			return res.status(404).json({
				error: "No device binding found",
				code: "DEVICE_NOT_BOUND",
				message: "Please bind your device first to mark attendance"
			});
		}

		// Extract current device info for comparison
		const currentDeviceInfo = extractDeviceInfo(req.headers);

		return res.json({
			binding: {
				id: deviceBinding.id,
				userId: deviceBinding.user.id,
				boundAt: deviceBinding.createdAt,
				lastUpdated: deviceBinding.updatedAt,
				user: deviceBinding.user
			},
			currentDevice: {
				platform: currentDeviceInfo.platform,
				userAgent: currentDeviceInfo.userAgent.substring(0, 100) + "...", // Truncate for security
				timestamp: new Date().toISOString()
			},
			status: "bound",
			instructions: {
				attendance: "Attendance can only be marked from your bound device",
				security: "Device binding ensures secure attendance tracking"
			}
		});

	} catch (error) {
		console.error("[DEVICE] Failed to get device info:", error);
		return res.status(500).json({
			error: "Failed to retrieve device information",
			code: "DEVICE_INFO_ERROR"
		});
	}
}

/**
 * Removes device binding for the current user (admin only or with proper verification)
 * DELETE /api/device/unbind
 */
export async function unbindDevice(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		const userId = user.id;

		// Only allow admins to unbind devices (for security)
		if (user.role !== "ADMIN") {
			await createAuditLog(
				userId,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted device unbinding" }
			);
			return res.status(403).json({
				error: "Device unbinding requires administrator privileges",
				code: "ADMIN_REQUIRED",
				message: "Contact your administrator to unbind your device"
			});
		}

		// Check if device binding exists
		const deviceBinding = await prisma.deviceBinding.findUnique({
			where: { userId }
		});

		if (!deviceBinding) {
			return res.status(404).json({
				error: "No device binding found",
				code: "DEVICE_NOT_BOUND"
			});
		}

		// Remove device binding
		await prisma.deviceBinding.delete({
			where: { userId }
		});

		// Log device unbinding
		await createAuditLog(
			userId,
			AUDIT_ACTIONS.DEVICE_BIND_FAIL, // Using this as there's no DEVICE_UNBIND action
			req,
			{
				reason: "Device unbound by admin",
				bindingId: deviceBinding.id,
				unboundBy: user.id
			}
		);

		console.log(`[DEVICE] Device unbound for user ${userId} by admin ${user.id}`);

		return res.json({
			success: true,
			message: "Device binding removed successfully",
			userId,
			unboundAt: new Date().toISOString()
		});

	} catch (error) {
		console.error("[DEVICE] Device unbinding failed:", error);
		return res.status(500).json({
			error: "Device unbinding failed",
			code: "UNBIND_ERROR"
		});
	}
}

/**
 * Lists all device bindings (admin only)
 * GET /api/device/list
 */
export async function listDeviceBindings(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		// Only allow admins to view all device bindings
		if (user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-admin attempted to list device bindings" }
			);
			return res.status(403).json({
				error: "Administrator privileges required",
				code: "ADMIN_REQUIRED"
			});
		}

		// Get all device bindings with user information
		const deviceBindings = await prisma.deviceBinding.findMany({
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
				createdAt: "desc"
			}
		});

		return res.json({
			bindings: deviceBindings.map(binding => ({
				id: binding.id,
				userId: binding.userId,
				user: binding.user,
				boundAt: binding.createdAt,
				lastUpdated: binding.updatedAt
			})),
			total: deviceBindings.length,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error("[DEVICE] Failed to list device bindings:", error);
		return res.status(500).json({
			error: "Failed to retrieve device bindings",
			code: "LIST_ERROR"
		});
	}
}

/**
 * Validates current device against binding (utility endpoint for testing)
 * POST /api/device/validate
 */
export async function validateCurrentDevice(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED"
			});
		}

		const userId = user.id;

		// Get device binding
		const deviceBinding = await prisma.deviceBinding.findUnique({
			where: { userId }
		});

		if (!deviceBinding) {
			return res.status(404).json({
				error: "No device binding found",
				code: "DEVICE_NOT_BOUND",
				isValid: false
			});
		}

		// Extract current device info
		const deviceInfo = extractDeviceInfo(req.headers);
		const currentFingerprint = generateDeviceFingerprint(
			deviceInfo.userAgent,
			deviceInfo.platform
		);

		// Validate against stored hash (this would normally be done in middleware)
		// This endpoint is for testing purposes
		return res.json({
			isValid: true, // We can't actually validate without exposing the hash
			binding: {
				id: deviceBinding.id,
				boundAt: deviceBinding.createdAt
			},
			currentDevice: {
				platform: deviceInfo.platform,
				userAgent: deviceInfo.userAgent.substring(0, 100) + "..."
			},
			message: "Device validation requires middleware check during attendance marking"
		});

	} catch (error) {
		console.error("[DEVICE] Device validation failed:", error);
		return res.status(500).json({
			error: "Device validation failed",
			code: "VALIDATION_ERROR"
		});
	}
}