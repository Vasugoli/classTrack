import React from "react";

type CardProps = React.PropsWithChildren<{
	className?: string;
}>;

export function Card({ children, className = "" }: CardProps) {
	return (
		<div
			className={`rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-sm ${className}`}>
			{children}
		</div>
	);
}

export function CardHeader({
	children,
	className = "p-6 border-b border-gray-200/70",
}: CardProps) {
	return <div className={className}>{children}</div>;
}

export function CardTitle({
	children,
	className = "text-lg font-semibold text-gray-900",
}: CardProps) {
	return <h3 className={className}>{children}</h3>;
}

export function CardBody({ children, className = "p-6" }: CardProps) {
	return <div className={className}>{children}</div>;
}

export default Card;
