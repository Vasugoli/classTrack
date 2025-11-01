// src/lib/classesApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getClasses() {
	const res = await fetch(`${API_BASE_URL}/classes`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function createClass(data: {
	name: string;
	code: string;
	teacherId: string;
	room?: string;
}) {
	const res = await fetch(`${API_BASE_URL}/classes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function updateClass(classId: string, data: any) {
	const res = await fetch(`${API_BASE_URL}/classes/${classId}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function deleteClass(classId: string) {
	const res = await fetch(`${API_BASE_URL}/classes/${classId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
