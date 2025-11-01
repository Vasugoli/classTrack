import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/usersStore";
import { useClassesStore } from "@/store/classesStore";
import { Link } from "@tanstack/react-router";
import { Page } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminDashboard() {
	const { users = [], getAllUsers } = useUsersStore();
	const { classes = [], getClasses } = useClassesStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		await Promise.all([getAllUsers(), getClasses()]);
		setLoading(false);
	};

	const stats = {
		totalUsers: users.length,
		students: users.filter((u) => u.role === "STUDENT").length,
		teachers: users.filter((u) => u.role === "TEACHER").length,
		totalClasses: classes.length,
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	return (
		<Page>
			{/* Header */}
			<div className='bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-lg'>
				<h1 className='text-3xl font-bold mb-2'>Admin Dashboard</h1>
				<p className='text-purple-100'>
					System overview and management
				</p>
			</div>

			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Total Users</p>
					<p className='text-3xl font-bold'>{stats.totalUsers}</p>
				</div>
				<div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Students</p>
					<p className='text-3xl font-bold'>{stats.students}</p>
				</div>
				<div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Teachers</p>
					<p className='text-3xl font-bold'>{stats.teachers}</p>
				</div>
				<div className='bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Classes</p>
					<p className='text-3xl font-bold'>{stats.totalClasses}</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<Link
					to='/users'
					className='bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center'>
					<div className='text-4xl mb-3'>👥</div>
					<h3 className='text-lg font-semibold text-gray-800'>
						Manage Users
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						Add, edit, or remove users
					</p>
				</Link>

				<Link
					to='/classes'
					className='bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center'>
					<div className='text-4xl mb-3'>📚</div>
					<h3 className='text-lg font-semibold text-gray-800'>
						Manage Classes
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						View and create classes
					</p>
				</Link>

				<Link
					to='/attendance'
					className='bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center'>
					<div className='text-4xl mb-3'>📊</div>
					<h3 className='text-lg font-semibold text-gray-800'>
						View Reports
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						Attendance and analytics
					</p>
				</Link>
			</div>

			{/* Recent Activity */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Recent Users */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Users</CardTitle>
					</CardHeader>
					<CardBody>
						{users.slice(0, 5).length === 0 ? (
							<p className='text-gray-500 text-center py-4'>
								No users yet
							</p>
						) : (
							<div className='space-y-3'>
								{users.slice(0, 5).map((user) => (
									<div
										key={user.id}
										className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
										<div>
											<p className='font-medium text-gray-800'>
												{user.name}
											</p>
											<p className='text-sm text-gray-600'>
												{user.email}
											</p>
										</div>
										<span className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded'>
											{user.role}
										</span>
									</div>
								))}
							</div>
						)}
					</CardBody>
				</Card>

				{/* Recent Classes */}
				<Card>
					<CardHeader>
						<CardTitle>Classes</CardTitle>
					</CardHeader>
					<CardBody>
						{classes.slice(0, 5).length === 0 ? (
							<p className='text-gray-500 text-center py-4'>
								No classes yet
							</p>
						) : (
							<div className='space-y-3'>
								{classes.slice(0, 5).map((cls) => (
									<div
										key={cls.id}
										className='p-3 bg-gray-50 rounded-lg'>
										<p className='font-medium text-gray-800'>
											{cls.name}
										</p>
										<p className='text-sm text-gray-600'>
											{cls.code}{" "}
											{cls.room
												? `• Room ${cls.room}`
												: ""}
										</p>
									</div>
								))}
							</div>
						)}
					</CardBody>
				</Card>
			</div>
		</Page>
	);
}
