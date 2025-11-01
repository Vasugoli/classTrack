import { create } from "zustand";
import * as authApi from "../lib/authApi";

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
	id: string;
	email: string;
	name: string;
	role: Role;
}

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (data: {
		email: string;
		password: string;
		role?: Role;
	}) => Promise<void>;
	logout: () => Promise<void>;
	register: (data: {
		email: string;
		name: string;
		password: string;
		role: Role;
		enrollmentNo?: string;
	}) => Promise<void>;
	setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: false,
	error: null,
	setUser: (u) => set({ user: u }),
	login: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await authApi.login(data);
			set({ user: response.user || null, loading: false });
		} catch (e: any) {
			set({ error: e.error || "Login failed", loading: false });
		}
	},
	logout: async () => {
		set({ loading: true, error: null });
		try {
			await authApi.logout();
			set({ user: null, loading: false });
		} catch (e: any) {
			set({ error: e.error || "Logout failed", loading: false });
		}
	},
	register: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await authApi.register(data);
			set({ user: response.user || null, loading: false });
		} catch (e: any) {
			set({ error: e.error || "Registration failed", loading: false });
		}
	},
}));
