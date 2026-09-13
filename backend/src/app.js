import express from "express";
import http from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { handleGenAiChat } from "./module/genAi/controller/controller.js";
import authRouter from "./module/auth/controller/auth.controller.js";
import userRoutes from "./module/user/routes.js";
import doctorRoutes from "./module/doctor/routes/doctorRoutes.js";
import config from "./shared/config.js";
import { errorLogger } from "./shared/logger.js";
import {
  startRealtimeDatabaseEvents,
  stopRealtimeDatabaseEvents,
} from "./shared/realtime.js";

const app = express();
const port = Number(process.env.PORT || 5001);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});
let server;

io.on("connection", (socket) => {
  console.log(`Realtime client connected: ${socket.id}`);
  socket.on("disconnect", () =>
    console.log(`Realtime client disconnected: ${socket.id}`),
  );
});

app.use(cors());
app.use(express.json({ limit: "22mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/genai/health", (_req, res) =>
  res.json({
    status: "ok",
    groqEndpoint:
      process.env.GROQ_ENDPOINT ||
      "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  }),
);
app.post("/api/genai/chat", handleGenAiChat);
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/doctor", doctorRoutes);
app.use(errorLogger);

export async function startServer() {
  if (server) return server;
  if (!config.database.uri)
    throw new Error("MONGODB_URI is required. Configure backend/.env.");
  console.log("Connecting to MongoDB...", config.database.uri);
  await mongoose.connect(config.database.uri, {
    serverSelectionTimeoutMS: 10_000,
  });
  startRealtimeDatabaseEvents(io);
  server = await new Promise((resolve, reject) => {
    const candidate = httpServer.listen(port);
    candidate.once("error", reject);
    candidate.once("listening", () => resolve(candidate));
  });
  console.log(`AESIX API listening on http://localhost:${port}`);
  return server;
}

export async function stopServer() {
  if (!server) return;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  server = undefined;
  await stopRealtimeDatabaseEvents();
  await mongoose.disconnect();
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

export default app;
