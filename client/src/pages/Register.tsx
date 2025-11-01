import { useState } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody } from "@/components/ui/Card";

export default function Register() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "STUDENT" as "STUDENT" | "TEACHER" | "ADMIN",
		enrollmentNo: "",
	});

	const { register, loading, error } = useAuthStore();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload: any = {
			name: formData.name,
			email: formData.email,
			password: formData.password,
			role: formData.role,
		};

		if (formData.role === "STUDENT" && formData.enrollmentNo) {
			payload.enrollmentNo = formData.enrollmentNo;
		}

		await register(payload);

		if (!useAuthStore.getState().error) {
			toast.success("Registration successful! Please login.");
			router.navigate({ to: "/login" });
		} else if (error) {
			toast.error(error);
		}
	};

	return (
		<div className='min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8'>
			<div className='max-w-md w-full'>
				<Page className='space-y-6'>
					<PageHeader
						title={
							<span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
								Create Account
							</span>
						}
						subtitle='Join classTrack today'
					/>
					<Card>
						<CardBody>
							<form onSubmit={handleSubmit} className='space-y-6'>
								{/* Role Selection */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Register as
									</label>
									<div className='grid grid-cols-3 gap-3'>
										{(
											[
												"STUDENT",
												"TEACHER",
												"ADMIN",
											] as const
										).map((r) => (
											<button
												key={r}
												type='button'
												onClick={() =>
													setFormData({
														...formData,
														role: r,
													})
												}
												className={`px-4 py-2 rounded-lg font-medium transition-all ${
													formData.role === r
														? "bg-blue-600 text-white shadow-md"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												}`}>
												{r}
											</button>
										))}
									</div>
								</div>

								{/* Name */}
								<div>
									<label
										htmlFor='name'
										className='block text-sm font-medium text-gray-700 mb-2'>
										Full Name
									</label>
									<input
										id='name'
										type='text'
										required
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
										placeholder='John Doe'
									/>
								</div>

								{/* Email */}
								<div>
									<label
										htmlFor='email'
										className='block text-sm font-medium text-gray-700 mb-2'>
										Email Address
									</label>
									<input
										id='email'
										type='email'
										required
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
										placeholder='you@example.com'
									/>
								</div>

								{/* Enrollment Number (Students only) */}
								{formData.role === "STUDENT" && (
									<div>
										<label
											htmlFor='enrollmentNo'
											className='block text-sm font-medium text-gray-700 mb-2'>
											Enrollment Number
										</label>
										<input
											id='enrollmentNo'
											type='text'
											value={formData.enrollmentNo}
											onChange={(e) =>
												setFormData({
													...formData,
													enrollmentNo:
														e.target.value,
												})
											}
											className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
											placeholder='2024CS001'
										/>
									</div>
								)}

								{/* Password */}
								<div>
									<label
										htmlFor='password'
										className='block text-sm font-medium text-gray-700 mb-2'>
										Password
									</label>
									<input
										id='password'
										type='password'
										required
										minLength={6}
										value={formData.password}
										onChange={(e) =>
											setFormData({
												...formData,
												password: e.target.value,
											})
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
										placeholder='••••••••'
									/>
									<p className='mt-1 text-xs text-gray-500'>
										Minimum 6 characters
									</p>
								</div>

								{/* Submit Button */}
								<button
									type='submit'
									disabled={loading}
									className='w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading
										? "Creating account..."
										: "Create Account"}
								</button>

								{/* Login Link */}
								<p className='text-center text-sm text-gray-600'>
									Already have an account?{" "}
									<Link
										to='/login'
										className='text-blue-600 hover:text-blue-700 font-medium'>
										Sign in
									</Link>
								</p>
							</form>
						</CardBody>
					</Card>
				</Page>
			</div>
		</div>
	);
}
