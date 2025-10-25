import type { AuthUser } from "../middleware/auth";

declare global {
    namespace Express {
        // augment Express Request with user attached by auth middleware
        interface Request {
            user?: AuthUser;
            deviceFingerprint?: string;
            validatedLocation?: {
                latitude: number;
                longitude: number;
            };
        }
    }
}

export {};
