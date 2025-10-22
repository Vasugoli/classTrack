import { useEffect, useState } from "react";
import { attendanceAPI } from "@/services/api";
import toast from "react-hot-toast";

export default function Attendance() {
	const [code, setCode] = useState("");
	const [today, setToday] = useState<any[]>([]);
	const [history, setHistory] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [marking, setMarking] = useState(false);

	const refresh = async () => {
		try {
			setLoading(true);
			const [t, h] = await Promise.all([
				attendanceAPI.today(),
				attendanceAPI.history(),
			]);
			setToday(t.data.records || []);
			setHistory(h.data.records || []);
		} catch (err: any) {
			toast.error(
				err.response?.data?.error || "Failed to load attendance"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refresh().catch(() => {});
	}, []);

	const mark = async () => {
		if (!code.trim()) {
			toast.error("Please enter a class code");
			return;
		}
		try {
			setMarking(true);
			await attendanceAPI.mark({ classCode: code });
			toast.success(`Attendance marked for ${code}! ✅`);
			setCode("");
			await refresh();
		} catch (e: any) {
			toast.error(
				e?.response?.data?.error || "Failed to mark attendance"
			);
		} finally {
			setMarking(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<svg
						className='animate-spin h-12 w-12 text-green-600'
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
						Loading attendance...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'>
			<div className='max-w-5xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>✅</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
								Attendance
							</h1>
							<p className='text-gray-600'>
								Mark your attendance and view history 📋
							</p>
						</div>
					</div>
				</div>

				{/* Mark Attendance Card */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>📝</span>
						Mark Attendance
					</h2>
					<div className='flex gap-3'>
						<div className='relative flex-1'>
							<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
								<span className='text-gray-400 text-lg'>
									🔖
								</span>
							</div>
							<input
								className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none text-lg'
								placeholder='Enter class code (e.g., CS101)'
								value={code}
								onChange={(e) => setCode(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && mark()}
							/>
						</div>
						<button
							className='px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
							onClick={mark}
							disabled={marking}>
							{marking ? (
								<span className='flex items-center gap-2'>
									<svg
										className='animate-spin h-5 w-5'
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
									Marking...
								</span>
							) : (
								"✅ Mark Present"
							)}
						</button>
					</div>
				</div>

				{/* Today's Attendance */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>📅</span>
						Today's Attendance
					</h2>
					{today.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>📭</div>
							<p className='text-gray-500 text-lg'>
								No attendance marked today
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{today.map((r) => (
								<div
									key={r.id}
									className='flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-200'>
									<div className='flex items-center gap-3'>
										<span className='text-2xl'>📖</span>
										<div>
											<div className='font-bold text-gray-800'>
												{r.class?.name ||
													"Unknown Class"}
											</div>
											<div className='text-sm text-gray-600'>
												{new Date(
													r.date
												).toLocaleTimeString()}
											</div>
										</div>
									</div>
									<span
										className={`px-4 py-2 text-sm font-bold rounded-full ${
											r.status === "PRESENT"
												? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
												: r.status === "LATE"
												? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
												: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
										}`}>
										{r.status}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Attendance History */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>📊</span>
						Attendance History
					</h2>
					{history.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>📂</div>
							<p className='text-gray-500 text-lg'>
								No attendance history yet
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{history.map((r) => (
								<div
									key={r.id}
									className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200'>
									<div className='flex items-center gap-3'>
										<span className='text-2xl'>📖</span>
										<div>
											<div className='font-bold text-gray-800'>
												{r.class?.name ||
													"Unknown Class"}
											</div>
											<div className='text-sm text-gray-600'>
												{new Date(
													r.date
												).toLocaleDateString()}{" "}
												•{" "}
												{new Date(
													r.date
												).toLocaleTimeString()}
											</div>
										</div>
									</div>
									<span
										className={`px-4 py-2 text-sm font-bold rounded-full ${
											r.status === "PRESENT"
												? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
												: r.status === "LATE"
												? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
												: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
										}`}>
										{r.status}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
