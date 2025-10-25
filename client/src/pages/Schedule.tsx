import { useState } from "react";
import {
	useSchedules,
	useCreateSchedule,
	useDeleteSchedule,
} from "@/hooks/useSchedule";
import toast from "react-hot-toast";
import type { Schedule } from "@/services";

export default function Schedule() {
	const [classCode, setClassCode] = useState("");
	const [dayOfWeek, setDayOfWeek] = useState(1);
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("10:00");

	const { data, refetch } = useSchedules();
	const createMutation = useCreateSchedule();
	const deleteMutation = useDeleteSchedule();

	const items = data?.schedules || [];

	const DAYS = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const add = async () => {
		if (!classCode.trim()) {
			toast.error("Please enter a class code");
			return;
		}
		createMutation.mutate(
			{ classCode, dayOfWeek, startTime, endTime },
			{
				onSuccess: () => {
					setClassCode("");
					refetch();
				},
			}
		);
	};

	const remove = async (id: string) => {
		deleteMutation.mutate(id);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'>
			<div className='max-w-5xl mx-auto px-4 py-8'>
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>📅</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
								Schedule
							</h1>
							<p className='text-gray-600'>
								Manage your weekly class schedule 🗓️
							</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>➕</span>
						Add Schedule
					</h2>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end'>
						<div className='sm:col-span-2 space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Class Code
							</label>
							<input
								className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none'
								placeholder='e.g., CS101'
								value={classCode}
								onChange={(e) => setClassCode(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<label
								htmlFor='dayOfWeek'
								className='block text-sm font-semibold text-gray-700'>
								Day
							</label>
							<select
								id='dayOfWeek'
								className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none'
								value={dayOfWeek}
								onChange={(e) =>
									setDayOfWeek(parseInt(e.target.value))
								}>
								{DAYS.map((day, i) => (
									<option key={i} value={i}>
										{day}
									</option>
								))}
							</select>
						</div>
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Start Time
							</label>
							<input
								className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none'
								type='time'
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								placeholder='Select start time'
								title='Start Time'
							/>
						</div>
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								End Time
							</label>
							<input
								className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none'
								type='time'
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								placeholder='Select end time'
								title='End Time'
							/>
						</div>
					</div>
					<button
						className='mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
						onClick={add}
						disabled={createMutation.isPending}>
						{createMutation.isPending
							? "Adding..."
							: "📅 Add to Schedule"}
					</button>
				</div>

				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>📋</span>
						Your Schedule
					</h2>
					{items.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>📅</div>
							<p className='text-gray-500 text-lg'>
								No schedule items yet
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{items.map((s: Schedule) => (
								<div
									key={s.id}
									className='flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-shadow duration-200'>
									<div className='flex items-center gap-3 flex-1'>
										<span className='text-2xl'>📖</span>
										<div>
											<div className='font-bold text-gray-800'>
												{s.class?.name || classCode}
											</div>
											<div className='text-sm text-gray-600'>
												{DAYS[s.dayOfWeek]} •{" "}
												{s.startTime} - {s.endTime}
											</div>
										</div>
									</div>
									<button
										className='px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium'
										onClick={() => remove(s.id)}>
										🗑️ Delete
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
