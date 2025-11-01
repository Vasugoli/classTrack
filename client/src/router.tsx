import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import App from "@/App";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Schedule from "@/pages/Schedule";
import Productivity from "@/pages/Productivity";
import Profile from "@/pages/Profile";
import Users from "@/pages/Users";
import Classes from "@/pages/Classes";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import DeviceManagement from "@/pages/DeviceManagement";
import AuditLogs from "@/pages/AuditLogs";

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: App,
});
const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: Login,
});
const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: Register,
});

const protectedRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "protected",
	component: ProtectedRoute,
});

// Teacher-only routes
const teacherRoute = createRoute({
	getParentRoute: () => protectedRoute,
	id: "teacher-only",
	component: () => <RoleProtectedRoute allowedRoles={["TEACHER", "ADMIN"]} />,
});

// Admin-only routes
const adminRoute = createRoute({
	getParentRoute: () => protectedRoute,
	id: "admin-only",
	component: () => <RoleProtectedRoute allowedRoles={["ADMIN"]} />,
});

const dashboardRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/dashboard",
	component: Dashboard,
});
const attendanceRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/attendance",
	component: Attendance,
});
const scheduleRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/schedule",
	component: Schedule,
});
const productivityRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/productivity",
	component: Productivity,
});
const profileRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/profile",
	component: Profile,
});
const usersRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/users",
	component: Users,
});
const classesRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/classes",
	component: Classes,
});
const teacherDashboardRoute = createRoute({
	getParentRoute: () => teacherRoute,
	path: "/teacher",
	component: TeacherDashboard,
});
const adminDashboardRoute = createRoute({
	getParentRoute: () => adminRoute,
	path: "/admin",
	component: AdminDashboard,
});
const deviceManagementRoute = createRoute({
	getParentRoute: () => protectedRoute,
	path: "/devices",
	component: DeviceManagement,
});
const auditLogsRoute = createRoute({
	getParentRoute: () => adminRoute,
	path: "/audit",
	component: AuditLogs,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	protectedRoute.addChildren([
		dashboardRoute,
		attendanceRoute,
		scheduleRoute,
		productivityRoute,
		profileRoute,
		usersRoute,
		classesRoute,
		deviceManagementRoute,
		teacherRoute.addChildren([teacherDashboardRoute]),
		adminRoute.addChildren([adminDashboardRoute, auditLogsRoute]),
	]),
]);

export const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	Wrap: ({ children }) => (
		<>
			{children}
			<TanStackRouterDevtools router={router} initialIsOpen={false} />
		</>
	),
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
