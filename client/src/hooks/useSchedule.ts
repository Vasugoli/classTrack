import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleAPI, type Schedule } from "@/services";
import toast from "react-hot-toast";

export function useSchedules() {
	return useQuery<{ schedules: Schedule[] }>({
		queryKey: ["schedules"],
		queryFn: scheduleAPI.list,
	});
}

export function useCreateSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: scheduleAPI.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["schedules"] });
			toast.success("Schedule added successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add schedule");
		},
	});
}

export function useDeleteSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: scheduleAPI.remove,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["schedules"] });
			toast.success("Schedule removed successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove schedule");
		},
	});
}
