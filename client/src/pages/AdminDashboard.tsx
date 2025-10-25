import { useState, useEffect } from "react";
import { usersAPI, classesAPI, attendanceAPI } from "@/services";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";

interface Stats {
	totalUsers: number;
	totalStudents: number;
	totalTeachers: number;
	totalAdmins: number;
	totalClasses: number;
	todayAttendance: number;
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<Stats>({
		totalUsers: 0,
		totalStudents: 0,
		totalTeachers: 0,
		totalAdmins: 0,
		totalClasses: 0,
		todayAttendance: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			setLoading(true);

			// Fetch users
			const usersRes = await usersAPI.listUsers();
			const users = usersRes.users || [];

			// Fetch classes
			const classesRes = await classesAPI.list(true);
			const classes = classesRes.classes || [];

			// Fetch today's attendance
			const attendanceRes = await attendanceAPI.today();
			const attendance = attendanceRes.attendances || [];

			setStats({
				totalUsers: users.length,
				totalStudents: users.filter((u: any) => u.role === "STUDENT")
					.length,
				totalTeachers: users.filter((u: any) => u.role === "TEACHER")
					.length,
				totalAdmins: users.filter((u: any) => u.role === "ADMIN")
					.length,
				totalClasses: classes.length,
				todayAttendance: attendance.length,
			});
		} catch (err: any) {
			const errorMsg = err?.message || "Failed to fetch statistics";
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<svg
						className='animate-spin h-12 w-12 text-red-600'
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
					<div className='text-lg font-medium text-gray-700'>
						Loading dashboard...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>🔐</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent'>
								Admin Dashboard
							</h1>
							<p className='text-gray-600'>
								System overview and management 🛠️
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className='mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 animate-in flex items-start gap-3'>
						<span className='text-xl'>⚠️</span>
						<span className='flex-1'>{error}</span>
					</div>
				)}

				{/* Statistics Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
					<StatCard
						title='Total Users'
						value={stats.totalUsers}
						icon='👥'
						gradient='from-blue-500 to-blue-600'
						description='All registered users'
					/>
					<StatCard
						title='Students'
						value={stats.totalStudents}
						icon='🎓'
						gradient='from-green-500 to-emerald-600'
						description='Active students'
					/>
					<StatCard
						title='Teachers'
						value={stats.totalTeachers}
						icon='👨‍🏫'
						gradient='from-purple-500 to-purple-600'
						description='Teaching staff'
					/>
					<StatCard
						title='Admins'
						value={stats.totalAdmins}
						icon='🔐'
						gradient='from-red-500 to-red-600'
						description='System administrators'
					/>
					<StatCard
						title='Classes'
						value={stats.totalClasses}
						icon='📚'
						gradient='from-yellow-500 to-orange-600'
						description='Total classes'
					/>
					<StatCard
						title="Today's Attendance"
						value={stats.todayAttendance}
						icon='✅'
						gradient='from-indigo-500 to-indigo-600'
						description='Marked today'
					/>
				</div>

				{/* Quick Actions */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>⚡</span>
						Quick Actions
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<Link
							to='/users'
							className='group p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 transition-all duration-200 transform hover:-translate-y-1'>
							<div className='text-4xl mb-3 group-hover:scale-110 transition-transform duration-200'>
								👥
							</div>
							<div className='font-bold mb-1.5 text-lg text-gray-800'>
								Manage Users
							</div>
							<div className='text-sm text-gray-600'>
								View, edit, and manage all user accounts
							</div>
						</Link>
						<Link
							to='/classes'
							className='group p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 transform hover:-translate-y-1'>
							<div className='text-4xl mb-3 group-hover:scale-110 transition-transform duration-200'>
								📚
							</div>
							<div className='font-bold mb-1.5 text-lg text-gray-800'>
								Manage Classes
							</div>
							<div className='text-sm text-gray-600'>
								Create and manage all classes
							</div>
						</Link>
						<Link
							to='/attendance'
							className='group p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 transition-all duration-200 transform hover:-translate-y-1'>
							<div className='text-4xl mb-3 group-hover:scale-110 transition-transform duration-200'>
								📊
							</div>
							<div className='font-bold mb-1.5 text-lg text-gray-800'>
								View Reports
							</div>
							<div className='text-sm text-gray-600'>
								Attendance and activity reports
							</div>
						</Link>
					</div>
				</div>

				{/* System Information */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>ℹ️</span>
						System Information
					</h2>
					<div className='space-y-3'>
						<InfoRow label='System Version' value='1.0.0' />
						<InfoRow
							label='Database Status'
							value='Connected'
							status='success'
						/>
						<InfoRow
							label='API Status'
							value='Operational'
							status='success'
						/>
						<InfoRow
							label='Last Updated'
							value={new Date().toLocaleDateString()}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
	gradient,
	description,
}: {
	title: string;
	value: number;
	icon: string;
	gradient: string;
	description: string;
}) {
	return (
		<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in hover:-translate-y-1 transition-transform duration-200'>
			<div className='flex items-start justify-between mb-3'>
				<div
					className={`text-4xl p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10`}>
					{icon}
				</div>
				<div
					className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
					{value}
				</div>
			</div>
			<div className='font-bold text-gray-800 mb-1'>{title}</div>
			<div className='text-sm text-gray-600'>{description}</div>
		</div>
	);
}

function InfoRow({
	label,
	value,
	status,
}: {
	label: string;
	value: string;
	status?: "success" | "warning" | "error";
}) {
	const statusColors = {
		success: "text-green-600 font-bold",
		warning: "text-yellow-600 font-bold",
		error: "text-red-600 font-bold",
	};

	const statusIcons = {
		success: "✅",
		warning: "⚠️",
		error: "❌",
	};

	return (
		<div className='flex items-center justify-between py-3 border-b-2 border-gray-100 last:border-0'>
			<span className='text-gray-600 font-medium'>{label}</span>
			<span
				className={`flex items-center gap-2 ${
					status ? statusColors[status] : "text-gray-900 font-medium"
				}`}>
				{status && <span>{statusIcons[status]}</span>}
				{value}
			</span>
		</div>
	);
}
