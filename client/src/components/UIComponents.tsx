export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "h-5 w-5",
		md: "h-10 w-10",
		lg: "h-16 w-16",
	};

	return (
		<div className='flex items-center justify-center py-12'>
			<svg
				className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
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
		</div>
	);
}

export function LoadingSkeleton() {
	return (
		<div className='animate-pulse space-y-4'>
			<div className='h-4 bg-gray-200 rounded w-3/4'></div>
			<div className='h-4 bg-gray-200 rounded w-1/2'></div>
			<div className='h-4 bg-gray-200 rounded w-5/6'></div>
		</div>
	);
}

export function EmptyState({
	icon = "📭",
	title,
	description,
	action,
}: {
	icon?: string;
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className='text-center py-12'>
			<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4'>
				<span className='text-4xl'>{icon}</span>
			</div>
			<p className='text-lg font-medium text-gray-600 mb-2'>{title}</p>
			<p className='text-sm text-gray-500 mb-4'>{description}</p>
			{action && <div className='mt-6'>{action}</div>}
		</div>
	);
}

export function ErrorState({
	error,
	retry,
}: {
	error: Error;
	retry?: () => void;
}) {
	return (
		<div className='text-center py-12'>
			<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4'>
				<span className='text-4xl'>⚠️</span>
			</div>
			<p className='text-lg font-medium text-red-600 mb-2'>
				Something went wrong
			</p>
			<p className='text-sm text-gray-500 mb-4'>{error.message}</p>
			{retry && (
				<button
					onClick={retry}
					className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
					Try Again
				</button>
			)}
		</div>
	);
}
