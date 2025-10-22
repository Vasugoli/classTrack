import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function listClasses(req: Request, res: Response) {
	const all = req.query.all === "1";
	const where =
		req.user!.role === "ADMIN" && all ? {} : { teacherId: req.user!.id };
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
