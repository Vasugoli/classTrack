import { useState } from "react";
import { useClasses, useCreateClass } from "@/hooks/useClasses";
import { useAuthStore } from "@/store/authStore";

export default function Classes() {
	const user = useAuthStore((s) => s.user);
	const [showForm, setShowForm] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [room, setRoom] = useState("");

	const { data, refetch } = useClasses(true);
	const createMutation = useCreateClass();

	const classes = data?.classes || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{ name, code, room: room || undefined },
			{
				onSuccess: () => {
					setName("");
					setCode("");
					setRoom("");
					setShowForm(false);
					refetch();
				},
			}
		);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 flex items-center justify-between animate-in'>
					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>📚</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
								Classes
							</h1>
							<p className='text-gray-600'>
								Manage all classes in the system 🎓
							</p>
						</div>
					</div>
					{(user?.role === "TEACHER" || user?.role === "ADMIN") && (
						<button
							onClick={() => setShowForm(!showForm)}
							className='px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
							+ New Class
						</button>
					)}
				</div>

				{/* Create Form */}
				{showForm && (
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
						<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
							<span>✨</span>
							Create New Class
						</h2>
						<form onSubmit={handleSubmit}>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
								<div className='space-y-2'>
									<label className='block text-sm font-semibold text-gray-700'>
										Class Name *
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
											<span className='text-gray-400 text-lg'>
												📖
											</span>
										</div>
										<input
											type='text'
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
											required
											className='w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none'
											placeholder='e.g., Data Structures'
										/>
									</div>
								</div>
								<div className='space-y-2'>
									<label className='block text-sm font-semibold text-gray-700'>
										Class Code *
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
											<span className='text-gray-400 text-lg'>
												🔑
											</span>
										</div>
										<input
											type='text'
											value={code}
											onChange={(e) =>
												setCode(e.target.value)
											}
											required
											className='w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none'
											placeholder='e.g., CS201'
										/>
									</div>
								</div>
								<div className='space-y-2'>
									<label className='block text-sm font-semibold text-gray-700'>
										Room (optional)
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
											<span className='text-gray-400 text-lg'>
												📍
											</span>
										</div>
										<input
											type='text'
											value={room}
											onChange={(e) =>
												setRoom(e.target.value)
											}
											className='w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none'
											placeholder='e.g., Room 301'
										/>
									</div>
								</div>
							</div>
							<div className='flex gap-3'>
								<button
									type='submit'
									disabled={createMutation.isPending}
									className='px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'>
									{createMutation.isPending ? (
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
											Creating...
										</span>
									) : (
										"✨ Create Class"
									)}
								</button>
								<button
									type='button'
									onClick={() => setShowForm(false)}
									className='px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in hover:-translate-y-1 transition-transform duration-200'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
									{classes.length}
								</div>
								<div className='text-sm text-gray-600 mt-2 font-medium'>
									Total Classes
								</div>
							</div>
							<div className='text-4xl p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 bg-opacity-10'>
								📚
							</div>
						</div>
					</div>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in hover:-translate-y-1 transition-transform duration-200'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
									{classes.filter((c) => c.room).length}
								</div>
								<div className='text-sm text-gray-600 mt-2 font-medium'>
									With Rooms
								</div>
							</div>
							<div className='text-4xl p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 bg-opacity-10'>
								📍
							</div>
						</div>
					</div>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in hover:-translate-y-1 transition-transform duration-200'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
									{
										new Set(classes.map((c) => c.teacherId))
											.size
									}
								</div>
								<div className='text-sm text-gray-600 mt-2 font-medium'>
									Teachers
								</div>
							</div>
							<div className='text-4xl p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-10'>
								👨‍🏫
							</div>
						</div>
					</div>
				</div>

				{/* Classes Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{classes.length === 0 ? (
						<div className='col-span-full text-center py-12'>
							<div className='text-6xl mb-4'>📚</div>
							<p className='text-gray-500 text-lg'>
								No classes found. Create your first class!
							</p>
						</div>
					) : (
						classes.map((cls) => (
							<div
								key={cls.id}
								className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 animate-in'>
								<div className='flex items-start justify-between mb-4'>
									<div className='w-12 h-12 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center'>
										<span className='text-2xl'>�</span>
									</div>
									<span className='px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200'>
										{cls.code}
									</span>
								</div>
								<h3 className='text-xl font-bold text-gray-800 mb-3'>
									{cls.name}
								</h3>
								<div className='space-y-2.5 text-sm text-gray-600'>
									{cls.room && (
										<div className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'>
											<span className='text-lg'>📍</span>
											<span className='font-medium'>
												{cls.room}
											</span>
										</div>
									)}
									<div className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'>
										<span className='text-lg'>🔑</span>
										<code className='bg-white px-2 py-1 rounded border border-gray-200 text-xs font-mono font-bold'>
											{cls.code}
										</code>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
