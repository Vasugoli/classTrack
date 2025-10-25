import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { router } from "@/router";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	},
});

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<Toaster
					position='top-right'
					toastOptions={{
						duration: 4000,
						style: {
							background: "#363636",
							color: "#fff",
						},
						success: {
							duration: 3000,
							iconTheme: {
								primary: "#4ade80",
								secondary: "#fff",
							},
						},
						error: {
							duration: 4000,
							iconTheme: {
								primary: "#ef4444",
								secondary: "#fff",
							},
						},
					}}
				/>
				<RouterProvider router={router} />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</StrictMode>
	);
}

reportWebVitals();
