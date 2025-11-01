import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useClassesStore } from "@/store/classesStore";
import toast from "react-hot-toast";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";

export default function Attendance() {
	const user = useAuthStore((s) => s.user);
	const {
		history,
		token: generatedToken,
		loading,
		getAttendanceHistory,
		markAttendance,
		generateToken,
	} = useAttendanceStore();
	const { classes, getClasses } = useClassesStore();

	const [showMarkModal, setShowMarkModal] = useState(false);
	const [selectedClass, setSelectedClass] = useState("");
	const [token, setToken] = useState("");
	const [marking, setMarking] = useState(false);

	// For teacher - generate token
	const [showTokenModal, setShowTokenModal] = useState(false);
	const [tokenExpiry, setTokenExpiry] = useState(60);

	useEffect(() => {
		getAttendanceHistory();
		getClasses();
	}, [getAttendanceHistory, getClasses]);

	const handleMarkAttendance = async () => {
		if (!selectedClass || !token) {
			toast.error("Please select a class and enter token");
			return;
		}

		setMarking(true);

		try {
			// Get user's location
			if (!navigator.geolocation) {
				throw new Error("Geolocation is not supported");
			}

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					await markAttendance({
						classCode: selectedClass,
						status: "PRESENT",
						token: token,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});

					if (!useAttendanceStore.getState().error) {
						toast.success("Attendance marked successfully!");
						setShowMarkModal(false);
						setSelectedClass("");
						setToken("");
						getAttendanceHistory();
					} else {
						toast.error(
							useAttendanceStore.getState().error ||
								"Failed to mark attendance"
						);
					}
					setMarking(false);
				},
				() => {
					toast.error("Failed to get location. Please enable GPS.");
					setMarking(false);
				}
			);
		} catch (error: any) {
			toast.error(error.error || "Failed to mark attendance");
			setMarking(false);
		}
	};

	const handleGenerateToken = async () => {
		if (!selectedClass) {
			toast.error("Please select a class");
			return;
		}

		await generateToken(selectedClass, tokenExpiry);

		if (!useAttendanceStore.getState().error) {
			toast.success("Token generated successfully!");
		} else {
			toast.error(
				useAttendanceStore.getState().error ||
					"Failed to generate token"
			);
		}
	};

	const getAttendanceStats = () => {
		if (history.length === 0)
			return { present: 0, absent: 0, late: 0, total: 0 };

		const present = history.filter(
			(a: any) => a.status === "PRESENT"
		).length;
		const absent = history.filter((a: any) => a.status === "ABSENT").length;
		const late = history.filter((a: any) => a.status === "LATE").length;

		return { present, absent, late, total: history.length };
	};

	const stats = getAttendanceStats();
	const attendancePercentage =
		stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

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
				title='Attendance'
				subtitle='Track and manage your attendance'
				actions={
					<>
						{user?.role === "STUDENT" && (
							<button
								onClick={() => setShowMarkModal(true)}
								className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
								📋 Mark Attendance
							</button>
						)}
						{user?.role === "TEACHER" && (
							<button
								onClick={() => setShowTokenModal(true)}
								className='px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
								🔑 Generate Token
							</button>
						)}
					</>
				}
			/>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
				<Card className='bg-gradient-to-br from-green-500 to-green-600 text-white'>
					<CardBody>
						<p className='text-white/80 text-sm mb-1'>Present</p>
						<p className='text-3xl font-bold'>{stats.present}</p>
					</CardBody>
				</Card>
				<Card className='bg-gradient-to-br from-red-500 to-red-600 text-white'>
					<CardBody>
						<p className='text-white/80 text-sm mb-1'>Absent</p>
						<p className='text-3xl font-bold'>{stats.absent}</p>
					</CardBody>
				</Card>
				<Card className='bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'>
					<CardBody>
						<p className='text-white/80 text-sm mb-1'>Late</p>
						<p className='text-3xl font-bold'>{stats.late}</p>
					</CardBody>
				</Card>
				<Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
					<CardBody>
						<p className='text-white/80 text-sm mb-1'>
							Attendance %
						</p>
						<p className='text-3xl font-bold'>
							{attendancePercentage}%
						</p>
					</CardBody>
				</Card>
			</div>

			{/* Attendance Table */}
			<Card className='shadow-md overflow-hidden'>
				<CardHeader className='p-6 border-b border-gray-200'>
					<CardTitle>Attendance History</CardTitle>
				</CardHeader>
				<CardBody className='p-0'>
					<div className='overflow-x-auto'>
						{history.length === 0 ? (
							<p className='text-gray-500 text-center py-12'>
								No attendance records found
							</p>
						) : (
							<table className='w-full'>
								<thead className='bg-gray-50 sticky top-0'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Date
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Class
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Code
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Room
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Status
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-100'>
									{history.map((record: any, idx: number) => (
										<tr
											key={record.id}
											className={
												idx % 2 === 0
													? "bg-white hover:bg-gray-50"
													: "bg-gray-50 hover:bg-gray-100"
											}>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{new Date(
													record.date
												).toLocaleDateString()}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
												{record.class.name}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
												{record.class.code}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
												{record.class.room || "N/A"}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${
														record.status ===
														"PRESENT"
															? "bg-green-100 text-green-700"
															: record.status ===
															  "LATE"
															? "bg-yellow-100 text-yellow-700"
															: "bg-red-100 text-red-700"
													}`}>
													{record.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</CardBody>
			</Card>

			{/* Mark Attendance Modal */}
			{showMarkModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Mark Attendance
						</h2>

						<div className='space-y-4'>
							<div>
								<label
									htmlFor='mark-class-select'
									className='block text-sm font-medium text-gray-700 mb-2'>
									Select Class
								</label>
								<select
									id='mark-class-select'
									value={selectedClass}
									onChange={(e) =>
										setSelectedClass(e.target.value)
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									<option value=''>Choose a class</option>
									{classes.map((cls) => (
										<option key={cls.id} value={cls.code}>
											{cls.name} ({cls.code})
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Session Token
								</label>
								<input
									type='text'
									value={token}
									onChange={(e) => setToken(e.target.value)}
									placeholder='Enter token from teacher'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
							</div>
						</div>

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() => {
									setShowMarkModal(false);
									setSelectedClass("");
									setToken("");
								}}
								className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
								Cancel
							</button>
							<button
								onClick={handleMarkAttendance}
								disabled={marking}
								className='flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'>
								{marking ? "Marking..." : "Submit"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Generate Token Modal (Teacher) */}
			{showTokenModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Generate Session Token
						</h2>

						<div>
							<label
								htmlFor='generate-class-select'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Select Class
							</label>
							<select
								id='generate-class-select'
								value={selectedClass}
								onChange={(e) =>
									setSelectedClass(e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
								<option value=''>Choose a class</option>
								{classes.map((cls) => (
									<option key={cls.id} value={cls.id}>
										{cls.name} ({cls.code})
									</option>
								))}
							</select>
						</div>

						<div className='mt-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Token Expiry (seconds)
							</label>
							<input
								type='number'
								min='30'
								max='300'
								value={tokenExpiry}
								onChange={(e) =>
									setTokenExpiry(parseInt(e.target.value))
								}
								placeholder='e.g. 60'
								title='Token expiry in seconds'
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						{generatedToken && (
							<div className='bg-green-50 border border-green-200 rounded-lg p-4 mt-4'>
								<p className='text-sm text-gray-700 mb-2'>
									Generated Token:
								</p>
								<p className='text-lg font-mono font-bold text-green-700 break-all'>
									{generatedToken}
								</p>
							</div>
						)}

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() => {
									setShowTokenModal(false);
									setSelectedClass("");
								}}
								className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
								Close
							</button>
							<button
								onClick={handleGenerateToken}
								className='flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
								Generate
							</button>
						</div>
					</div>
				</div>
			)}
		</Page>
	);
}
