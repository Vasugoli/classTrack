import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
	const user = useAuthStore((s) => s.user);
	const logoutLocal = useAuthStore((s) => s.logout);

	return (
		<nav className='w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
			<div className='mx-auto max-w-7xl px-4 py-3 flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/' className='font-bold text-lg'>
						classTrack
					</Link>
					{user && (
						<div className='hidden md:flex items-center gap-3 text-sm text-gray-600'>
							{/* Common links */}
							{user.role === "STUDENT" && (
								<>
									<Link
										to='/dashboard'
										className='hover:text-black'>
										Dashboard
									</Link>
									<Link
										to='/attendance'
										className='hover:text-black'>
										Attendance
									</Link>
									<Link
										to='/schedule'
										className='hover:text-black'>
										Schedule
									</Link>
									<Link
										to='/productivity'
										className='hover:text-black'>
										Productivity
									</Link>
								</>
							)}

							{user.role === "TEACHER" && (
								<>
									<Link
										to='/teacher'
										className='hover:text-black'>
										Dashboard
									</Link>
									<Link
										to='/classes'
										className='hover:text-black'>
										Classes
									</Link>
									<Link
										to='/attendance'
										className='hover:text-black'>
										Attendance
									</Link>
									<Link
										to='/users'
										className='hover:text-black'>
										Students
									</Link>
								</>
							)}

							{user.role === "ADMIN" && (
								<>
									<Link
										to='/admin'
										className='hover:text-black'>
										Dashboard
									</Link>
									<Link
										to='/users'
										className='hover:text-black'>
										Users
									</Link>
									<Link
										to='/classes'
										className='hover:text-black'>
										Classes
									</Link>
									<Link
										to='/attendance'
										className='hover:text-black'>
										Reports
									</Link>
								</>
							)}

							<Link to='/profile' className='hover:text-black'>
								Profile
							</Link>
						</div>
					)}
				</div>
				<div className='flex items-center gap-3 text-sm'>
					{!user ? (
						<>
							<Link
								to='/login'
								className='text-blue-600 hover:text-blue-800'>
								Login
							</Link>
							<Link
								to='/register'
								className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
								Register
							</Link>
						</>
					) : (
						<>
							<span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium'>
								{user.role}
							</span>
							<span className='text-gray-600'>{user.name}</span>
							<button
								onClick={async () => {
									try {
										await (
											await import("@/services/api")
										).authAPI.logout();
									} catch {}
									logoutLocal();
								}}
								className='text-red-600 hover:text-red-800 font-medium'>
								Logout
							</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
