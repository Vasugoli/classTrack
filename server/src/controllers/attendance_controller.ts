import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "../middleware/auditLogger";
import crypto from "crypto";

const markSchema = z.object({
	classCode: z.string(),
	status: z.enum(["PRESENT", "ABSENT", "LATE"]).default("PRESENT"),
	token: z.string().min(1), // Session token required
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

const tokenGenerationSchema = z.object({
	classId: z.string(),
	expiresInSeconds: z.number().min(30).max(300).default(60), // 30s to 5min, default 60s
});

export async function markAttendance(req: Request, res: Response) {
	try {
		// At this point, middleware has already validated:
		// - JWT authentication
		// - Device binding
		// - Geo-location
		// - Session token validity
		// - Audit logging

		const user = (req as any).user;
		const { classCode, status, token, latitude, longitude } =
			markSchema.parse(req.body);

		// Log attendance attempt
		await createAuditLog(
			user.id,
			AUDIT_ACTIONS.ATTENDANCE_ATTEMPT,
			req,
			{
				classCode,
				status,
				location: `${latitude},${longitude}`,
			},
			`${latitude},${longitude}`
		);

		// Find class by code
		const klass = await prisma.class.findUnique({
			where: { code: classCode },
		});

		if (!klass) {
			await createAuditLog(user.id, AUDIT_ACTIONS.ATTENDANCE_FAIL, req, {
				reason: "Class not found",
				classCode,
			});
			return res.status(404).json({
				error: "Class not found",
				code: "CLASS_NOT_FOUND",
			});
		}

		// Validate session token (final check)
		const sessionToken = await prisma.sessionToken.findUnique({
			where: { token },
		});

		if (!sessionToken) {
			await createAuditLog(user.id, AUDIT_ACTIONS.TOKEN_INVALID, req, {
				reason: "Session token not found",
				classId: klass.id,
			});
			return res.status(400).json({
				error: "Invalid session token",
				code: "TOKEN_INVALID",
			});
		}

		if (sessionToken.used) {
			await createAuditLog(user.id, AUDIT_ACTIONS.TOKEN_USED, req, {
				reason: "Token already used",
				tokenId: sessionToken.id,
			});
			return res.status(400).json({
				error: "Session token has already been used",
				code: "TOKEN_ALREADY_USED",
			});
		}

		if (sessionToken.expiresAt < new Date()) {
			await createAuditLog(user.id, AUDIT_ACTIONS.TOKEN_EXPIRED, req, {
				reason: "Token expired",
				tokenId: sessionToken.id,
			});
			return res.status(400).json({
				error: "Session token has expired",
				code: "TOKEN_EXPIRED",
			});
		}

		if (sessionToken.classId !== klass.id) {
			await createAuditLog(user.id, AUDIT_ACTIONS.TOKEN_INVALID, req, {
				reason: "Token class mismatch",
				tokenClassId: sessionToken.classId,
				requestClassId: klass.id,
			});
			return res.status(400).json({
				error: "Session token is not valid for this class",
				code: "TOKEN_CLASS_MISMATCH",
			});
		}

		// Check if student is enrolled in this class (has schedule)
		const schedule = await prisma.schedule.findFirst({
			where: {
				userId: user.id,
				classId: klass.id,
			},
		});

		if (!schedule) {
			await createAuditLog(user.id, AUDIT_ACTIONS.ATTENDANCE_FAIL, req, {
				reason: "Student not enrolled in class",
				classId: klass.id,
			});
			return res.status(403).json({
				error: "You are not enrolled in this class",
				code: "NOT_ENROLLED",
			});
		}

		// Get today's date for attendance record
		const today = new Date();
		const startOfDay = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		);

		// Mark attendance (upsert to handle duplicate attempts)
		const record = await prisma.$transaction(async (prisma) => {
			// Mark token as used
			await prisma.sessionToken.update({
				where: { id: sessionToken.id },
				data: { used: true },
			});

			// Create or update attendance record
			return await prisma.attendance.upsert({
				where: {
					userId_classId_date: {
						userId: user.id,
						classId: klass.id,
						date: startOfDay,
					},
				},
				update: {
					status,
					markedBy: user.id,
				},
				create: {
					userId: user.id,
					classId: klass.id,
					date: startOfDay,
					status,
					markedBy: user.id,
				},
				include: {
					class: {
						select: {
							name: true,
							code: true,
							room: true,
						},
					},
				},
			});
		});

		// Log successful attendance
		await createAuditLog(
			user.id,
			AUDIT_ACTIONS.ATTENDANCE_SUCCESS,
			req,
			{
				classId: klass.id,
				className: klass.name,
				status,
				attendanceId: record.id,
				tokenUsed: sessionToken.id,
			},
			`${latitude},${longitude}`
		);

		console.log(
			`[ATTENDANCE] Successfully marked ${status} for user ${user.id} in class ${klass.code}`
		);

		return res.json({
			success: true,
			attendance: {
				id: record.id,
				status: record.status,
				date: record.date,
				class: record.class,
				markedAt: new Date().toISOString(),
			},
			message: `Attendance marked as ${status.toLowerCase()} for ${
				klass.name
			}`,
		});
	} catch (error) {
		console.error("[ATTENDANCE] Attendance marking failed:", error);

		// Log the error
		if ((req as any).user?.id) {
			await createAuditLog(
				(req as any).user.id,
				AUDIT_ACTIONS.ATTENDANCE_FAIL,
				req,
				{
					reason: "Attendance marking error",
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				}
			);
		}

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: "Invalid request data",
				code: "VALIDATION_ERROR",
				details: error.errors,
			});
		}

		return res.status(500).json({
			error: "Attendance marking failed",
			code: "ATTENDANCE_ERROR",
		});
	}
}

/**
 * Generates a single-use session token for a class (teachers only)
 * POST /api/attendance/token
 */
export async function generateSessionToken(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		if (!user?.id) {
			return res.status(401).json({
				error: "Authentication required",
				code: "AUTH_REQUIRED",
			});
		}

		// Only teachers and admins can generate tokens
		if (user.role !== "TEACHER" && user.role !== "ADMIN") {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{ reason: "Non-teacher attempted token generation" }
			);
			return res.status(403).json({
				error: "Only teachers can generate session tokens",
				code: "TEACHER_REQUIRED",
			});
		}

		const { classId, expiresInSeconds } = tokenGenerationSchema.parse(
			req.body
		);

		// Verify the class exists and teacher has access
		const klass = await prisma.class.findUnique({
			where: { id: classId },
		});

		if (!klass) {
			return res.status(404).json({
				error: "Class not found",
				code: "CLASS_NOT_FOUND",
			});
		}

		if (klass.teacherId !== user.id) {
			await createAuditLog(
				user.id,
				AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
				req,
				{
					reason: "Teacher attempted to generate token for class they don't teach",
				}
			);
			return res.status(403).json({
				error: "You can only generate tokens for classes you teach",
				code: "NOT_YOUR_CLASS",
			});
		}

		// Generate unique token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

		// Clean up expired tokens for this class
		await prisma.sessionToken.deleteMany({
			where: {
				classId,
				expiresAt: {
					lt: new Date(),
				},
			},
		});

		// Create new session token
		const sessionToken = await prisma.sessionToken.create({
			data: {
				classId,
				token,
				expiresAt,
				used: false,
			},
		});

		console.log(
			`[TOKEN] Generated session token for class ${klass.code} by teacher ${user.id}`
		);

		return res.status(201).json({
			success: true,
			token: sessionToken.token,
			classId: sessionToken.classId,
			expiresAt: sessionToken.expiresAt,
			expiresInSeconds,
			class: {
				id: klass.id,
				name: klass.name,
				code: klass.code,
				room: klass.room,
			},
			instructions: {
				usage: "Students must use this token to mark attendance",
				expiry: `Token expires in ${expiresInSeconds} seconds`,
				security: "Token can only be used once per student",
			},
		});
	} catch (error) {
		console.error("[TOKEN] Token generation failed:", error);

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: "Invalid request data",
				code: "VALIDATION_ERROR",
				details: error.errors,
			});
		}

		return res.status(500).json({
			error: "Token generation failed",
			code: "TOKEN_ERROR",
		});
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
