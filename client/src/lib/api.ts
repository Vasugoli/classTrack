/**
 * Modularized API integration using Zustand stores
 *
 * This file serves as a central export for all domain-specific API modules.
 * Each domain has its own API module and Zustand store for state management.
 *
 * Usage:
 * - Import specific API functions: import * as authApi from './authApi'
 * - Use Zustand stores in components: import { useAuthStore } from '../store/authStore'
 *
 * Available modules:
 * - authApi: Authentication (login, logout, register)
 * - usersApi: User management (profile, users CRUD)
 * - attendanceApi: Attendance tracking (mark, generate token, history)
 * - classesApi: Class management (CRUD operations)
 * - scheduleApi: Schedule management (create, delete schedules)
 * - productivityApi: Tasks and suggestions
 * - deviceApi: Device binding and validation
 * - auditApi: Audit logs and stats
 */

// Export all API modules
export * as authApi from "./authApi";
export * as usersApi from "./usersApi";
export * as attendanceApi from "./attendanceApi";
export * as classesApi from "./classesApi";
export * as scheduleApi from "./scheduleApi";
export * as productivityApi from "./productivityApi";
export * as deviceApi from "./deviceApi";
export * as auditApi from "./auditApi";

// Export all Zustand stores
export { useAuthStore } from "../store/authStore";
export { useUsersStore } from "../store/usersStore";
export { useAttendanceStore } from "../store/attendanceStore";
export { useClassesStore } from "../store/classesStore";
export { useScheduleStore } from "../store/scheduleStore";
export { useProductivityStore } from "../store/productivityStore";
export { useDeviceStore } from "../store/deviceStore";
export { useAuditStore } from "../store/auditStore";

// Export API base URL for utility usage
export const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";
