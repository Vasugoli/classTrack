/**
 * ====================================================================
 * Authentication API
 * ====================================================================
 * Handles user registration, login, and logout
 */

import { post } from "./client";
import type { User } from "./types";

export const authAPI = {
	/**
	 * Register a new user
	 * @param data - User registration data
	 * @returns Promise with user data and success message
	 */
	register: (data: {
		email: string;
		name: string;
		password: string;
		role?: "STUDENT" | "TEACHER" | "ADMIN";
		enrollmentNo?: string;
		year?: number;
		branch?: string;
	}) => post<{ user: User; message: string }>("/auth/register", data),

	/**
	 * Login user
	 * @param data - Login credentials
	 * @returns Promise with user data and auth token (set in cookies)
	 */
	login: (data: {
		email: string;
		password: string;
		role?: "STUDENT" | "TEACHER" | "ADMIN";
	}) => post<{ user: User; message: string }>("/auth/login", data),

	/**
	 * Logout current user
	 * @returns Promise with success message
	 */
	logout: () => post<{ message: string }>("/auth/logout"),
};
