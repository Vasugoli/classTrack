// src/store/classesStore.ts
import { create } from "zustand";
import * as classesApi from "../lib/classesApi";

interface Class {
	id: string;
	name: string;
	code: string;
	teacherId: string;
	room?: string;
}

interface ClassesState {
	classes: Class[];
	loading: boolean;
	error: string | null;
	getClasses: () => Promise<void>;
	createClass: (data: {
		name: string;
		code: string;
		teacherId: string;
		room?: string;
	}) => Promise<void>;
	updateClass: (classId: string, data: any) => Promise<void>;
	deleteClass: (classId: string) => Promise<void>;
}

export const useClassesStore = create<ClassesState>((set) => ({
	classes: [],
	loading: false,
	error: null,

	getClasses: async () => {
		set({ loading: true, error: null });
		try {
			const response = await classesApi.getClasses();
			set({ classes: response.classes || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch classes",
				loading: false,
			});
		}
	},

	createClass: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await classesApi.createClass(data);
			const newClass = response.class;
			set((state) => ({
				classes: [...state.classes, newClass],
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to create class", loading: false });
		}
	},

	updateClass: async (classId, data) => {
		set({ loading: true, error: null });
		try {
			const response = await classesApi.updateClass(classId, data);
			const updatedClass = response.class;
			set((state) => ({
				classes: state.classes.map((c) =>
					c.id === classId ? updatedClass : c
				),
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to update class", loading: false });
		}
	},

	deleteClass: async (classId) => {
		set({ loading: true, error: null });
		try {
			await classesApi.deleteClass(classId);
			set((state) => ({
				classes: state.classes.filter((c) => c.id !== classId),
				loading: false,
			}));
		} catch (e: any) {
			set({ error: e.error || "Failed to delete class", loading: false });
		}
	},
}));
