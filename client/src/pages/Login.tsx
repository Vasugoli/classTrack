import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useLogin } from "@/hooks/useAuth";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const loginMutation = useLogin();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		loginMutation.mutate(
			{ email, password, role: selectedRole },
			{
				onSuccess: (data) => {
					// Role-based navigation
					if (data.user.role === "ADMIN") {
						navigate({ to: "/admin" });
					} else if (data.user.role === "TEACHER") {
						navigate({ to: "/teacher" });
					} else {
						navigate({ to: "/dashboard" });
					}
				},
				onError: (err: Error) => {
					setError(err.message || "Login failed");
				},
			}
		);
	};

	const roles: {
		value: Role;
		label: string;
		icon: string;
		description: string;
	}[] = [
		{
			value: "STUDENT",
			label: "Student",
			icon: "🎓",
			description: "Access classes and track attendance",
		},
		{
			value: "TEACHER",
			label: "Teacher",
			icon: "👨‍🏫",
			description: "Manage classes and students",
		},
		{
			value: "ADMIN",
			label: "Admin",
			icon: "🔐",
			description: "Full system access",
		},
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12'>
			<div className='max-w-md w-full'>
				{/* Header */}
				<div className='text-center mb-8 animate-in'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4'>
						<span className='text-3xl'>📚</span>
					</div>
					<h1 className='text-4xl font-bold text-gray-900 mb-2'>
						Welcome Back
					</h1>
					<p className='text-gray-600'>
						Sign in to continue to classTrack
					</p>
				</div>

				<div className='bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in border border-gray-100'>
					{error && (
						<div className='bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-in flex items-start gap-3'>
							<span className='text-xl'>⚠️</span>
							<div>
								<p className='font-medium text-sm'>{error}</p>
							</div>
						</div>
					)}

					<form onSubmit={onSubmit} className='space-y-6'>
						{/* Role Selection */}
						<div className='space-y-3'>
							<label className='block text-sm font-semibold text-gray-700'>
								Select Your Role
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{roles.map((role) => (
									<button
										key={role.value}
										type='button'
										onClick={() =>
											setSelectedRole(role.value)
										}
										className={`group relative p-4 border-2 rounded-xl transition-all duration-200 text-center overflow-hidden ${
											selectedRole === role.value
												? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105"
												: "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
										}`}>
										<div className='text-3xl mb-1 transform group-hover:scale-110 transition-transform duration-200'>
											{role.icon}
										</div>
										<div
											className={`text-xs font-semibold ${
												selectedRole === role.value
													? "text-blue-600"
													: "text-gray-700"
											}`}>
											{role.label}
										</div>
										{selectedRole === role.value && (
											<div className='absolute top-1 right-1'>
												<div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse' />
											</div>
										)}
									</button>
								))}
							</div>
							<p className='text-xs text-gray-500 italic'>
								{
									roles.find((r) => r.value === selectedRole)
										?.description
								}
							</p>
						</div>

						{/* Email Input */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Email Address
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<span className='text-gray-400'>📧</span>
								</div>
								<input
									className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none'
									placeholder='student@university.edu'
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className='space-y-2'>
							<label className='block text-sm font-semibold text-gray-700'>
								Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<span className='text-gray-400'>🔒</span>
								</div>
								<input
									className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none'
									placeholder='••••••••'
									type='password'
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={loginMutation.isPending}
							className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'>
							{loginMutation.isPending ? (
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
									Signing in...
								</span>
							) : (
								`Sign in as ${
									selectedRole.charAt(0) +
									selectedRole.slice(1).toLowerCase()
								}`
							)}
						</button>
					</form>

					{/* Register Link */}
					<div className='pt-4 border-t border-gray-100'>
						<p className='text-center text-sm text-gray-600'>
							Don't have an account?{" "}
							<Link
								to='/register'
								className='text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors'>
								Create one here →
							</Link>
						</p>
					</div>
				</div>

				{/* Footer */}
				<p className='text-center text-xs text-gray-500 mt-6 animate-in'>
					© 2025 classTrack. Secure attendance management.
				</p>
			</div>
		</div>
	);
}
