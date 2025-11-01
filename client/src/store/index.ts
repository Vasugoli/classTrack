// src/store/index.ts
/**
 * Central export for all Zustand stores
 * Import all stores from this single location
 */

export { useAuthStore } from "./authStore";
export type { User, Role } from "./authStore";

export { useUsersStore } from "./usersStore";
export { useAttendanceStore } from "./attendanceStore";
export { useClassesStore } from "./classesStore";
export { useScheduleStore } from "./scheduleStore";
export { useProductivityStore } from "./productivityStore";
export { useDeviceStore } from "./deviceStore";
export { useAuditStore } from "./auditStore";
