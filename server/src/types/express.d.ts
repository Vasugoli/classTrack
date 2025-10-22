import type { AuthUser } from "../middleware/auth";

declare global {
	namespace Express {
		// augment Express Request with user attached by auth middleware
		interface Request {
			user?: AuthUser;
		}
	}
}

export {};
