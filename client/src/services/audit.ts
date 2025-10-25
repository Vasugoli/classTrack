/**
 * ====================================================================
 * Audit API
 * ====================================================================
 * Security audit logs (Admin only)
 */

import { get } from "./client";
import type { AuditLog } from "./types";

export const auditAPI = {
	/**
	 * Get audit logs
	 * @param params - Filter parameters
	 * @returns Promise with audit logs
	 */
	getLogs: (params?: {
		page?: number;
		limit?: number;
		action?: string;
		userId?: string;
	}) => {
		const query = new URLSearchParams();
		if (params?.page) query.append("page", params.page.toString());
		if (params?.limit) query.append("limit", params.limit.toString());
		if (params?.action) query.append("action", params.action);
		if (params?.userId) query.append("userId", params.userId);
		const queryString = query.toString() ? `?${query.toString()}` : "";
		return get<{ logs: AuditLog[]; total: number }>(
			`/audit/logs${queryString}`
		);
	},

	/**
	 * Get audit statistics
	 * @returns Promise with audit stats
	 */
	getStats: () => get<{ stats: any }>("/audit/stats"),

	/**
	 * Export audit logs to CSV
	 * @returns Promise with CSV data
	 */
	exportLogs: () => get<Blob>("/audit/export"),
};
