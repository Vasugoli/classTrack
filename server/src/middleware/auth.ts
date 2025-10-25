import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

function extractToken(req: Request): string | null {
    const header = req.headers["authorization"];
    if (header && header.startsWith("Bearer "))
        return header.substring("Bearer ".length);
    const cookie = (req as any).cookies?.token as string | undefined;
    return cookie ?? null;
}

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const secret = process.env.JWT_SECRET || "dev-secret";
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
        const sub = decoded.sub as string | undefined;
        const email = (decoded as any).email as string | undefined;
        const role = (decoded as any).role as UserRole | undefined;
        if (!sub || !role || !email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        req.user = { id: sub, role, email } as AuthUser;
        next();
    } catch (_e) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
}

export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        next();
    };
}
