// src/lib/usersApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getProfile() {
	const res = await fetch(`${API_BASE_URL}/users/profile`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function updateProfile(data: any) {
	const res = await fetch(`${API_BASE_URL}/users/profile`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getAllUsers() {
	const res = await fetch(`${API_BASE_URL}/users/all`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function updateUserRole(userId: string, role: string) {
	const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ role }),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function deleteUser(userId: string) {
	const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
