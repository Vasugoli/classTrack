import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productivityAPI, type Task } from "@/services";
import toast from "react-hot-toast";

export function useTasks() {
	return useQuery<{ tasks: Task[] }>({
		queryKey: ["tasks"],
		queryFn: () => productivityAPI.tasks.list(),
	});
}

export function useSuggestions() {
	return useQuery<{ suggestions: any[] }>({
		queryKey: ["suggestions"],
		queryFn: productivityAPI.suggestions,
	});
}

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: productivityAPI.tasks.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create task");
		},
	});
}

export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
			productivityAPI.tasks.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update task");
		},
	});
}

export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: productivityAPI.tasks.remove,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete task");
		},
	});
}
