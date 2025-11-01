// src/store/productivityStore.ts
import { create } from "zustand";
import * as productivityApi from "../lib/productivityApi";

export interface Task {
	id: string;
	title: string;
	description?: string;
	category: string;
	priority?: number;
	dueDate?: string;
	completed: boolean;
}

export interface Suggestion {
	title: string;
	category: string;
	description?: string;
	priority?: number;
}

interface ProductivityState {
	tasks: Task[];
	suggestions: Suggestion[];
	loading: boolean;
	error: string | null;
	getSuggestions: () => Promise<void>;
	getTasks: () => Promise<void>;
	createTask: (data: {
		title: string;
		description?: string;
		category: string;
		priority?: number;
		dueDate?: string;
	}) => Promise<void>;
	updateTask: (taskId: string, data: any) => Promise<void>;
	deleteTask: (taskId: string) => Promise<void>;
}

export const useProductivityStore = create<ProductivityState>((set) => ({
	tasks: [],
	suggestions: [],
	loading: false,
	error: null,

	getSuggestions: async () => {
		set({ loading: true, error: null });
		try {
			const response = await productivityApi.getSuggestions();
			set({ suggestions: response.suggestions || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch suggestions",
				loading: false,
			});
		}
	},

	getTasks: async () => {
		set({ loading: true, error: null });
		try {
			const response = await productivityApi.getTasks();
			set({ tasks: response.tasks || [], loading: false });
		} catch (e: any) {
			set({ error: e.error || "Failed to fetch tasks", loading: false });
		}
	},

	createTask: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await productivityApi.createTask(data);
			const newTask = response.task;
			set((state) => ({
				tasks: [...state.tasks, newTask],
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to create task", loading: false });
		}
	},

	updateTask: async (taskId, data) => {
		set({ loading: true, error: null });
		try {
			const response = await productivityApi.updateTask(taskId, data);
			const updatedTask = response.task;
			set((state) => ({
				tasks: state.tasks.map((t) =>
					t.id === taskId ? updatedTask : t
				),
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to update task", loading: false });
		}
	},

	deleteTask: async (taskId) => {
		set({ loading: true, error: null });
		try {
			await productivityApi.deleteTask(taskId);
			set((state) => ({
				tasks: state.tasks.filter((t) => t.id !== taskId),
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to delete task", loading: false });
		}
	},
}));
