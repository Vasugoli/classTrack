import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function listClasses(req: Request, res: Response) {
	const all = req.query.all === "1";

	let where = {};

	// ADMIN with ?all=1 sees all classes
	if (req.user!.role === "ADMIN" && all) {
		where = {};
	}
	// TEACHER sees only their own classes
	else if (req.user!.role === "TEACHER") {
		where = { teacherId: req.user!.id };
	}
	// STUDENT sees all classes (so they can join them)
	else if (req.user!.role === "STUDENT") {
		where = {};
	}

	const classes = await prisma.class.findMany({
		where,
		orderBy: { name: "asc" },
	});
	res.json({ classes });
}

const createSchema = z.object({
	name: z.string().min(2),
	code: z.string().min(2),
	room: z.string().optional(),
	qrCode: z.string().optional(),
	teacherId: z.string().optional(),
});

export async function createClass(req: Request, res: Response) {
	try {
		const data = createSchema.parse(req.body);
		const teacherId =
			req.user!.role === "ADMIN"
				? data.teacherId ?? req.user!.id
				: req.user!.id;
		const created = await prisma.class.create({
			data: {
				name: data.name,
				code: data.code,
				room: data.room,
				qrCode: data.qrCode,
				teacherId,
			},
		});
		res.status(201).json({ class: created });
	} catch (e: any) {
		res.status(400).json({ error: e?.message ?? "Invalid payload" });
	}
}

const updateSchema = z.object({
	name: z.string().min(2).optional(),
	code: z.string().min(2).optional(),
	room: z.string().optional(),
	qrCode: z.string().optional(),
});

export async function updateClass(req: Request, res: Response) {
	try {
		const { classId } = req.params;
		const data = updateSchema.parse(req.body);

		// Check if class exists and user has permission
		const existingClass = await prisma.class.findUnique({
			where: { id: classId },
		});

		if (!existingClass) {
			return res.status(404).json({ error: "Class not found" });
		}

		// Teachers can only update their own classes, admins can update any
		if (
			req.user!.role !== "ADMIN" &&
			existingClass.teacherId !== req.user!.id
		) {
			return res.status(403).json({
				error: "You can only update your own classes",
			});
		}

		const updated = await prisma.class.update({
			where: { id: classId },
			data,
		});

		return res.json({ class: updated });
	} catch (e: any) {
		return res.status(400).json({ error: e?.message ?? "Invalid payload" });
	}
}

export async function deleteClass(req: Request, res: Response) {
	try {
		const { classId } = req.params;

		// Check if class exists
		const existingClass = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				_count: {
					select: {
						attendances: true,
						schedules: true,
					},
				},
			},
		});

		if (!existingClass) {
			return res.status(404).json({ error: "Class not found" });
		}

		// Teachers can only delete their own classes, admins can delete any
		if (
			req.user!.role !== "ADMIN" &&
			existingClass.teacherId !== req.user!.id
		) {
			return res.status(403).json({
				error: "You can only delete your own classes",
			});
		}

		// Check if class has attendance records or schedules
		if (
			existingClass._count.attendances > 0 ||
			existingClass._count.schedules > 0
		) {
			return res.status(400).json({
				error: "Cannot delete class with existing attendance records or schedules. Please remove them first.",
			});
		}

		await prisma.class.delete({
			where: { id: classId },
		});

		return res.json({ message: "Class deleted successfully" });
	} catch (e: any) {
		return res
			.status(400)
			.json({ error: e?.message ?? "Failed to delete class" });
	}
}
