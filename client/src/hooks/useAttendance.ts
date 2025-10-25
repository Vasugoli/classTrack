import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceAPI, type Attendance } from "@/services";
import toast from "react-hot-toast";

export function useTodayAttendance() {
	return useQuery<{ attendances: Attendance[] }>({
		queryKey: ["attendance", "today"],
		queryFn: attendanceAPI.today,
	});
}

export function useAttendanceHistory() {
	return useQuery<{ attendances: Attendance[] }>({
		queryKey: ["attendance", "history"],
		queryFn: () => attendanceAPI.history(),
	});
}

export function useClassAttendance(classId: string) {
	return useQuery<{ attendances: Attendance[] }>({
		queryKey: ["attendance", "class", classId],
		queryFn: () => attendanceAPI.getByClass(classId),
		enabled: !!classId,
	});
}

export function useMarkAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: attendanceAPI.mark,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
			toast.success("Attendance marked successfully! ✅");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to mark attendance");
		},
	});
}
