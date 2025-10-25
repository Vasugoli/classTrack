/**
 * ====================================================================
 * Classes API
 * ====================================================================
 * Manage classes/courses
 */

import { get, post } from "./client";
import type { Class } from "./types";

export const classesAPI = {
	/**
	 * List classes
	 * @param all - If true, fetch all classes (admin/teacher only)
	 * @returns Promise with array of classes
	 */
	list: (all?: boolean) =>
		get<{ classes: Class[] }>(`/classes${all ? "?all=1" : ""}`),

	/**
	 * Create a new class
	 * @param data - Class data
	 * @returns Promise with created class
	 */
	create: (data: {
		name: string;
		code: string;
		room?: string;
		qrCode?: string;
		teacherId?: string;
	}) => post<{ class: Class }>("/classes", data),

	/**
	 * Get class by ID
	 * @param id - Class ID
	 * @returns Promise with class data
	 */
	getById: (id: string) => get<{ class: Class }>(`/classes/${id}`),
};
