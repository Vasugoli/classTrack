/**
 * ====================================================================
 * API Configuration & Core Client
 * ====================================================================
 */

/**
 * Base API URL - configurable via environment variables
 * @default http://localhost:4000/api
 */
export const BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Default timeout for API requests (in milliseconds)
 * @default 30000 (30 seconds)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Fetch wrapper with automatic error handling and credentials
 *
 * @template T - The expected response type
 * @param endpoint - API endpoint (e.g., "/auth/login")
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with typed response
 * @throws Error with user-friendly message
 */
export async function fetchAPI<T = any>(
	endpoint: string,
	options?: RequestInit
): Promise<T> {
	const url = `${BASE_URL}${endpoint}`;

	// Create AbortController for timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

	const config: RequestInit = {
		credentials: "include", // Send cookies with requests
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		signal: controller.signal,
		...options,
	};

	try {
		const response = await fetch(url, config);
		clearTimeout(timeoutId);

		// Handle non-2xx responses
		if (!response.ok) {
			const error = await response.json().catch(() => ({
				error: "An unexpected error occurred",
			}));
			throw new Error(
				error.error || error.message || `HTTP ${response.status}`
			);
		}

		return response.json();
	} catch (error) {
		clearTimeout(timeoutId);

		// Handle network errors
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				throw new Error("Request timeout - please try again");
			}
			throw error;
		}

		throw new Error("Network error - please check your connection");
	}
}

/**
 * Helper function for GET requests
 */
export const get = <T = any>(endpoint: string, options?: RequestInit) =>
	fetchAPI<T>(endpoint, { method: "GET", ...options });

/**
 * Helper function for POST requests
 */
export const post = <T = any>(
	endpoint: string,
	body?: any,
	options?: RequestInit
) =>
	fetchAPI<T>(endpoint, {
		method: "POST",
		body: body ? JSON.stringify(body) : undefined,
		...options,
	});

/**
 * Helper function for PATCH requests
 */
export const patch = <T = any>(
	endpoint: string,
	body?: any,
	options?: RequestInit
) =>
	fetchAPI<T>(endpoint, {
		method: "PATCH",
		body: body ? JSON.stringify(body) : undefined,
		...options,
	});

/**
 * Helper function for DELETE requests
 */
export const del = <T = any>(endpoint: string, options?: RequestInit) =>
	fetchAPI<T>(endpoint, { method: "DELETE", ...options });
