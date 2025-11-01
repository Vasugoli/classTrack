// src/lib/scheduleApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getSchedule() {
	const res = await fetch(`${API_BASE_URL}/schedule`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function createSchedule(data: {
	classCode: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
}) {
	const res = await fetch(`${API_BASE_URL}/schedule`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function deleteSchedule(scheduleId: string) {
	const res = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
