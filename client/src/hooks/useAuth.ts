import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function useRegister() {
	return useMutation({
		mutationFn: authAPI.register,
		onSuccess: () => {
			toast.success("Registration successful! Please login.");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Registration failed");
		},
	});
}

export function useLogin() {
	const setUser = useAuthStore((s) => s.setUser);

	return useMutation({
		mutationFn: authAPI.login,
		onSuccess: (data) => {
			setUser(data.user);
			toast.success(`Welcome back, ${data.user.name}!`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Login failed");
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const setUser = useAuthStore((s) => s.setUser);

	return useMutation({
		mutationFn: authAPI.logout,
		onSuccess: () => {
			setUser(null);
			queryClient.clear();
			toast.success("Logged out successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Logout failed");
		},
	});
}
