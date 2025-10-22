import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
	id: string;
	email: string;
	name: string;
	role: Role;
}

interface AuthState {
	user: User | null;
	setUser: (u: User | null) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (u) => set({ user: u }),
			logout: () => set({ user: null }),
		}),
		{ name: "auth-storage" }
	)
);
