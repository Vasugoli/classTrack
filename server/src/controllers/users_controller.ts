import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// Extend Express Request type to include 'user'
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: "STUDENT" | "TEACHER" | "ADMIN";
			};
		}
	}
}

export async function getProfile(req: Request, res: Response) {
	const user = await prisma.user.findUnique({
		where: { id: req.user!.id },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			interests: true,
			goals: true,
			enrollmentNo: true,
			year: true,
			branch: true,
		},
	});
	if (!user) return res.status(404).json({ error: "User not found" });
	res.json({ user });
}

const profileSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	interests: z.array(z.string().min(1)).optional(),
	goals: z.array(z.string().min(1)).optional(),
	enrollmentNo: z.string().min(1).optional(),
	year: z.number().int().min(1).max(10).optional(),
	branch: z.string().min(1).optional(),
});

export async function updateProfile(req: Request, res: Response) {
	try {
		const data = profileSchema.parse(req.body);
		const updated = await prisma.user.update({
			where: { id: req.user!.id },
			data: {
				name: data.name,
				interests: data.interests,
				goals: data.goals,
				enrollmentNo: data.enrollmentNo,
				year: data.year,
				branch: data.branch,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				interests: true,
				goals: true,
				enrollmentNo: true,
				year: true,
				branch: true,
			},
		});
		res.json({ user: updated });
	} catch (e: any) {
		res.status(400).json({ error: e?.message ?? "Invalid payload" });
	}
}

// Admin/Teacher: List all users with role-based filtering
export async function listAllUsers(req: Request, res: Response) {
	try {
		const currentUser = req.user!;
		let whereClause = {};

		// Teachers can only see students
		if (currentUser.role === "TEACHER") {
			whereClause = { role: "STUDENT" };
		}
		// Admins can see teachers and students (but not other admins for security)
		else if (currentUser.role === "ADMIN") {
			whereClause = {
				role: {
					in: ["STUDENT", "TEACHER"],
				},
			};
		}

		const users = await prisma.user.findMany({
			where: whereClause,
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				enrollmentNo: true,
				year: true,
				branch: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log(
			`[Users] ${currentUser.role} ${currentUser.id} fetched ${users.length} users`
		);
		res.json({ users });
	} catch (e: any) {
		console.error("[Users] Error fetching users:", e);
		res.status(500).json({ error: "Failed to fetch users" });
	}
}

// Admin: Update user role (only admins can change roles)
export async function updateUserRole(req: Request, res: Response) {
	try {
		const currentUser = req.user!;
		const { userId } = req.params;
		const { role } = z
			.object({ role: z.enum(["STUDENT", "TEACHER", "ADMIN"]) })
			.parse(req.body);

		// Only admins can update roles
		if (currentUser.role !== "ADMIN") {
			return res
				.status(403)
				.json({ error: "Only admins can update user roles" });
		}

		// Prevent admins from changing other admin roles for security
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true, email: true },
		});

		if (targetUser?.role === "ADMIN" && currentUser.id !== userId) {
			return res
				.status(403)
				.json({ error: "Cannot modify other admin accounts" });
		}

		const updated = await prisma.user.update({
			where: { id: userId },
			data: { role },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
			},
		});

		console.log(
			`[Users] Admin ${currentUser.id} changed role of ${updated.email} to ${role}`
		);
		res.json({ user: updated });
	} catch (e: any) {
		console.error("[Users] Error updating role:", e);
		res.status(400).json({ error: e?.message ?? "Failed to update role" });
	}
}

// Admin/Teacher: Delete user with role-based restrictions
export async function deleteUser(req: Request, res: Response) {
	try {
		const currentUser = req.user!;
		const { userId } = req.params;

		// Don't allow deleting yourself
		if (userId === currentUser.id) {
			return res.status(400).json({ error: "Cannot delete yourself" });
		}

		// Get the target user to check permissions
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true, email: true },
		});

		if (!targetUser) {
			return res.status(404).json({ error: "User not found" });
		}

		// Teachers can only delete students
		if (currentUser.role === "TEACHER" && targetUser.role !== "STUDENT") {
			return res
				.status(403)
				.json({ error: "Teachers can only delete student accounts" });
		}

		// Admins can delete teachers and students, but not other admins
		if (currentUser.role === "ADMIN" && targetUser.role === "ADMIN") {
			return res
				.status(403)
				.json({ error: "Cannot delete other admin accounts" });
		}

		await prisma.user.delete({
			where: { id: userId },
		});

		console.log(
			`[Users] ${currentUser.role} ${currentUser.id} deleted user ${targetUser.email}`
		);
		res.json({ ok: true });
	} catch (e: any) {
		console.error("[Users] Error deleting user:", e);
		res.status(400).json({ error: e?.message ?? "Failed to delete user" });
	}
}
