/**
 * ====================================================================
 * Attendance API
 * ====================================================================
 * Track and manage attendance records
 */

import { get, post } from "./client";
import type { Attendance } from "./types";

export const attendanceAPI = {
	/**
	 * Mark attendance for a class
	 * @param data - Attendance marking data
	 * @returns Promise with attendance record
	 */
	mark: (data: {
		classCode: string;
		sessionToken?: string;
		status?: "PRESENT" | "ABSENT" | "LATE";
		latitude?: number;
		longitude?: number;
	}) =>
		post<{ attendance: Attendance; message: string }>(
			"/attendance/mark",
			data
		),

	/**
	 * Get today's attendance records for current user
	 * @returns Promise with today's attendance
	 */
	today: () => get<{ attendances: Attendance[] }>("/attendance/today"),

	/**
	 * Get attendance history for current user
	 * @param limit - Number of records to fetch
	 * @param offset - Pagination offset
	 * @returns Promise with attendance history
	 */
	history: (limit?: number, offset?: number) => {
		const params = new URLSearchParams();
		if (limit) params.append("limit", limit.toString());
		if (offset) params.append("offset", offset.toString());
		const query = params.toString() ? `?${params.toString()}` : "";
		return get<{ attendances: Attendance[] }>(
			`/attendance/history${query}`
		);
	},

	/**
	 * Get attendance records for a specific class
	 * @param classId - Class ID
	 * @returns Promise with class attendance records
	 */
	getByClass: (classId: string) =>
		get<{ attendances: Attendance[] }>(`/attendance/class/${classId}`),

	/**
	 * Generate session token for attendance (teacher only)
	 * @param classId - Class ID
	 * @param expiresIn - Token expiration in minutes
	 * @returns Promise with session token
	 */
	generateToken: (classId: string, expiresIn?: number) =>
		post<{ token: string; expiresAt: string }>("/attendance/token", {
			classId,
			expiresIn,
		}),
};
