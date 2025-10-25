import { Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useSchedules } from "@/hooks/useSchedule";
import { useTodayAttendance } from "@/hooks/useAttendance";
import { useTasks } from "@/hooks/useTasks";

export default function Dashboard() {
	const user = useAuthStore((s) => s.user);
	const { data: schedulesData, isLoading } = useSchedules();
	const { data: attendanceData } = useTodayAttendance();
	const { data: tasksData } = useTasks();

	const schedules = schedulesData?.schedules || [];
	const pendingTasks =
		tasksData?.tasks?.filter((t) => !t.completed).length || 0;
	const attendanceRate = attendanceData?.attendances?.length || 0;

	// Redirect based on role
	if (user?.role === "TEACHER") {
		return <Navigate to='/teacher' />;
	}
	if (user?.role === "ADMIN") {
		return <Navigate to='/admin' />;
	}

	// Student Dashboard
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl'>
								<span className='text-3xl'>📚</span>
							</div>
							<div>
								<h1 className='text-4xl font-bold text-gray-900'>
									Welcome back, {user?.name?.split(" ")[0]}!
									👋
								</h1>
								<p className='text-gray-600 mt-1'>
									Here's your student dashboard
								</p>
							</div>
						</div>
						<div className='text-sm text-gray-500'>
							{new Date().toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in'>
					<div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-semibold text-gray-600 mb-1'>
									Classes This Week
								</p>
								<p className='text-4xl font-bold text-gray-900'>
									{schedules.length}
								</p>
							</div>
							<div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
								<span className='text-2xl'>📚</span>
							</div>
						</div>
						<div className='mt-4 flex items-center gap-2'>
							<div className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full'>
								Active
							</div>
						</div>
					</div>

					<div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-semibold text-gray-600 mb-1'>
									Attendance Rate
								</p>
								<p className='text-4xl font-bold text-gray-900'>
									{attendanceRate}%
								</p>
							</div>
							<div className='w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
								<span className='text-2xl'>✅</span>
							</div>
						</div>
						<div className='mt-4 flex items-center gap-2'>
							<div className='px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full'>
								Good
							</div>
						</div>
					</div>

					<div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-semibold text-gray-600 mb-1'>
									Tasks Pending
								</p>
								<p className='text-4xl font-bold text-gray-900'>
									{pendingTasks}
								</p>
							</div>
							<div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
								<span className='text-2xl'>🎯</span>
							</div>
						</div>
						<div className='mt-4 flex items-center gap-2'>
							<div className='px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full'>
								On Track
							</div>
						</div>
					</div>
				</div>

				{/* Schedule Section */}
				<div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center'>
								<span className='text-xl'>📅</span>
							</div>
							<h2 className='text-2xl font-bold text-gray-900'>
								This Week's Schedule
							</h2>
						</div>
					</div>

					{isLoading ? (
						<div className='flex items-center justify-center py-12'>
							<svg
								className='animate-spin h-10 w-10 text-blue-600'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
									fill='none'
								/>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								/>
							</svg>
						</div>
					) : schedules.length === 0 ? (
						<div className='text-center py-12'>
							<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4'>
								<span className='text-4xl'>📭</span>
							</div>
							<p className='text-lg font-medium text-gray-600 mb-2'>
								No schedule yet
							</p>
							<p className='text-sm text-gray-500'>
								Add classes from the Schedule page to get
								started
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{schedules.map((s) => (
								<div
									key={s.id}
									className='group flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 hover:shadow-md'>
									<div className='flex items-center gap-4'>
										<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200'>
											<span className='text-xl'>📖</span>
										</div>
										<div>
											<div className='font-bold text-gray-900 text-lg'>
												{s.class?.name}
											</div>
											<div className='text-sm text-gray-600 flex items-center gap-2 mt-1'>
												<span className='px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold'>
													Day {s.dayOfWeek}
												</span>
												<span>•</span>
												<span className='font-medium'>
													{s.startTime} - {s.endTime}
												</span>
											</div>
										</div>
									</div>
									<div className='opacity-0 group-hover:opacity-100 transition-opacity'>
										<span className='text-blue-600 font-semibold text-sm'>
											View →
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
