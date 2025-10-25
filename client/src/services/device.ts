/**
 * ====================================================================
 * Device Binding API
 * ====================================================================
 * Secure device management for attendance
 */

import { get, post, del } from "./client";
import type { DeviceBinding } from "./types";

export const deviceAPI = {
	/**
	 * Bind current device to user account
	 * @param data - Device information
	 * @returns Promise with binding confirmation
	 */
	bind: (data: {
		userAgent: string;
		platform: string;
		additionalEntropy?: string;
	}) =>
		post<{ binding: DeviceBinding; message: string }>("/device/bind", data),

	/**
	 * Get device binding info for current user
	 * @returns Promise with device binding status
	 */
	getInfo: () =>
		get<{ status: string; binding?: DeviceBinding }>("/device/info"),

	/**
	 * Remove device binding (Admin only)
	 * @returns Promise with success message
	 */
	unbind: () => del<{ message: string }>("/device/unbind"),

	/**
	 * Validate current device
	 * @returns Promise with validation result
	 */
	validate: () =>
		post<{ valid: boolean; message: string }>("/device/validate"),
};
