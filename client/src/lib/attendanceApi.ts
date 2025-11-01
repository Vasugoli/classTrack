// src/lib/attendanceApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function markAttendance(data: {
	classCode: string;
	status: "PRESENT" | "ABSENT" | "LATE";
	token: string;
	latitude: number;
	longitude: number;
}) {
	const res = await fetch(`${API_BASE_URL}/attendance/mark`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function generateToken(
	classId: string,
	expiresInSeconds: number = 60
) {
	const res = await fetch(`${API_BASE_URL}/attendance/token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ classId, expiresInSeconds }),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getTodayAttendance() {
	const res = await fetch(`${API_BASE_URL}/attendance/today`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getAttendanceHistory(
	startDate?: string,
	endDate?: string
) {
	const params = new URLSearchParams();
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);
	const res = await fetch(
		`${API_BASE_URL}/attendance/history?${params.toString()}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		}
	);
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getAttendanceByClass(classId: string, date?: string) {
	const params = date ? `?date=${date}` : "";
	const res = await fetch(
		`${API_BASE_URL}/attendance/class/${classId}${params}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		}
	);
	if (!res.ok) throw await res.json();
	return res.json();
}
