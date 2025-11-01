import { useState } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody } from "@/components/ui/Card";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">(
		"STUDENT"
	);

	const { login, loading, error } = useAuthStore();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await login({ email, password, role });

		// If login was successful (user is set and no error)
		if (useAuthStore.getState().user && !useAuthStore.getState().error) {
			const currentUser = useAuthStore.getState().user;
			toast.success("Login successful!");

			// Role-based redirect
			if (currentUser?.role === "ADMIN") {
				router.navigate({ to: "/admin" });
			} else if (currentUser?.role === "TEACHER") {
				router.navigate({ to: "/teacher" });
			} else {
				router.navigate({ to: "/dashboard" });
			}
		} else if (error) {
			toast.error(error);
		}
	};

	return (
		<div className='min-h-[calc(100vh-80px)] flex items-center justify-center px-4'>
			<div className='max-w-md w-full'>
				<Page className='space-y-6'>
					<PageHeader
						title={
							<span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
								Welcome Back
							</span>
						}
						subtitle='Sign in to your account'
					/>
					<Card>
						<CardBody>
							<form onSubmit={handleSubmit} className='space-y-6'>
								{/* Role Selection */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Login as
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
												onClick={() => setRole(r)}
												className={`px-4 py-2 rounded-lg font-medium transition-all ${
													role === r
														? "bg-blue-600 text-white shadow-md"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												}`}>
												{r}
											</button>
										))}
									</div>
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
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
										placeholder='you@example.com'
									/>
								</div>

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
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
										placeholder='••••••••'
									/>
								</div>

								{/* Submit Button */}
								<button
									type='submit'
									disabled={loading}
									className='w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading ? "Signing in..." : "Sign In"}
								</button>

								{/* Register Link */}
								<p className='text-center text-sm text-gray-600'>
									Don't have an account?{" "}
									<Link
										to='/register'
										className='text-blue-600 hover:text-blue-700 font-medium'>
										Register here
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
