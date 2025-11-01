import React from "react";

type PageProps = React.PropsWithChildren<{ className?: string }>;

export function Page({ children, className = "space-y-8" }: PageProps) {
	return <div className={className}>{children}</div>;
}

export function PageHeader({
	title,
	subtitle,
	actions,
	className = "",
}: {
	title: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	actions?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${className}`}>
			<div>
				<h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
				{subtitle ? (
					<p className='text-gray-600 mt-1'>{subtitle}</p>
				) : null}
			</div>
			{actions ? (
				<div className='flex items-center gap-3'>{actions}</div>
			) : null}
		</div>
	);
}

export function Section({ children, className = "" }: PageProps) {
	return <section className={className}>{children}</section>;
}

export default Page;
