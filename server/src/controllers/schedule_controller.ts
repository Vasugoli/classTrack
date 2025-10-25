import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function listSchedule(req: Request, res: Response) {
    const schedules = await prisma.schedule.findMany({
        where: { userId: req.user!.id },
        include: { class: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    res.json({ schedules });
}

const upsertSchema = z.object({
    classCode: z.string(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
});

export async function createSchedule(req: Request, res: Response) {
    try {
        const data = upsertSchema.parse(req.body);
        const klass = await prisma.class.findUnique({
            where: { code: data.classCode },
        });
        if (!klass) return res.status(404).json({ error: "Class not found" });
        const created = await prisma.schedule.create({
            data: {
                userId: req.user!.id,
                classId: klass.id,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
            },
            include: { class: true },
        });
        return res.status(201).json({ schedule: created });
    } catch (e: any) {
        return res.status(400).json({ error: e?.message ?? "Invalid payload" });
    }
}

export async function deleteSchedule(req: Request, res: Response) {
    const id = req.params.id;
    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id)
        return res.status(404).json({ error: "Not found" });
    await prisma.schedule.delete({ where: { id } });
    return res.json({ ok: true });
}
