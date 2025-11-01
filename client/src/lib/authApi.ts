// src/lib/authApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function register(data: {
	email: string;
	name: string;
	password: string;
	role: "STUDENT" | "TEACHER" | "ADMIN";
	enrollmentNo?: string;
}) {
	const res = await fetch(`${API_BASE_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function login(data: {
	email: string;
	password: string;
	role?: "STUDENT" | "TEACHER" | "ADMIN";
}) {
	const res = await fetch(`${API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function logout() {
	const res = await fetch(`${API_BASE_URL}/auth/logout`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
