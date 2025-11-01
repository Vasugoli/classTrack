// src/lib/index.ts
/**
 * Central export for all API modules
 * Import specific API modules from this single location
 */

export * as authApi from "./authApi";
export * as usersApi from "./usersApi";
export * as attendanceApi from "./attendanceApi";
export * as classesApi from "./classesApi";
export * as scheduleApi from "./scheduleApi";
export * as productivityApi from "./productivityApi";
export * as deviceApi from "./deviceApi";
export * as auditApi from "./auditApi";

export const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";
