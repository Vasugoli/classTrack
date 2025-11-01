import { Outlet, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

interface RoleProtectedRouteProps {
	allowedRoles: string[];
}

export default function RoleProtectedRoute({
	allowedRoles,
}: RoleProtectedRouteProps) {
	const user = useAuthStore((s) => s.user);
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.navigate({ to: "/login" });
		} else if (user.role && !allowedRoles.includes(user.role)) {
			// Redirect to appropriate dashboard based on role
			if (user.role === "STUDENT") {
				router.navigate({ to: "/dashboard" });
			} else if (user.role === "TEACHER") {
				router.navigate({ to: "/teacher" });
			} else if (user.role === "ADMIN") {
				router.navigate({ to: "/admin" });
			}
		}
	}, [user, router, allowedRoles]);

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600'>
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	if (user.role && !allowedRoles.includes(user.role)) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>🚫</div>
					<h1 className='text-2xl font-bold text-gray-800 mb-2'>
						Access Denied
					</h1>
					<p className='text-gray-600 mb-4'>
						You don't have permission to access this page.
					</p>
					<p className='text-sm text-gray-500'>
						Redirecting to your dashboard...
					</p>
				</div>
			</div>
		);
	}

	return <Outlet />;
}
