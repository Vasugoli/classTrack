import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const markSchema = z.object({
	classCode: z.string(),
	status: z.enum(["PRESENT", "ABSENT", "LATE"]).default("PRESENT"),
});

export async function markAttendance(req: Request, res: Response) {
	try {
		const { classCode, status } = markSchema.parse(req.body);
		const klass = await prisma.class.findUnique({
			where: { code: classCode },
		});
		if (!klass) return res.status(404).json({ error: "Class not found" });
		const today = new Date();
		const startOfDay = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		);
		const record = await prisma.attendance.upsert({
			where: {
				userId_classId_date: {
					userId: req.user!.id,
					classId: klass.id,
					date: startOfDay,
				},
			},
			update: { status },
			create: {
				userId: req.user!.id,
				classId: klass.id,
				date: startOfDay,
				status,
				markedBy: req.user!.id,
			},
		});
		return res.json({ attendance: record });
	} catch (e: any) {
		return res.status(400).json({ error: e?.message ?? "Invalid payload" });
	}
}

export async function getTodayAttendance(req: Request, res: Response) {
	const today = new Date();
	const startOfDay = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate()
	);
	const records = await prisma.attendance.findMany({
		where: { userId: req.user!.id, date: startOfDay },
		include: { class: true },
	});
	res.json({ records });
}

export async function getAttendanceHistory(req: Request, res: Response) {
	const records = await prisma.attendance.findMany({
		where: { userId: req.user!.id },
		orderBy: { date: "desc" },
		include: { class: true },
	});
	res.json({ records });
}

// Get attendance by class (for teachers/admins)
export async function getAttendanceByClass(req: Request, res: Response) {
	try {
		const { classId } = req.params;

		const attendance = await prisma.attendance.findMany({
			where: { classId },
			orderBy: { date: "desc" },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						enrollmentNo: true,
					},
				},
			},
		});

		res.json({ attendance });
	} catch (e: any) {
		res.status(400).json({
			error: e?.message ?? "Failed to fetch attendance",
		});
	}
}
