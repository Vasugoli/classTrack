/**
 * ====================================================================
 * Type Definitions
 * ====================================================================
 *
 * All TypeScript interfaces for API entities
 */

/**
 * User entity representing a system user
 */
export interface User {
	id: string;
	email: string;
	name: string;
	role: "STUDENT" | "TEACHER" | "ADMIN";
	enrollmentNo?: string;
	year?: number;
	branch?: string;
	interests?: string[];
	goals?: string[];
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Class entity representing a course/class
 */
export interface Class {
	id: string;
	name: string;
	code: string;
	teacherId: string;
	room?: string;
	qrCode?: string;
	createdAt?: string;
}

/**
 * Attendance record for a user in a class
 */
export interface Attendance {
	id: string;
	userId: string;
	classId: string;
	date: string;
	status: "PRESENT" | "ABSENT" | "LATE";
	markedBy?: string;
	class?: Class;
	user?: User;
}

/**
 * Schedule entry for a class session
 */
export interface Schedule {
	id: string;
	userId: string;
	classId: string;
	dayOfWeek: number; // 0 = Sunday, 6 = Saturday
	startTime: string; // Format: "HH:MM"
	endTime: string; // Format: "HH:MM"
	class?: Class;
}

/**
 * Task/Todo item for productivity tracking
 */
export interface Task {
	id: string;
	userId: string;
	title: string;
	description?: string;
	category: string; // "academic", "career", "skill"
	priority: number; // 1-5
	completed: boolean;
	dueDate?: string;
	createdAt: string;
}

/**
 * Device binding for security
 */
export interface DeviceBinding {
	id: string;
	userId: string;
	deviceHash: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Audit log entry
 */
export interface AuditLog {
	id: string;
	userId: string;
	action: string;
	ipAddress?: string;
	deviceId?: string;
	location?: string;
	timestamp: string;
	details?: any;
}

/**
 * Suggestion from AI
 */
export interface Suggestion {
	title: string;
	description: string;
	category: string;
}
