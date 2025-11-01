// src/store/auditStore.ts
import { create } from "zustand";
import * as auditApi from "../lib/auditApi";

interface AuditLog {
	id: string;
	userId: string;
	action: string;
	details: any;
	ipAddress: string;
	deviceInfo?: string;
	timestamp: string;
	user?: {
		id: string;
		name: string;
		email: string;
		role: string;
		enrollmentNo?: string;
	};
}

interface AuditStats {
	totalLogs: number;
	todayLogs: number;
	suspiciousActivities: number;
	uniqueUsers: number;
	actionBreakdown: Record<string, number>;
	summary?: {
		totalLogs: number;
		recentLogs: number;
		uniqueActiveUsers: number;
		failedAttempts: number;
		dateRange: {
			start: string;
			end: string;
		};
	};
	securityMetrics?: {
		failedAttendanceAttempts: number;
		deviceMismatches: number;
		geoViolations: number;
		suspiciousActivities: number;
	};
}

interface AuditState {
	logs: AuditLog[];
	stats: AuditStats | null;
	userLogs: AuditLog[];
	loading: boolean;
	error: string | null;
	getAuditLogs: (params?: {
		startDate?: string;
		endDate?: string;
		action?: string;
	}) => Promise<void>;
	getAuditStats: () => Promise<void>;
	getUserAuditLogs: (userId: string) => Promise<void>;
	exportAuditLogs: () => Promise<void>;
	cleanupAuditLogs: (params?: { daysOld?: number }) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
	logs: [],
	stats: null,
	userLogs: [],
	loading: false,
	error: null,

	getAuditLogs: async (params) => {
		set({ loading: true, error: null });
		try {
			const response = await auditApi.getAuditLogs(params);
			set({ logs: response.logs || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch audit logs",
				loading: false,
			});
		}
	},

	getAuditStats: async () => {
		set({ loading: true, error: null });
		try {
			const response = await auditApi.getAuditStats();
			// Transform the response to match our AuditStats interface
			const stats: AuditStats = {
				totalLogs: response.summary?.totalLogs || 0,
				todayLogs: response.summary?.recentLogs || 0,
				suspiciousActivities:
					response.securityMetrics?.suspiciousActivities || 0,
				uniqueUsers: response.summary?.uniqueActiveUsers || 0,
				actionBreakdown:
					response.actionBreakdown?.reduce((acc: any, item: any) => {
						acc[item.action] = item.count;
						return acc;
					}, {}) || {},
				summary: response.summary,
				securityMetrics: response.securityMetrics,
			};
			set({ stats, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch audit stats",
				loading: false,
			});
		}
	},

	getUserAuditLogs: async (userId) => {
		set({ loading: true, error: null });
		try {
			const response = await auditApi.getUserAuditLogs(userId);
			set({ userLogs: response.logs || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch user audit logs",
				loading: false,
			});
		}
	},

	exportAuditLogs: async () => {
		set({ loading: true, error: null });
		try {
			await auditApi.exportAuditLogs();
			set({ loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to export audit logs",
				loading: false,
			});
		}
	},

	cleanupAuditLogs: async (params) => {
		set({ loading: true, error: null });
		try {
			await auditApi.cleanupAuditLogs(params);
			set({ loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to cleanup audit logs",
				loading: false,
			});
		}
	},
}));
