import { Request, Response, NextFunction } from "express";
import {
    sanitizeLocation,
    isWithinCampus,
    getGeoConfig,
    formatLocationForLog,
} from "../utils/geoUtils";
import { createAuditLog, AUDIT_ACTIONS } from "./auditLogger";

/**
 * Middleware to check geographic location for attendance operations
 * Verifies that the user is within the campus boundaries when marking attendance
 * Prevents remote attendance marking from outside campus
 */

/**
 * Main geo-locking middleware function
 * Validates user location against campus boundaries
 */
export function checkGeoLock() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Ensure user is authenticated
            if (!req.user?.id) {
                await createAuditLog(
                    "unknown",
                    AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
                    req,
                    { reason: "No authenticated user found for geo check" },
                );
                res.status(401).json({
                    error: "Authentication required",
                    code: "AUTH_REQUIRED",
                });
                return;
            }

            const userId = req.user.id;

            // Extract location from request body
            const { latitude, longitude } = req.body;

            if (latitude === undefined || longitude === undefined) {
                await createAuditLog(userId, AUDIT_ACTIONS.GEO_VIOLATION, req, {
                    reason: "Missing location coordinates",
                });
                res.status(400).json({
                    error: "Location coordinates are required for attendance",
                    code: "LOCATION_REQUIRED",
                    required: {
                        latitude: "number (e.g., 28.6139)",
                        longitude: "number (e.g., 77.2090)",
                    },
                });
                return;
            }

            // Sanitize and validate location coordinates
            const userLocation = sanitizeLocation(latitude, longitude);
            if (!userLocation) {
                await createAuditLog(userId, AUDIT_ACTIONS.GEO_VIOLATION, req, {
                    reason: "Invalid location coordinates",
                    providedLatitude: latitude,
                    providedLongitude: longitude,
                });
                res.status(400).json({
                    error: "Invalid location coordinates",
                    code: "INVALID_COORDINATES",
                    details: {
                        latitude: "Must be between -90 and 90",
                        longitude: "Must be between -180 and 180",
                    },
                });
                return;
            }

            // Store validated location in request for use by other middleware
            req.validatedLocation = userLocation;

            // Get campus geo configuration
            let geoConfig;
            try {
                geoConfig = getGeoConfig();
            } catch (error) {
                console.error("[GEO] Failed to load geo configuration:", error);
                await createAuditLog(userId, AUDIT_ACTIONS.GEO_VIOLATION, req, {
                    reason: "Geo configuration error",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
                res.status(500).json({
                    error: "Location verification temporarily unavailable",
                    code: "GEO_CONFIG_ERROR",
                });
                return;
            }

            // Check if user is within campus boundaries
            const withinCampus = isWithinCampus(userLocation, geoConfig);

            if (!withinCampus) {
                const locationLog = formatLocationForLog(
                    userLocation,
                    geoConfig,
                );

                await createAuditLog(
                    userId,
                    AUDIT_ACTIONS.GEO_VIOLATION,
                    req,
                    {
                        reason: "Location outside campus boundaries",
                        userLocation: locationLog,
                        campusRadius: geoConfig.campusRadius,
                    },
                    locationLog,
                );

                res.status(403).json({
                    error: "Attendance can only be marked from within campus boundaries",
                    code: "OUTSIDE_CAMPUS",
                    location: {
                        provided: {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        },
                        campus: {
                            latitude: geoConfig.campusLatitude,
                            longitude: geoConfig.campusLongitude,
                            radius: geoConfig.campusRadius,
                        },
                    },
                });
                return;
            }

            // Location is valid, log successful verification
            console.log(
                `[GEO] Valid location verified for user ${userId}: ${formatLocationForLog(userLocation, geoConfig)}`,
            );

            // Continue to next middleware
            next();
        } catch (error) {
            console.error("[GEO] Geo-lock check failed:", error);

            // Log the error for audit purposes
            if (req.user?.id) {
                await createAuditLog(
                    req.user.id,
                    AUDIT_ACTIONS.GEO_VIOLATION,
                    req,
                    {
                        reason: "Geo-lock check error",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    },
                );
            }

            res.status(500).json({
                error: "Location verification failed",
                code: "GEO_CHECK_ERROR",
            });
            return;
        }
    };
}

/**
 * Middleware for optional geo-locking (development/testing mode)
 * Can be used when geo-locking needs to be bypassed for testing
 */
export function checkGeoLockOptional() {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Check if geo-locking is disabled in development
        if (
            process.env.NODE_ENV === "development" &&
            process.env.DISABLE_GEO_LOCK === "true"
        ) {
            console.log("[GEO] Geo-locking disabled in development mode");
            next();
            return;
        }

        // Otherwise, use normal geo-locking
        return checkGeoLock()(req, res, next);
    };
}

/**
 * Validates location data format in request
 * Can be used as a pre-validation step
 */
export function validateLocationRequest() {
    return (req: Request, res: Response, next: NextFunction) => {
        const { latitude, longitude } = req.body;

        // Check if location is provided
        if (latitude === undefined || longitude === undefined) {
            res.status(400).json({
                error: "Location coordinates are required",
                code: "LOCATION_MISSING",
                required: ["latitude", "longitude"],
            });
            return;
        }

        // Check if coordinates are numbers
        if (typeof latitude !== "number" || typeof longitude !== "number") {
            res.status(400).json({
                error: "Location coordinates must be numbers",
                code: "LOCATION_TYPE_ERROR",
                provided: {
                    latitude: typeof latitude,
                    longitude: typeof longitude,
                },
            });
            return;
        }

        next();
    };
}

/**
 * Middleware to log location attempts for analytics
 * Useful for understanding usage patterns and optimizing campus boundaries
 */
export function logLocationAttempt() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user?.id && req.body.latitude && req.body.longitude) {
                const userLocation = sanitizeLocation(
                    req.body.latitude,
                    req.body.longitude,
                );
                if (userLocation) {
                    // Log location attempt for analytics (non-audit)
                    console.log(
                        `[GEO ANALYTICS] Location attempt by ${req.user.id}: ${userLocation.latitude},${userLocation.longitude}`,
                    );
                }
            }
        } catch (error) {
            // Don't fail the request if logging fails
            console.error("[GEO] Failed to log location attempt:", error);
        }

        next();
    };
}

/**
 * Gets current geo configuration safely
 * Returns configuration or null if not available
 */
export async function getCurrentGeoConfig() {
    try {
        return getGeoConfig();
    } catch (error) {
        console.error("[GEO] Failed to get geo configuration:", error);
        return null;
    }
}

/**
 * Checks if geo-locking is properly configured
 * Returns true if all required environment variables are set
 */
export function isGeoLockConfigured(): boolean {
    try {
        getGeoConfig();
        return true;
    } catch (error) {
        return false;
    }
}
