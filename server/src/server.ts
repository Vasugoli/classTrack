import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma";
import authRouter from "./routes/auth";
import attendanceRouter from "./routes/attendance";
import scheduleRouter from "./routes/schedule";
import productivityRouter from "./routes/productivity";
import classesRouter from "./routes/classes";
import usersRouter from "./routes/users";
import deviceRouter from "./routes/device";
import auditRouter from "./routes/audit";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV });
});

app.use("/api/auth", authRouter);
app.use("/api/classes", classesRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/productivity", productivityRouter);
app.use("/api/users", usersRouter);
app.use("/api/device", deviceRouter);
app.use("/api/audit", auditRouter);

import type { Request, Response, NextFunction } from "express";
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
