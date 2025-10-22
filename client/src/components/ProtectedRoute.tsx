import { useAuthStore } from "@/store/authStore";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function ProtectedRoute() {
	const user = useAuthStore((s) => s.user);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate({ to: "/login" });
		}
	}, [user, navigate]);

	if (!user) {
		return null;
	}
	return <Outlet />;
}
