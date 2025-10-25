/**
 * ====================================================================
 * Users API
 * ====================================================================
 * User management (Admin/Teacher access)
 */

import { get, patch, del } from "./client";
import type { User } from "./types";

export const usersAPI = {
	/**
	 * Get current user profile
	 * @returns Promise with user data
	 */
	getProfile: () => get<{ user: User }>("/users/profile"),

	/**
	 * Update current user profile
	 * @param data - Updated profile data
	 * @returns Promise with updated user
	 */
	updateProfile: (data: Partial<User>) =>
		patch<{ user: User }>("/users/profile", data),

	/**
	 * List all users (Admin/Teacher only)
	 * @param role - Filter by role
	 * @returns Promise with users array
	 */
	listUsers: (role?: "STUDENT" | "TEACHER" | "ADMIN") => {
		const query = role ? `?role=${role}` : "";
		return get<{ users: User[] }>(`/users/all${query}`);
	},

	/**
	 * Update user role (Admin only)
	 * @param userId - User ID
	 * @param role - New role
	 * @returns Promise with updated user
	 */
	updateUserRole: (userId: string, role: "STUDENT" | "TEACHER" | "ADMIN") =>
		patch<{ user: User }>(`/users/${userId}/role`, { role }),

	/**
	 * Delete a user (Admin/Teacher)
	 * @param userId - User ID to delete
	 * @returns Promise with success message
	 */
	deleteUser: (userId: string) =>
		del<{ message: string }>(`/users/${userId}`),
};
