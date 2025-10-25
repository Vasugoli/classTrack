import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, type User } from "@/services";
import toast from "react-hot-toast";

export function useUsers() {
	return useQuery<{ users: User[] }>({
		queryKey: ["users"],
		queryFn: () => usersAPI.listUsers(),
	});
}

export function useUpdateUserRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			role,
		}: {
			userId: string;
			role: "STUDENT" | "TEACHER" | "ADMIN";
		}) => usersAPI.updateUserRole(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User role updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update user role");
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: usersAPI.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete user");
		},
	});
}
