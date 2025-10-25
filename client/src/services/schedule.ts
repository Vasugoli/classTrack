/**
 * ====================================================================
 * Schedule API
 * ====================================================================
 * Manage class schedules
 */

import { get, post, patch, del } from "./client";
import type { Schedule } from "./types";

export const scheduleAPI = {
	/**
	 * List all schedules for current user
	 * @returns Promise with user's schedules
	 */
	list: () => get<{ schedules: Schedule[] }>("/schedule"),

	/**
	 * Create a new schedule entry
	 * @param data - Schedule data
	 * @returns Promise with created schedule
	 */
	create: (data: {
		classCode: string;
		dayOfWeek: number; // 0-6 (Sunday-Saturday)
		startTime: string; // "HH:MM" format
		endTime: string; // "HH:MM" format
	}) => post<{ schedule: Schedule }>("/schedule", data),

	/**
	 * Update a schedule entry
	 * @param id - Schedule ID
	 * @param data - Updated schedule data
	 * @returns Promise with updated schedule
	 */
	update: (id: string, data: Partial<Schedule>) =>
		patch<{ schedule: Schedule }>(`/schedule/${id}`, data),

	/**
	 * Delete a schedule entry
	 * @param id - Schedule ID
	 * @returns Promise with success message
	 */
	remove: (id: string) => del<{ message: string }>(`/schedule/${id}`),
};
