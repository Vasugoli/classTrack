import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
	id: string;
	role: UserRole;
}

function extractToken(req: Request): string | null {
	const header = req.headers["authorization"];
	if (header && header.startsWith("Bearer "))
		return header.substring("Bearer ".length);
	const cookie = (req as any).cookies?.token as string | undefined;
	return cookie ?? null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	try {
		const token = extractToken(req);
		if (!token) return res.status(401).json({ error: "Unauthorized" });
		const secret = process.env.JWT_SECRET || "dev-secret";
		const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
		const sub = decoded.sub as string | undefined;
		const role = (decoded as any).role as UserRole | undefined;
		if (!sub || !role)
			return res.status(401).json({ error: "Unauthorized" });
		req.user = { id: sub, role };
		next();
	} catch (_e) {
		return res.status(401).json({ error: "Unauthorized" });
	}
}

export function requireRole(...roles: UserRole[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ error: "Unauthorized" });
		if (!roles.includes(req.user.role))
			return res.status(403).json({ error: "Forbidden" });
		next();
	};
}
