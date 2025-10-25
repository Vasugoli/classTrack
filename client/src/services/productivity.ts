/**
 * ====================================================================
 * Productivity API
 * ====================================================================
 * Manage tasks and get AI-powered suggestions
 */

import { get, post, patch, del } from "./client";
import type { Task, Suggestion } from "./types";

export const productivityAPI = {
	/**
	 * Get AI-powered productivity suggestions
	 * Based on user's interests, goals, and current tasks
	 * @returns Promise with personalized suggestions
	 */
	suggestions: () =>
		get<{ suggestions: Suggestion[] }>("/productivity/suggestions"),

	/**
	 * Tasks management
	 */
	tasks: {
		/**
		 * List all tasks for current user
		 * @param filter - Optional filter (completed, pending, etc.)
		 * @returns Promise with tasks array
		 */
		list: (filter?: "completed" | "pending" | "overdue") => {
			const query = filter ? `?filter=${filter}` : "";
			return get<{ tasks: Task[] }>(`/productivity/tasks${query}`);
		},

		/**
		 * Create a new task
		 * @param data - Task data
		 * @returns Promise with created task
		 */
		create: (data: {
			title: string;
			description?: string;
			category?: string; // "academic", "career", "skill"
			priority?: number; // 1-5
			dueDate?: string; // ISO date string
		}) => post<{ task: Task }>("/productivity/tasks", data),

		/**
		 * Update an existing task
		 * @param id - Task ID
		 * @param data - Updated task data
		 * @returns Promise with updated task
		 */
		update: (id: string, data: Partial<Task>) =>
			patch<{ task: Task }>(`/productivity/tasks/${id}`, data),

		/**
		 * Delete a task
		 * @param id - Task ID
		 * @returns Promise with success message
		 */
		remove: (id: string) =>
			del<{ message: string }>(`/productivity/tasks/${id}`),

		/**
		 * Toggle task completion status
		 * @param id - Task ID
		 * @returns Promise with updated task
		 */
		toggleComplete: (id: string) =>
			patch<{ task: Task }>(`/productivity/tasks/${id}`, {
				completed: true,
			}),
	},
};
