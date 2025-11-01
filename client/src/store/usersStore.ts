// src/store/usersStore.ts
import { create } from "zustand";
import * as usersApi from "../lib/usersApi";

export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	enrollmentNo?: string;
	year?: number;
	branch?: string;
	interests?: string[];
	goals?: string[];
}

interface UsersState {
	users: User[];
	profile: User | null;
	loading: boolean;
	error: string | null;
	getProfile: () => Promise<void>;
	updateProfile: (data: any) => Promise<void>;
	getAllUsers: () => Promise<void>;
	updateUserRole: (userId: string, role: string) => Promise<void>;
	deleteUser: (userId: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
	users: [],
	profile: null,
	loading: false,
	error: null,

	getProfile: async () => {
		set({ loading: true, error: null });
		try {
			const response = await usersApi.getProfile();
			set({ profile: response.user || null, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch profile",
				loading: false,
			});
		}
	},

	updateProfile: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await usersApi.updateProfile(data);
			set({ profile: response.user || null, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to update profile",
				loading: false,
			});
		}
	},

	getAllUsers: async () => {
		set({ loading: true, error: null });
		try {
			const response = await usersApi.getAllUsers();
			set({ users: response.users || [], loading: false });
		} catch (e: any) {
			set({ error: e.error || "Failed to fetch users", loading: false });
		}
	},

	updateUserRole: async (userId, role) => {
		set({ loading: true, error: null });
		try {
			await usersApi.updateUserRole(userId, role);
			set({ loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to update user role",
				loading: false,
			});
		}
	},

	deleteUser: async (userId) => {
		set({ loading: true, error: null });
		try {
			await usersApi.deleteUser(userId);
			set((state) => ({
				users: state.users.filter((u) => u.id !== userId),
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to delete user", loading: false });
		}
	},
}));
