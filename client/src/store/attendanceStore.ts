// src/store/attendanceStore.ts
import { create } from "zustand";
import * as attendanceApi from "../lib/attendanceApi";

interface AttendanceRecord {
	id: string;
	classCode: string;
	status: string;
	timestamp: string;
}

interface AttendanceState {
	todayAttendance: AttendanceRecord[];
	history: AttendanceRecord[];
	classAttendance: AttendanceRecord[];
	token: string | null;
	loading: boolean;
	error: string | null;
	markAttendance: (data: {
		classCode: string;
		status: "PRESENT" | "ABSENT" | "LATE";
		token: string;
		latitude: number;
		longitude: number;
	}) => Promise<void>;
	generateToken: (
		classId: string,
		expiresInSeconds?: number
	) => Promise<void>;
	getTodayAttendance: () => Promise<void>;
	getAttendanceHistory: (
		startDate?: string,
		endDate?: string
	) => Promise<void>;
	getAttendanceByClass: (classId: string, date?: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
	todayAttendance: [],
	history: [],
	classAttendance: [],
	token: null,
	loading: false,
	error: null,

	markAttendance: async (data) => {
		set({ loading: true, error: null });
		try {
			await attendanceApi.markAttendance(data);
			set({ loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to mark attendance",
				loading: false,
			});
		}
	},

	generateToken: async (classId, expiresInSeconds) => {
		set({ loading: true, error: null });
		try {
			const response = await attendanceApi.generateToken(
				classId,
				expiresInSeconds
			);
			set({ token: response.token, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to generate token",
				loading: false,
			});
		}
	},

	getTodayAttendance: async () => {
		set({ loading: true, error: null });
		try {
			const response = await attendanceApi.getTodayAttendance();
			set({ todayAttendance: response.records || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch today attendance",
				loading: false,
			});
		}
	},

	getAttendanceHistory: async (startDate, endDate) => {
		set({ loading: true, error: null });
		try {
			const response = await attendanceApi.getAttendanceHistory(
				startDate,
				endDate
			);
			set({ history: response.records || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch attendance history",
				loading: false,
			});
		}
	},

	getAttendanceByClass: async (classId, date) => {
		set({ loading: true, error: null });
		try {
			const response = await attendanceApi.getAttendanceByClass(
				classId,
				date
			);
			set({ classAttendance: response.attendance || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch class attendance",
				loading: false,
			});
		}
	},
}));
