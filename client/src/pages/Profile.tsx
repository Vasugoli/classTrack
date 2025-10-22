import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function Profile() {
	const user = useAuthStore((s) => s.user);
	const [name, setName] = useState("");
	const [interests, setInterests] = useState<string>("");
	const [goals, setGoals] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const load = async () => {
		try {
			setLoading(true);
			const res = await api.get("/users/profile");
			const u = res.data.user;
			setName(u.name || "");
			setInterests((u.interests || []).join(", "));
			setGoals((u.goals || []).join(", "));
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to load profile");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load().catch(() => {});
	}, []);

	const save = async () => {
		try {
			setSaving(true);
			await api.patch("/users/profile", {
				name: name || undefined,
				interests: interests
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
				goals: goals
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
			});
			toast.success("Profile updated successfully! 🎉");
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<svg
						className='animate-spin h-12 w-12 text-blue-600'
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
						Loading profile...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50'>
			<div className='max-w-3xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>👤</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
								My Profile
							</h1>
							<p className='text-gray-600'>{user?.email} 📧</p>
						</div>
					</div>
				</div>

				{/* Profile Card */}
				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in'>
					<div className='space-y-6'>
						{/* Name Input */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Name
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<span className='text-gray-400 text-lg'>
										👤
									</span>
								</div>
								<input
									title='Name'
									placeholder='Your full name'
									className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none'
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
						</div>

						{/* Role Badge */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Role
							</label>
							<div className='inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-xl'>
								<span className='text-lg'>
									{user?.role === "STUDENT" && "🎓"}
									{user?.role === "TEACHER" && "👨‍🏫"}
									{user?.role === "ADMIN" && "🔐"}
								</span>
								<span className='font-bold text-blue-700'>
									{(user?.role?.charAt(0) ?? '') +
										(user?.role?.slice(1).toLowerCase() ?? '')}
								</span>
							</div>
						</div>

						{/* Interests Input */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Interests (comma separated)
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<span className='text-gray-400 text-lg'>
										🎯
									</span>
								</div>
								<input
									title='Interests'
									placeholder='e.g. AI, Math, React'
									className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none'
									value={interests}
									onChange={(e) =>
										setInterests(e.target.value)
									}
								/>
							</div>
						</div>

						{/* Goals Input */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Goals (comma separated)
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<span className='text-gray-400 text-lg'>
										🎓
									</span>
								</div>
								<input
									title='Goals'
									placeholder='e.g. Get internship, Learn DS&A'
									className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none'
									value={goals}
									onChange={(e) => setGoals(e.target.value)}
								/>
							</div>
						</div>

						{/* Save Button */}
						<button
							className='w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
							onClick={save}
							disabled={saving}>
							{saving ? (
								<span className='flex items-center justify-center gap-2'>
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
									Saving...
								</span>
							) : (
								"💾 Save Profile"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
