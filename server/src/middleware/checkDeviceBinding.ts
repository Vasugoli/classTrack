import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
    extractDeviceInfo,
    generateDeviceFingerprint,
    verifyDeviceFingerprint,
} from "../utils/deviceUtils";
import { createAuditLog, AUDIT_ACTIONS } from "./auditLogger";

/**
 * Middleware to check device binding for attendance operations
 * Verifies that the user is accessing from their registered device
 * Prevents attendance marking from unauthorized devices
 */

/**
 * Checks if a user has a device binding and validates the current device
 * Returns middleware function that can be used in Express routes
 */
export function checkDeviceBinding() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Ensure user is authenticated
            if (!req.user?.id) {
                await createAuditLog(
                    "unknown",
                    AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
                    req,
                    { reason: "No authenticated user found" },
                );
                res.status(401).json({
                    error: "Authentication required",
                    code: "AUTH_REQUIRED",
                });
                return;
            }

            const userId = req.user.id;

            // Extract device information from request headers
            const deviceInfo = extractDeviceInfo(req.headers);

            if (!deviceInfo.userAgent || !deviceInfo.platform) {
                await createAuditLog(
                    userId,
                    AUDIT_ACTIONS.DEVICE_MISMATCH,
                    req,
                    { reason: "Missing device information in headers" },
                );
                res.status(400).json({
                    error: "Device information required",
                    code: "DEVICE_INFO_MISSING",
                });
                return;
            }

            // Generate device fingerprint from current request
            const currentFingerprint = generateDeviceFingerprint(
                deviceInfo.userAgent,
                deviceInfo.platform,
            );

            // Store fingerprint in request for use by other middleware
            req.deviceFingerprint = currentFingerprint;

            // Check if user has a device binding
            const deviceBinding = await prisma.deviceBinding.findUnique({
                where: { userId },
                include: { user: true },
            });

            if (!deviceBinding) {
                await createAuditLog(
                    userId,
                    AUDIT_ACTIONS.DEVICE_MISMATCH,
                    req,
                    {
                        reason: "No device binding found for user",
                        userAgent: deviceInfo.userAgent,
                        platform: deviceInfo.platform,
                    },
                );
                res.status(403).json({
                    error: "Device not bound. Please bind your device first.",
                    code: "DEVICE_NOT_BOUND",
                    requiresBinding: true,
                });
                return;
            }

            // Verify the device fingerprint against stored hash
            const isValidDevice = await verifyDeviceFingerprint(
                currentFingerprint,
                deviceBinding.deviceHash,
            );

            if (!isValidDevice) {
                await createAuditLog(
                    userId,
                    AUDIT_ACTIONS.DEVICE_MISMATCH,
                    req,
                    {
                        reason: "Device fingerprint mismatch",
                        userAgent: deviceInfo.userAgent,
                        platform: deviceInfo.platform,
                        bindingDate: deviceBinding.createdAt,
                    },
                );
                res.status(403).json({
                    error: "Device mismatch. Attendance can only be marked from your registered device.",
                    code: "DEVICE_MISMATCH",
                    boundAt: deviceBinding.createdAt,
                    currentDevice: {
                        platform: deviceInfo.platform,
                        userAgent:
                            deviceInfo.userAgent.substring(0, 100) + "...", // Truncate for security
                    },
                });
                return;
            }

            // Device is valid, log successful verification
            console.log(`[DEVICE] Valid device verified for user ${userId}`);

            // Continue to next middleware
            next();
        } catch (error) {
            console.error("[DEVICE] Device binding check failed:", error);

            // Log the error for audit purposes
            if (req.user?.id) {
                await createAuditLog(
                    req.user.id,
                    AUDIT_ACTIONS.DEVICE_MISMATCH,
                    req,
                    {
                        reason: "Device binding check error",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    },
                );
            }

            res.status(500).json({
                error: "Device verification failed",
                code: "DEVICE_CHECK_ERROR",
            });
            return;
        }
    };
}

/**
 * Checks if a user already has a device binding
 * Used in device binding endpoint to prevent multiple bindings
 */
export async function hasExistingBinding(userId: string): Promise<boolean> {
    try {
        const binding = await prisma.deviceBinding.findUnique({
            where: { userId },
        });
        return !!binding;
    } catch (error) {
        console.error("[DEVICE] Error checking existing binding:", error);
        return false;
    }
}

/**
 * Gets device binding information for a user
 * Returns binding details or null if not found
 */
export async function getDeviceBinding(userId: string) {
    try {
        return await prisma.deviceBinding.findUnique({
            where: { userId },
            include: { user: true },
        });
    } catch (error) {
        console.error("[DEVICE] Error getting device binding:", error);
        return null;
    }
}

/**
 * Validates device binding request data
 * Ensures all required fields are present and valid
 */
export function validateDeviceBindingData(data: any): {
    isValid: boolean;
    error?: string;
    sanitizedData?: {
        userAgent: string;
        platform: string;
        additionalEntropy?: string;
    };
} {
    if (!data) {
        return { isValid: false, error: "Request data is required" };
    }

    const { userAgent, platform, additionalEntropy } = data;

    if (!userAgent || typeof userAgent !== "string") {
        return {
            isValid: false,
            error: "User agent is required and must be a string",
        };
    }

    if (!platform || typeof platform !== "string") {
        return {
            isValid: false,
            error: "Platform is required and must be a string",
        };
    }

    // Validate user agent format (basic check)
    if (userAgent.length < 10 || userAgent.length > 2000) {
        return { isValid: false, error: "User agent has invalid length" };
    }

    // Validate platform
    const validPlatforms = [
        "Windows",
        "macOS",
        "Linux",
        "Android",
        "iOS",
        "Unknown",
    ];
    if (!validPlatforms.includes(platform)) {
        return { isValid: false, error: "Invalid platform specified" };
    }

    return {
        isValid: true,
        sanitizedData: {
            userAgent: userAgent.trim(),
            platform: platform.trim(),
            additionalEntropy: additionalEntropy
                ? String(additionalEntropy).trim()
                : undefined,
        },
    };
}

/**
 * Middleware specifically for device binding endpoints
 * Validates request data and checks for existing bindings
 */
export function validateDeviceBindingRequest() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                res.status(401).json({
                    error: "Authentication required",
                    code: "AUTH_REQUIRED",
                });
                return;
            }

            // Validate request data
            const validation = validateDeviceBindingData(req.body);
            if (!validation.isValid) {
                await createAuditLog(
                    req.user.id,
                    AUDIT_ACTIONS.DEVICE_BIND_FAIL,
                    req,
                    { reason: validation.error },
                );
                res.status(400).json({
                    error: validation.error,
                    code: "INVALID_DEVICE_DATA",
                });
                return;
            }

            // Store sanitized data in request
            req.body = validation.sanitizedData;

            next();
        } catch (error) {
            console.error("[DEVICE] Device binding validation failed:", error);
            res.status(500).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
            });
            return;
        }
    };
}
