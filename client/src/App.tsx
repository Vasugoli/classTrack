import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

function App() {
	const user = useAuthStore((s) => s.user);

	return (
		<div className='min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4'>
			{/* Hero Section */}
			<div className='text-center space-y-6'>
				<div className='inline-block'>
					<h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
						classTrack
					</h1>
					<div className='h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full'></div>
				</div>

				<p className='text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto'>
					Smart Attendance & Productivity System
				</p>

				<p className='text-base md:text-lg text-gray-500 max-w-xl mx-auto'>
					Track your attendance, manage schedules, boost productivity
					with AI-powered suggestions, and achieve your academic
					goals.
				</p>
			</div>

			{/* Feature Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl w-full'>
				<FeatureCard
					icon='📋'
					title='Attendance'
					description='Mark attendance with QR codes and track your presence'
				/>
				<FeatureCard
					icon='📅'
					title='Schedule'
					description='Manage your class schedule and never miss a session'
				/>
				<FeatureCard
					icon='🎯'
					title='Productivity'
					description='Get AI-powered suggestions and manage tasks efficiently'
				/>
				<FeatureCard
					icon='👤'
					title='Profile'
					description='Set your interests and goals for personalized recommendations'
				/>
			</div>

			{/* CTA Buttons */}
			<div className='flex flex-col sm:flex-row gap-4 mt-12'>
				{!user ? (
					<>
						<Link
							to='/register'
							className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'>
							Get Started
						</Link>
						<Link
							to='/login'
							className='px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-300'>
							Sign In
						</Link>
					</>
				) : (
					<Link
						to='/dashboard'
						className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'>
						Go to Dashboard
					</Link>
				)}
			</div>

			{/* Stats Section */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl w-full'>
				<StatCard number='100%' title='Accurate' />
				<StatCard number='24/7' title='Available' />
				<StatCard number='AI' title='Powered' />
				<StatCard number='Fast' title='& Secure' />
			</div>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: string;
	title: string;
	description: string;
}) {
	return (
		<div className='p-6 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1'>
			<div className='text-4xl mb-3'>{icon}</div>
			<h3 className='text-lg font-semibold text-gray-800 mb-2'>
				{title}
			</h3>
			<p className='text-sm text-gray-600'>{description}</p>
		</div>
	);
}

function StatCard({ number, title }: { number: string; title: string }) {
	return (
		<div className='text-center'>
			<div className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
				{number}
			</div>
			<div className='text-sm text-gray-600 mt-1'>{title}</div>
		</div>
	);
}

export default App;
