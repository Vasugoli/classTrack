// src/lib/auditApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getAuditLogs(params?: {
	startDate?: string;
	endDate?: string;
	action?: string;
}) {
	const queryParams = new URLSearchParams();
	if (params?.startDate) queryParams.append("startDate", params.startDate);
	if (params?.endDate) queryParams.append("endDate", params.endDate);
	if (params?.action) queryParams.append("action", params.action);

	const res = await fetch(
		`${API_BASE_URL}/audit/logs?${queryParams.toString()}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		}
	);
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getAuditStats() {
	const res = await fetch(`${API_BASE_URL}/audit/stats`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getUserAuditLogs(userId: string) {
	const res = await fetch(`${API_BASE_URL}/audit/user/${userId}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function exportAuditLogs() {
	const res = await fetch(`${API_BASE_URL}/audit/export`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function cleanupAuditLogs(params?: { daysOld?: number }) {
	const queryParams = new URLSearchParams();
	if (params?.daysOld)
		queryParams.append("daysOld", params.daysOld.toString());

	const res = await fetch(
		`${API_BASE_URL}/audit/cleanup?${queryParams.toString()}`,
		{
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		}
	);
	if (!res.ok) throw await res.json();
	return res.json();
}
