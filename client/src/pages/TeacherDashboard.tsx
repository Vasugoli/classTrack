import { useEffect, useState } from "react";
import { useClassesStore } from "@/store/classesStore";
import { Link } from "@tanstack/react-router";
import { Page } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TeacherDashboard() {
	const { classes = [], getClasses } = useClassesStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		await getClasses();
		setLoading(false);
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
			<div className='bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white shadow-lg'>
				<h1 className='text-3xl font-bold mb-2'>Teacher Dashboard</h1>
				<p className='text-green-100'>
					Manage your classes and attendance
				</p>
			</div>

			{/* Quick Actions */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
					<div className='text-4xl mb-3'>✅</div>
					<h3 className='text-lg font-semibold text-gray-800'>
						Mark Attendance
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						Generate tokens for students
					</p>
				</Link>

				<Link
					to='/schedule'
					className='bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center'>
					<div className='text-4xl mb-3'>📅</div>
					<h3 className='text-lg font-semibold text-gray-800'>
						Schedule
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						Manage class schedule
					</p>
				</Link>
			</div>

			{/* My Classes */}
			<Card>
				<CardHeader>
					<CardTitle>My Classes</CardTitle>
				</CardHeader>
				<CardBody>
					{classes.length === 0 ? (
						<p className='text-gray-500 text-center py-8'>
							No classes assigned yet
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{classes.map((cls) => (
								<div
									key={cls.id}
									className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
									<h3 className='font-semibold text-gray-800'>
										{cls.name}
									</h3>
									<p className='text-sm text-gray-600'>
										{cls.code}
									</p>
									{cls.room && (
										<p className='text-xs text-gray-500 mt-1'>
											Room: {cls.room}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>
		</Page>
	);
}
