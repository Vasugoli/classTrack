// src/lib/productivityApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getSuggestions() {
	const res = await fetch(`${API_BASE_URL}/productivity/suggestions`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getTasks() {
	const res = await fetch(`${API_BASE_URL}/productivity/tasks`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function createTask(data: {
	title: string;
	description?: string;
	category: string;
	priority?: number;
	dueDate?: string;
}) {
	const res = await fetch(`${API_BASE_URL}/productivity/tasks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function updateTask(taskId: string, data: any) {
	const res = await fetch(`${API_BASE_URL}/productivity/tasks/${taskId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function deleteTask(taskId: string) {
	const res = await fetch(`${API_BASE_URL}/productivity/tasks/${taskId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
