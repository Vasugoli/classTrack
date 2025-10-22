import Navbar from "@/components/Navbar";
import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export default function Layout() {
	return (
		<div className='min-h-screen bg-gray-50 text-gray-900'>
			<Navbar />
			<main className='mx-auto max-w-6xl px-4 py-6'>
				<Outlet />
			</main>
			{process.env.NODE_ENV === "development" && (
				<TanStackRouterDevtools />
			)}
		</div>
	);
}
