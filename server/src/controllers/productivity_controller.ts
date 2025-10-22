import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getSuggestions(req: Request, res: Response) {
	const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
	const interests = user?.interests ?? [];
	const goals = user?.goals ?? [];
	const suggestions = [
		...interests.map((i) => ({
			title: `Read 1 article on ${i}`,
			category: "skill",
		})),
		...goals.map((g) => ({
			title: `Progress toward: ${g}`,
			category: "career",
		})),
	];
	res.json({ suggestions });
}

const taskSchema = z.object({
	title: z.string().min(2),
	description: z.string().optional(),
	category: z.string().default("academic"),
	priority: z.number().min(1).max(5).default(3),
	dueDate: z.string().datetime().optional(),
});

export async function listTasks(req: Request, res: Response) {
	const tasks = await prisma.task.findMany({
		where: { userId: req.user!.id },
		orderBy: { createdAt: "desc" },
	});
	res.json({ tasks });
}

export async function createTask(req: Request, res: Response) {
	try {
		const data = taskSchema.parse(req.body);
		const created = await prisma.task.create({
			data: {
				userId: req.user!.id,
				title: data.title,
				description: data.description,
				category: data.category,
				priority: data.priority,
				dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
			},
		});
		res.status(201).json({ task: created });
	} catch (e: any) {
		res.status(400).json({ error: e?.message ?? "Invalid payload" });
	}
}

export async function updateTask(req: Request, res: Response) {
	const id = req.params.id;
	const existing = await prisma.task.findUnique({ where: { id } });
	if (!existing || existing.userId !== req.user!.id)
		return res.status(404).json({ error: "Not found" });
	const updated = await prisma.task.update({
		where: { id },
		data: {
			completed:
				typeof req.body.completed === "boolean"
					? req.body.completed
					: existing.completed,
			title: req.body.title ?? existing.title,
			description: req.body.description ?? existing.description,
			category: req.body.category ?? existing.category,
			priority:
				typeof req.body.priority === "number"
					? req.body.priority
					: existing.priority,
			dueDate: req.body.dueDate
				? new Date(req.body.dueDate)
				: existing.dueDate,
		},
	});
	res.json({ task: updated });
}

export async function deleteTask(req: Request, res: Response) {
	const id = req.params.id;
	const existing = await prisma.task.findUnique({ where: { id } });
	if (!existing || existing.userId !== req.user!.id)
		return res.status(404).json({ error: "Not found" });
	await prisma.task.delete({ where: { id } });
	res.json({ ok: true });
}
