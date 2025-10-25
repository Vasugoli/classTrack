/**
 * ====================================================================
 * API Service Layer - Main Entry Point
 * ====================================================================
 *
 * This is the main entry point for all API calls.
 * Import from here to use any API endpoints.
 *
 * @example
 * // Named imports (recommended)
 * import { authAPI, classesAPI } from '@/services/api';
 * await authAPI.login({ email, password });
 *
 * @example
 * // Default import
 * import api from '@/services/api';
 * await api.auth.login({ email, password });
 */

// Export all types
export * from "./types";

// Export all API modules
export { authAPI } from "./auth";
export { classesAPI } from "./classes";
export { attendanceAPI } from "./attendance";
export { scheduleAPI } from "./schedule";
export { productivityAPI } from "./productivity";
export { usersAPI } from "./users";
export { deviceAPI } from "./device";
export { auditAPI } from "./audit";

// Export core client utilities (for advanced usage)
export {
	fetchAPI,
	get,
	post,
	patch,
	del,
	BASE_URL,
	REQUEST_TIMEOUT,
} from "./client";

// Import all APIs for default export
import { authAPI } from "./auth";
import { classesAPI } from "./classes";
import { attendanceAPI } from "./attendance";
import { scheduleAPI } from "./schedule";
import { productivityAPI } from "./productivity";
import { usersAPI } from "./users";
import { deviceAPI } from "./device";
import { auditAPI } from "./audit";

/**
 * Centralized API client with all endpoints
 *
 * @example
 * import api from '@/services/api';
 * const { user } = await api.auth.login({ email, password });
 * const { classes } = await api.classes.list();
 */
const api = {
	auth: authAPI,
	classes: classesAPI,
	attendance: attendanceAPI,
	schedule: scheduleAPI,
	productivity: productivityAPI,
	users: usersAPI,
	device: deviceAPI,
	audit: auditAPI,
};

export default api;
