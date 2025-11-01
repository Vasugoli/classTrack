// src/store/scheduleStore.ts
import { create } from "zustand";
import * as scheduleApi from "../lib/scheduleApi";

interface Schedule {
	id: string;
	classId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	class?: {
		id: string;
		name: string;
		code: string;
		room?: string;
	};
}

interface ScheduleState {
	schedules: Schedule[];
	loading: boolean;
	error: string | null;
	getSchedule: () => Promise<void>;
	createSchedule: (data: {
		classId: string;
		dayOfWeek: number;
		startTime: string;
		endTime: string;
	}) => Promise<void>;
	deleteSchedule: (scheduleId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
	schedules: [],
	loading: false,
	error: null,

	getSchedule: async () => {
		set({ loading: true, error: null });
		try {
			const response = await scheduleApi.getSchedule();
			set({ schedules: response.schedules || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch schedule",
				loading: false,
			});
		}
	},

	createSchedule: async (data) => {
		set({ loading: true, error: null });
		try {
			// map local `classId` to API's expected `classCode`
			const payload = {
				classCode: data.classId,
				dayOfWeek: data.dayOfWeek,
				startTime: data.startTime,
				endTime: data.endTime,
			};
			const response = await scheduleApi.createSchedule(payload);
			const newSchedule = response.schedule;
			set((state) => ({
				schedules: [...state.schedules, newSchedule],
				loading: false,
			}));
		} catch (e: any) {
			set({
				error: e.error || "Failed to create schedule",
				loading: false,
			});
		}
	},

	deleteSchedule: async (scheduleId) => {
		set({ loading: true, error: null });
		try {
			await scheduleApi.deleteSchedule(scheduleId);
			set((state) => ({
				schedules: state.schedules.filter((s) => s.id !== scheduleId),
				loading: false,
			}));
		} catch (e: any) {
			set({
				error: e.error || "Failed to delete schedule",
				loading: false,
			});
		}
	},
}));
