import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
	withCredentials: true,
});

// Auth
export const authAPI = {
	register: (data: {
		email: string;
		name: string;
		password: string;
		role?: "STUDENT" | "TEACHER" | "ADMIN";
		enrollmentNo?: string;
	}) => api.post("/auth/register", data),
	login: (data: {
		email: string;
		password: string;
		role?: "STUDENT" | "TEACHER" | "ADMIN";
	}) => api.post("/auth/login", data),
	logout: () => api.post("/auth/logout"),
};

// Classes
export const classesAPI = {
	list: (all?: boolean) => api.get(`/classes${all ? "?all=1" : ""}`),
	create: (data: {
		name: string;
		code: string;
		room?: string;
		qrCode?: string;
		teacherId?: string;
	}) => api.post("/classes", data),
};

// Attendance
export const attendanceAPI = {
	mark: (data: {
		classCode: string;
		status?: "PRESENT" | "ABSENT" | "LATE";
	}) => api.post("/attendance/mark", data),
	today: () => api.get("/attendance/today"),
	history: () => api.get("/attendance/history"),
	getByClass: (classId: string) => api.get(`/attendance/class/${classId}`),
};

// Schedule
export const scheduleAPI = {
	list: () => api.get("/schedule"),
	create: (data: {
		classCode: string;
		dayOfWeek: number;
		startTime: string;
		endTime: string;
	}) => api.post("/schedule", data),
	remove: (id: string) => api.delete(`/schedule/${id}`),
};

// Productivity / Tasks
export const productivityAPI = {
	suggestions: () => api.get("/productivity/suggestions"),
	tasks: {
		list: () => api.get("/productivity/tasks"),
		create: (data: {
			title: string;
			description?: string;
			category?: string;
			priority?: number;
			dueDate?: string;
		}) => api.post("/productivity/tasks", data),
		update: (id: string, data: any) =>
			api.patch(`/productivity/tasks/${id}`, data),
		remove: (id: string) => api.delete(`/productivity/tasks/${id}`),
	},
};

// Users Management (Admin/Teacher)
export const usersAPI = {
	listUsers: () => api.get("/users/all"),
	updateUserRole: (userId: string, role: "STUDENT" | "TEACHER" | "ADMIN") =>
		api.patch(`/users/${userId}/role`, { role }),
	deleteUser: (userId: string) => api.delete(`/users/${userId}`),
};

export default api;
