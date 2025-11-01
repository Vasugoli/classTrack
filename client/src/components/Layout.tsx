import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function Layout() {
	const user = useAuthStore((s) => s.user);
	const logout = useAuthStore((s) => s.logout);
	const router = useRouter();

	const handleLogout = async () => {
		await logout();

		if (!useAuthStore.getState().error) {
			toast.success("Logged out successfully");
			router.navigate({ to: "/login" });
		} else {
			toast.error("Failed to logout");
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
			{/* Navigation */}
			<nav className='bg-white shadow-md sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-16'>
						{/* Logo */}
						<Link to='/' className='flex items-center space-x-2'>
							<h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
								classTrack
							</h1>
						</Link>
						{/* Navigation Links */}
						{user && (
							<div className='hidden md:flex items-center space-x-6'>
								{/* STUDENT Navigation */}
								{user.role === "STUDENT" && (
									<>
										<NavLink
											to='/dashboard'
											label='Dashboard'
										/>
										<NavLink
											to='/attendance'
											label='Attendance'
										/>
										<NavLink
											to='/schedule'
											label='Schedule'
										/>
										<NavLink
											to='/productivity'
											label='Productivity'
										/>
										<NavLink to='/devices' label='Device' />
										<NavLink
											to='/profile'
											label='Profile'
										/>
									</>
								)}

								{/* TEACHER Navigation */}
								{user.role === "TEACHER" && (
									<>
										<NavLink
											to='/teacher'
											label='Dashboard'
										/>
										<NavLink
											to='/attendance'
											label='Attendance'
										/>
										<NavLink
											to='/classes'
											label='Classes'
										/>
										<NavLink
											to='/schedule'
											label='Schedule'
										/>
										<NavLink to='/devices' label='Device' />
										<NavLink
											to='/profile'
											label='Profile'
										/>
									</>
								)}

								{/* ADMIN Navigation */}
								{user.role === "ADMIN" && (
									<>
										<NavLink
											to='/admin'
											label='Dashboard'
										/>
										<NavLink to='/users' label='Users' />
										<NavLink
											to='/classes'
											label='Classes'
										/>
										<NavLink
											to='/attendance'
											label='Attendance'
										/>
										<NavLink
											to='/devices'
											label='Devices'
										/>
										<NavLink
											to='/audit'
											label='Audit Logs'
										/>
										<NavLink
											to='/profile'
											label='Profile'
										/>
									</>
								)}
							</div>
						)}{" "}
						{/* Auth Buttons */}
						<div className='flex items-center space-x-4'>
							{user ? (
								<>
									<span className='text-sm text-gray-600 hidden sm:block'>
										{user.name} ({user.role})
									</span>
									<button
										onClick={handleLogout}
										className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to='/login'
										className='px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors'>
										Login
									</Link>
									<Link
										to='/register'
										className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
										Register
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<Outlet />
			</main>

			{/* Footer */}
			<footer className='bg-white border-t mt-auto'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
					<p className='text-center text-gray-600 text-sm'>
						© 2025 classTrack - Smart Attendance & Productivity
						System
					</p>
				</div>
			</footer>
		</div>
	);
}

function NavLink({ to, label }: { to: string; label: string }) {
	return (
		<Link
			to={to}
			className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
			activeProps={{
				className: "text-blue-600 border-b-2 border-blue-600",
			}}>
			{label}
		</Link>
	);
}
