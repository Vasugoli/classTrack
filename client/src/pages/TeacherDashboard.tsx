import { useState, useEffect } from "react";
import { classesAPI, attendanceAPI, type Attendance } from "@/services";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Class {
	id: string;
	name: string;
	code: string;
	room?: string;
}

export default function TeacherDashboard() {
	const user = useAuthStore((s) => s.user);
	const [classes, setClasses] = useState<Class[]>([]);
	const [selectedClass, setSelectedClass] = useState<string | null>(null);
	const [attendance, setAttendance] = useState<Attendance[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// New Class Form
	const [showNewClassForm, setShowNewClassForm] = useState(false);
	const [newClassName, setNewClassName] = useState("");
	const [newClassCode, setNewClassCode] = useState("");
	const [newClassRoom, setNewClassRoom] = useState("");

	useEffect(() => {
		fetchClasses();
	}, []);

	useEffect(() => {
		if (selectedClass) {
			fetchAttendanceForClass(selectedClass);
		}
	}, [selectedClass]);

	const fetchClasses = async () => {
		try {
			setLoading(true);
			const res = await classesAPI.list();
			setClasses(res.classes || []);
			if (res.classes && res.classes.length > 0) {
				setSelectedClass(res.classes[0].id);
			}
		} catch (err: any) {
			const errorMsg = err?.message || "Failed to fetch classes";
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const fetchAttendanceForClass = async (classId: string) => {
		try {
			const res = await attendanceAPI.getByClass(classId);
			setAttendance(res.attendances || []);
		} catch (err: any) {
			const errorMsg = err?.message || "Failed to fetch attendance";
			setError(errorMsg);
			toast.error(errorMsg);
		}
	};

	const handleCreateClass = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await classesAPI.create({
				name: newClassName,
				code: newClassCode,
				room: newClassRoom || undefined,
			});
			toast.success(`Class "${newClassName}" created successfully! 🎉`);
			setNewClassName("");
			setNewClassCode("");
			setNewClassRoom("");
			setShowNewClassForm(false);
			await fetchClasses();
		} catch (err: any) {
			const errorMsg =
				err.response?.data?.error || "Failed to create class";
			setError(errorMsg);
			toast.error(errorMsg);
		}
	};

	const selectedClassData = classes.find((c) => c.id === selectedClass);
	const todayAttendance = attendance.filter(
		(a) => new Date(a.date).toDateString() === new Date().toDateString()
	);

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<svg
						className='animate-spin h-12 w-12 text-purple-600'
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
						Loading your classes...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>👨‍🏫</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
								Teacher Dashboard
							</h1>
							<p className='text-gray-600'>
								Welcome back, {user?.name}! 👋
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

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
					<StatCard
						label='Total Classes'
						value={classes.length}
						icon='📚'
						gradient='from-blue-500 to-blue-600'
					/>
					<StatCard
						label="Today's Attendance"
						value={todayAttendance.length}
						icon='✅'
						gradient='from-green-500 to-emerald-600'
					/>
					<StatCard
						label='Present Today'
						value={
							todayAttendance.filter(
								(a) => a.status === "PRESENT"
							).length
						}
						icon='👥'
						gradient='from-purple-500 to-purple-600'
					/>
					<StatCard
						label='Absent Today'
						value={
							todayAttendance.filter((a) => a.status === "ABSENT")
								.length
						}
						icon='❌'
						gradient='from-red-500 to-red-600'
					/>
				</div>

				{/* Classes Section */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-in'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
							<span>📚</span>
							My Classes
						</h2>
						<button
							onClick={() =>
								setShowNewClassForm(!showNewClassForm)
							}
							className='px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium'>
							+ New Class
						</button>
					</div>

					{showNewClassForm && (
						<form
							onSubmit={handleCreateClass}
							className='mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 animate-in'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Class Name
									</label>
									<input
										type='text'
										placeholder='e.g., Mathematics 101'
										value={newClassName}
										onChange={(e) =>
											setNewClassName(e.target.value)
										}
										required
										className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none'
									/>
								</div>
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Class Code
									</label>
									<input
										type='text'
										placeholder='e.g., MATH101'
										value={newClassCode}
										onChange={(e) =>
											setNewClassCode(e.target.value)
										}
										required
										className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none'
									/>
								</div>
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Room (Optional)
									</label>
									<input
										type='text'
										placeholder='e.g., Room 201'
										value={newClassRoom}
										onChange={(e) =>
											setNewClassRoom(e.target.value)
										}
										className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none'
									/>
								</div>
							</div>
							<div className='flex gap-3'>
								<button
									type='submit'
									className='px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl'>
									✨ Create Class
								</button>
								<button
									type='button'
									onClick={() => setShowNewClassForm(false)}
									className='px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700'>
									Cancel
								</button>
							</div>
						</form>
					)}

					{classes.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>📚</div>
							<p className='text-gray-500 text-lg'>
								No classes yet. Create your first class to get
								started!
							</p>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{classes.map((cls) => (
								<button
									key={cls.id}
									onClick={() => setSelectedClass(cls.id)}
									className={`p-5 rounded-xl border-2 transition-all text-left transform hover:-translate-y-1 duration-200 ${
										selectedClass === cls.id
											? "border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
											: "border-gray-200 hover:border-purple-300 bg-white hover:shadow-md"
									}`}>
									<div className='font-bold text-lg mb-1.5 text-gray-800 flex items-center gap-2'>
										<span className='text-2xl'>📖</span>
										{cls.name}
									</div>
									<div className='text-sm text-gray-600 mb-1'>
										<span className='font-medium'>
											Code:
										</span>{" "}
										{cls.code}
									</div>
									{cls.room && (
										<div className='text-sm text-gray-600'>
											<span className='font-medium'>
												Room:
											</span>{" "}
											{cls.room}
										</div>
									)}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Attendance Records */}
				{selectedClass && selectedClassData && (
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in'>
						<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
							<span>✅</span>
							Attendance for {selectedClassData.name}
						</h2>

						{attendance.length === 0 ? (
							<div className='text-center py-12'>
								<div className='text-6xl mb-4'>📋</div>
								<p className='text-gray-500 text-lg'>
									No attendance records yet
								</p>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead className='bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200'>
										<tr>
											<th className='px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
												Student
											</th>
											<th className='px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
												Email
											</th>
											<th className='px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
												Enrollment
											</th>
											<th className='px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
												Date
											</th>
											<th className='px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
												Status
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-200'>
										{attendance.map((record) => (
											<tr
												key={record.id}
												className='hover:bg-gray-50 transition-colors duration-150'>
												<td className='px-4 py-4 text-sm font-medium text-gray-800'>
													{record.user?.name || "N/A"}
												</td>
												<td className='px-4 py-4 text-sm text-gray-600'>
													{record.user?.email ||
														"N/A"}
												</td>
												<td className='px-4 py-4 text-sm text-gray-600'>
													{record.user
														?.enrollmentNo || "-"}
												</td>
												<td className='px-4 py-4 text-sm text-gray-600'>
													{new Date(
														record.date
													).toLocaleDateString()}
												</td>
												<td className='px-4 py-4'>
													<span
														className={`px-3 py-1.5 text-xs font-bold rounded-full ${
															record.status ===
															"PRESENT"
																? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
																: record.status ===
																  "LATE"
																? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
																: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
														}`}>
														{record.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
	gradient,
}: {
	label: string;
	value: number;
	icon: string;
	gradient: string;
}) {
	return (
		<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in hover:-translate-y-1 transition-transform duration-200'>
			<div className='flex items-center justify-between'>
				<div>
					<div
						className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
						{value}
					</div>
					<div className='text-sm text-gray-600 mt-2 font-medium'>
						{label}
					</div>
				</div>
				<div
					className={`text-4xl p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10`}>
					{icon}
				</div>
			</div>
		</div>
	);
}
