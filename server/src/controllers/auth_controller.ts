import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
    enrollmentNo: z.string().optional(),
});

export async function register(req: Request, res: Response) {
    try {
        const data = registerSchema.parse(req.body);

        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing)
            return res.status(409).json({ error: "Email already in use" });

        const hashed = await bcrypt.hash(data.password, 10);
        const { enrollmentNo, ...rest } = data;
        const user = await prisma.user.create({
            data: {
                ...rest,
                enrollmentNo: enrollmentNo ?? null,
                password: hashed,
            },
            select: { id: true, email: true, name: true, role: true },
        });

        return res.status(201).json({ user });
    } catch (e: any) {
        return res.status(400).json({ error: e?.message ?? "Invalid payload" });
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
});

export async function login(req: Request, res: Response) {
    try {
        const {
            email,
            password,
            role: requestedRole,
        } = loginSchema.parse(req.body);

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(
                `[Auth] Failed login attempt for email: ${email} - User not found`,
            );
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            console.log(
                `[Auth] Failed login attempt for email: ${email} - Invalid password`,
            );
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Validate role if provided (role-based login)
        if (requestedRole && user.role !== requestedRole) {
            console.log(
                `[Auth] Role mismatch for ${email}: requested ${requestedRole}, actual ${user.role}`,
            );
            return res.status(403).json({
                error: `This account is registered as ${user.role}, not ${requestedRole}. Please select the correct role.`,
                actualRole: user.role,
                requestedRole: requestedRole,
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );

        console.log(`[Auth] Successful login: ${user.email} as ${user.role}`);

        return res
            .cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
    } catch (e: any) {
        console.error("[Auth] Login error:", e);
        return res.status(400).json({ error: e?.message ?? "Invalid payload" });
    }
}

export async function logout(_req: Request, res: Response) {
    return res
        .clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        })
        .json({ ok: true });
}
