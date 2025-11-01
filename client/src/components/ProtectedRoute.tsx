import { Outlet, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function ProtectedRoute() {
	const user = useAuthStore((s) => s.user);
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.navigate({ to: "/login" });
		}
	}, [user, router]);

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

	return <Outlet />;
}
