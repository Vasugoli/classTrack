import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

function App() {
	const user = useAuthStore((s) => s.user);

	return (
		<div className='relative w-full'>
			{/* Soft gradient background */}
			<div
				aria-hidden
				className='pointer-events-none absolute inset-0 overflow-hidden'>
				<div className='absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-pink-500/20 blur-3xl animate-blob'></div>
				<div className='absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/20 via-sky-500/20 to-emerald-500/20 blur-3xl animate-blob animation-delay-2000'></div>
				<div className='absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-rose-500/20 blur-3xl animate-blob animation-delay-4000'></div>
			</div>

			<div className='min-h-screen relative flex flex-col items-center justify-center px-4 pt-24 pb-24'>
				{/* Hero Section */}
				<div className='text-center space-y-6'>
					<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-blue-700 text-sm font-medium'>
						<span className='h-2 w-2 rounded-full bg-blue-500 animate-pulse'></span>
						Smart Attendance & Productivity
					</div>
					<div className='w-full max-w-5xl mx-auto'>
						<h1 className='text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm'>
							classTrack
						</h1>
						<div className='h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600/70 rounded-full mt-2'></div>
					</div>

					<p className='text-base md:text-lg text-gray-600 max-w-2xl mx-auto'>
						Take attendance with unique session codes, manage
						schedules, and boost productivity with AI-driven
						insights.
					</p>

					{/* CTA Buttons */}
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						{!user ? (
							<>
								<Link
									to='/register'
									className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
									Get Started
								</Link>
								<Link
									to='/login'
									className='px-6 py-3 rounded-xl font-semibold border-2 border-blue-600 text-blue-700/90 backdrop-blur-sm hover:bg-blue-50/60 hover:scale-[1.02] transition-all duration-300'>
									Sign In
								</Link>
							</>
						) : (
							<Link
								to='/dashboard'
								className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
								Go to Dashboard
							</Link>
						)}
					</div>
				</div>

				{/* Quick stats */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-5xl w-full justify-center items-center'>
					<StatCard number='99.9%' title='Uptime' />
					<StatCard number='< 1s' title='Check‑in' />
					<StatCard number='Role‑based' title='Access' />
					<StatCard number='Audit' title='Ready' />
				</div>

				{/* Feature Cards - glass */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-6xl w-full'>
					<FeatureCard
						icon='📋'
						title='Attendance'
						description='Mark attendance with unique session codes and track your presence'
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

				{/* Why classTrack */}
				<div className='mt-16 max-w-5xl w-full text-center'>
					<h2 className='text-2xl md:text-3xl font-bold text-gray-900'>
						Why classTrack
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
						<BenefitCard
							icon='🧭'
							title='Accurate by design'
							desc='Time windows, device binding, and geofencing reduce false check‑ins.'
						/>
						<BenefitCard
							icon='🛡️'
							title='Secure'
							desc='Audit logging and role-based access keep data safe and traceable.'
						/>
						<BenefitCard
							icon='📊'
							title='Insightful'
							desc='AI-driven nudges help students and teachers improve outcomes.'
						/>
					</div>
				</div>

				{/* Attendance Process */}
				<div className='mt-20 max-w-5xl w-full'>
					<h2 className='text-2xl md:text-3xl font-bold text-gray-800 text-center'>
						How attendance works
					</h2>
					<p className='text-gray-600 text-center mt-2 max-w-3xl mx-auto'>
						A simple, secure 6-step flow designed for reliability
						and fairness.
					</p>

					<ol className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 list-decimal list-inside'>
						<ProcessCard
							step={1}
							title='Sign in or register'
							desc='Create your account or log in with your role (Student/Teacher/Admin).'
							icon='🔐'
						/>
						<ProcessCard
							step={2}
							title='Bind your device'
							desc='First-time login binds your device for anti-spoofing (one-click and reversible by admins).'
							icon='📱'
						/>
						<ProcessCard
							step={3}
							title='Join the scheduled class'
							desc='Classes are time-bound from your schedule; attendance opens only within the allowed window.'
							icon='🗓️'
						/>
						<ProcessCard
							step={4}
							title='Enter the session code'
							desc='Teacher displays a time-limited code; students enter it to check in.'
							icon='🔢'
						/>
						<ProcessCard
							step={5}
							title='Geo and device checks'
							desc='System verifies geofence and the bound device automatically before marking present.'
							icon='🛰️'
						/>
						<ProcessCard
							step={6}
							title='Attendance recorded'
							desc='Your presence is stored securely and audit-logged. View it anytime in Attendance.'
							icon='✅'
						/>
					</ol>

					<div className='mt-10 flex justify-center'>
						<Link
							to={user ? "/attendance" : "/register"}
							className='px-6 py-3 rounded-xl font-semibold border-2 border-purple-600 text-purple-700 hover:bg-purple-50 transition-all'>
							{user ? "Open Attendance" : "Create your account"}
						</Link>
					</div>
				</div>

				{/* Roles */}
				<div className='mt-20 max-w-6xl w-full'>
					<h2 className='text-2xl md:text-3xl font-bold text-gray-900 text-center'>
						Designed for every role
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
						<RoleCard
							icon='🎓'
							title='Students'
							desc='Fast check‑in with codes, see history, and keep on track.'
						/>
						<RoleCard
							icon='👩‍🏫'
							title='Teachers'
							desc='Open sessions, show codes, monitor absences in real‑time.'
						/>
						<RoleCard
							icon='🧑‍💼'
							title='Admins'
							desc='Manage users, devices, policies, and audit logs centrally.'
						/>
					</div>
				</div>

				{/* FAQ */}
				<div className='mt-20 max-w-4xl w-full'>
					<h2 className='text-2xl md:text-3xl font-bold text-gray-900 text-center'>
						FAQ
					</h2>
					<div className='mt-6 space-y-3'>
						<details className='p-4 rounded-xl border border-gray-200/70 bg-white/70 backdrop-blur'>
							<summary className='font-medium cursor-pointer'>
								How long is a session code valid?
							</summary>
							<p className='mt-2 text-sm text-gray-600'>
								Codes are time-limited to the class window set
								by your schedule. Teachers can close sessions
								anytime.
							</p>
						</details>
						<details className='p-4 rounded-xl border border-gray-200/70 bg-white/70 backdrop-blur'>
							<summary className='font-medium cursor-pointer'>
								What prevents proxy attendance?
							</summary>
							<p className='mt-2 text-sm text-gray-600'>
								Device binding and optional geofencing ensure
								check‑ins are genuine and in the right place.
							</p>
						</details>
						<details className='p-4 rounded-xl border border-gray-200/70 bg-white/70 backdrop-blur'>
							<summary className='font-medium cursor-pointer'>
								Can I reset my bound device?
							</summary>
							<p className='mt-2 text-sm text-gray-600'>
								Yes. Admins can reset bindings. You may be asked
								to verify your identity.
							</p>
						</details>
					</div>
				</div>

				{/* Final CTA */}
				<div className='mt-20 mb-4 text-center'>
					<Link
						to={user ? "/dashboard" : "/register"}
						className='inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition'>
						{user ? "Open dashboard" : "Create your free account"}
					</Link>
				</div>
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
		<div className='p-6 rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-full'>
			<div className='text-4xl mb-3'>{icon}</div>
			<h3 className='text-lg font-semibold text-gray-800 mb-2 flex-0'>
				{title}
			</h3>
			<p className='text-sm text-gray-600 flex-1'>{description}</p>
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

function BenefitCard({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<div className='p-6 rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-sm text-left'>
			<div className='text-2xl'>{icon}</div>
			<h3 className='mt-2 text-base font-semibold text-gray-900'>
				{title}
			</h3>
			<p className='mt-1 text-sm text-gray-600'>{desc}</p>
		</div>
	);
}

function ProcessCard({
	step,
	title,
	desc,
	icon,
}: {
	step: number;
	title: string;
	desc: string;
	icon: string;
}) {
	return (
		<li className='relative p-5 bg-white rounded-xl shadow-sm border border-gray-100'>
			<div className='absolute -top-3 -left-3 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow'>
				{step}
			</div>
			<div className='flex items-start gap-3'>
				<span className='text-2xl leading-none select-none'>
					{icon}
				</span>
				<div>
					<h3 className='text-base font-semibold text-gray-800'>
						{title}
					</h3>
					<p className='text-sm text-gray-600 mt-1'>{desc}</p>
				</div>
			</div>
		</li>
	);
}

function RoleCard({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<div className='p-6 rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-sm'>
			<div className='text-3xl'>{icon}</div>
			<h3 className='mt-2 text-base font-semibold text-gray-900'>
				{title}
			</h3>
			<p className='mt-1 text-sm text-gray-600'>{desc}</p>
		</div>
	);
}
