import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesAPI, type Class } from "@/services";
import toast from "react-hot-toast";

export function useClasses(all?: boolean) {
	return useQuery<{ classes: Class[] }>({
		queryKey: ["classes", all],
		queryFn: () => classesAPI.list(all),
	});
}

export function useCreateClass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: classesAPI.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			toast.success("Class created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create class");
		},
	});
}
