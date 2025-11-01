import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useProductivityStore } from "@/store/productivityStore";
import { Link } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Dashboard() {
	const user = useAuthStore((s) => s.user);
	const { todayAttendance = [], getTodayAttendance } = useAttendanceStore();
	const { schedules = [], getSchedule } = useScheduleStore();
	const { tasks = [], getTasks } = useProductivityStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		await Promise.all([getTodayAttendance(), getSchedule(), getTasks()]);
		setLoading(false);
	};

	const getTodaySchedule = () => {
		const today = new Date().getDay(); // 0=Sunday, 6=Saturday
		return schedules.filter((s) => s.dayOfWeek === today);
	};

	const getAttendancePercentage = () => {
		if (todayAttendance.length === 0) return 0;
		const present = todayAttendance.filter(
			(a: any) => a.status === "PRESENT"
		).length;
		return Math.round((present / todayAttendance.length) * 100);
	};

	const todaySchedule = getTodaySchedule();
	const attendancePercentage = getAttendancePercentage();
	const pendingTasks = tasks.filter((t) => !t.completed);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	return (
		<Page>
			<PageHeader
				title={
					<span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
						Welcome back, {user?.name}! 👋
					</span>
				}
				subtitle={"Here's your overview for today"}
			/>

			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatCard
					title='Attendance Rate'
					value={`${attendancePercentage}%`}
					icon='📊'
					color='blue'
				/>
				<StatCard
					title='Today Sessions'
					value={todayAttendance.length.toString()}
					icon='📅'
					color='green'
				/>
				<StatCard
					title='Pending Tasks'
					value={pendingTasks.length.toString()}
					icon='✅'
					color='purple'
				/>
				<StatCard
					title='Classes Today'
					value={todaySchedule.length.toString()}
					icon='🎓'
					color='pink'
				/>
			</div>

			{/* Main Content Grid */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Today's Schedule */}
				<Card>
					<CardHeader className='p-6 flex items-center justify-between'>
						<CardTitle>📅 Today's Schedule</CardTitle>
						<Link
							to='/schedule'
							className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
							View All
						</Link>
					</CardHeader>
					{todaySchedule.length === 0 ? (
						<CardBody>
							<p className='text-gray-500 text-center py-8'>
								No classes scheduled for today
							</p>
						</CardBody>
					) : (
						<CardBody className='space-y-3'>
							{todaySchedule.map((item) => (
								<div
									key={item.id}
									className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
									<div className='flex items-center justify-between'>
										<div>
											<h3 className='font-semibold text-gray-800'>
												{item.class?.name || "Unknown"}
											</h3>
											<p className='text-sm text-gray-600'>
												{item.class?.code || "N/A"} •
												Room {item.class?.room || "TBA"}
											</p>
										</div>
										<div className='text-right'>
											<p className='text-sm font-medium text-blue-600'>
												{item.startTime} -{" "}
												{item.endTime}
											</p>
										</div>
									</div>
								</div>
							))}
						</CardBody>
					)}
				</Card>

				{/* Recent Attendance */}
				<Card>
					<CardHeader className='p-6 flex items-center justify-between'>
						<CardTitle>✅ Today's Attendance</CardTitle>
						<Link
							to='/attendance'
							className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
							View All
						</Link>
					</CardHeader>
					{todayAttendance.length === 0 ? (
						<CardBody>
							<p className='text-gray-500 text-center py-8'>
								No attendance records for today
							</p>
						</CardBody>
					) : (
						<CardBody className='space-y-3'>
							{todayAttendance.slice(0, 5).map((item: any) => (
								<div
									key={item.id}
									className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
									<div className='flex items-center justify-between'>
										<div>
											<h3 className='font-semibold text-gray-800'>
												{item.class.name}
											</h3>
											<p className='text-sm text-gray-600'>
												{item.class.code}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${
												item.status === "PRESENT"
													? "bg-green-100 text-green-700"
													: item.status === "LATE"
													? "bg-yellow-100 text-yellow-700"
													: "bg-red-100 text-red-700"
											}`}>
											{item.status}
										</span>
									</div>
								</div>
							))}
						</CardBody>
					)}
				</Card>

				{/* Pending Tasks */}
				<Card className='lg:col-span-2'>
					<CardHeader className='p-6 flex items-center justify-between'>
						<CardTitle>🎯 Pending Tasks</CardTitle>
						<Link
							to='/productivity'
							className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
							View All
						</Link>
					</CardHeader>
					{pendingTasks.length === 0 ? (
						<CardBody>
							<p className='text-gray-500 text-center py-8'>
								No pending tasks. Great job! 🎉
							</p>
						</CardBody>
					) : (
						<CardBody className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{pendingTasks.slice(0, 4).map((task) => (
								<div
									key={task.id}
									className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
									<h3 className='font-semibold text-gray-800 mb-1'>
										{task.title}
									</h3>
									<div className='flex items-center justify-between'>
										<span className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded'>
											{task.category}
										</span>
										{task.dueDate && (
											<span className='text-xs text-gray-600'>
												Due:{" "}
												{new Date(
													task.dueDate
												).toLocaleDateString()}
											</span>
										)}
									</div>
								</div>
							))}
						</CardBody>
					)}
				</Card>
			</div>
		</Page>
	);
}
function StatCard({
	title,
	value,
	icon,
	color,
}: {
	title: string;
	value: string;
	icon: string;
	color: "blue" | "green" | "purple" | "pink";
}) {
	const colorClasses = {
		blue: "from-blue-500 to-blue-600",
		green: "from-green-500 to-green-600",
		purple: "from-purple-500 to-purple-600",
		pink: "from-pink-500 to-pink-600",
	};

	return (
		<div
			className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-white/80 text-sm mb-1'>{title}</p>
					<p className='text-3xl font-bold'>{value}</p>
				</div>
				<div className='text-4xl opacity-80'>{icon}</div>
			</div>
		</div>
	);
}
