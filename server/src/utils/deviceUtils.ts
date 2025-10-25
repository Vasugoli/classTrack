import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Generates a device fingerprint from client-provided device information
 * Combines userAgent, platform, and additional entropy for uniqueness
 */
export function generateDeviceFingerprint(
	userAgent: string,
	platform: string,
	additionalEntropy?: string
): string {
	const combinedString = `${userAgent}|${platform}|${additionalEntropy || ""}`;
	return crypto.createHash("sha256").update(combinedString).digest("hex");
}

/**
 * Hashes a device fingerprint using bcrypt for secure storage
 * Uses salt rounds of 12 for strong security
 */
export async function hashDeviceFingerprint(fingerprint: string): Promise<string> {
	return await bcrypt.hash(fingerprint, 12);
}

/**
 * Verifies a device fingerprint against a stored hash
 * Returns true if the fingerprint matches the hash
 */
export async function verifyDeviceFingerprint(
	fingerprint: string,
	hash: string
): Promise<boolean> {
	return await bcrypt.compare(fingerprint, hash);
}

/**
 * Validates device information format
 * Ensures required fields are present and not empty
 */
export function validateDeviceInfo(userAgent?: string, platform?: string): boolean {
	if (!userAgent || !platform) {
		return false;
	}

	// Basic validation - userAgent and platform should be non-empty strings
	if (typeof userAgent !== "string" || typeof platform !== "string") {
		return false;
	}

	if (userAgent.trim().length === 0 || platform.trim().length === 0) {
		return false;
	}

	// Additional validation - userAgent should look realistic (basic check)
	if (userAgent.length < 10 || userAgent.length > 1000) {
		return false;
	}

	return true;
}

/**
 * Sanitizes device information to prevent injection attacks
 * Removes potentially harmful characters and limits length
 */
export function sanitizeDeviceInfo(deviceInfo: string): string {
	// Remove null bytes and other control characters
	let sanitized = deviceInfo.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

	// Limit length to prevent abuse
	sanitized = sanitized.substring(0, 2000);

	// Trim whitespace
	return sanitized.trim();
}

/**
 * Extracts relevant device information from request headers
 * Returns standardized device info object
 */
export function extractDeviceInfo(headers: Record<string, string | string[] | undefined>) {
	const userAgent = Array.isArray(headers["user-agent"])
		? headers["user-agent"][0]
		: headers["user-agent"] || "";

	// Platform can be extracted from User-Agent or provided separately
	let platform = "";
	if (userAgent) {
		if (userAgent.includes("Windows")) platform = "Windows";
		else if (userAgent.includes("Macintosh")) platform = "macOS";
		else if (userAgent.includes("Linux")) platform = "Linux";
		else if (userAgent.includes("Android")) platform = "Android";
		else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) platform = "iOS";
		else platform = "Unknown";
	}

	return {
		userAgent: sanitizeDeviceInfo(userAgent),
		platform: sanitizeDeviceInfo(platform)
	};
}