// src/lib/deviceApi.ts

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function bindDevice(data: {
	userAgent: string;
	platform: string;
	additionalEntropy?: string;
}) {
	const res = await fetch(`${API_BASE_URL}/device/bind`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function getDeviceInfo() {
	const res = await fetch(`${API_BASE_URL}/device/info`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function unbindDevice() {
	const res = await fetch(`${API_BASE_URL}/device/unbind`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function listDeviceBindings() {
	const res = await fetch(`${API_BASE_URL}/device/list`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}

export async function validateCurrentDevice() {
	const res = await fetch(`${API_BASE_URL}/device/validate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (!res.ok) throw await res.json();
	return res.json();
}
