import express from "express";
import cors from "cors";
import { handleGenAiChat } from "./module/genAi/controller/controller.js";
import { errorLogger } from "./shared/logger.js";
import authRouter from './module/auth/controller/auth.controller.js';
import config from './shared/config.js';
import mongoose from "mongoose";
import userRoutes from './module/user/routes.js';


let server;

app.use(cors());
app.use(express.json({ limit: '22mb' }));

// Medical GenAI Chatbot Endpoint
app.post("/api/genai/chat", handleGenAiChat);
app.use('/api/users', userRoutes);
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { handleGenAiChat } from "./module/genAi/controller/controller.js";
import { errorLogger } from "./shared/logger.js";
import userRouter from "./user/userRoutes.js";
import { connectUserDatabase, seedUserDemoData } from "./user/model/userModel.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/users/uploads", express.static(join(fileURLToPath(new URL(".", import.meta.url)), "user", "uploads")));

// Medical GenAI Chatbot Endpoint
app.post("/api/genai/chat", handleGenAiChat);
app.use("/api/users", userRouter);

// Health check endpoint
app.get("/api/genai/health", (req, res) => {
  res.json({
    status: "ok",
    groqEndpoint: process.env.GROQ_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  });
});

// Auth Router
app.use('/api/auth', authRouter)

// Centralized Error Handling Middleware (logs to backend/logs/error.log)
app.use(errorLogger);

export async function startServer() {
  if (server) return server;

  if (!config.database.uri) {
    throw new Error('MONGODB_URI is required to store auth users and sessions');
  }

  await mongoose.connect(config.database.uri);
  console.log(`MongoDB connected (${config.abdm.mockMode ? 'mock ABDM mode' : 'real ABDM mode'})`);

  server = await new Promise((resolve, reject) => {
    const listeningServer = app.listen(PORT);
    const rejectStartup = error => reject(error);

    listeningServer.once('error', rejectStartup);
    listeningServer.once('listening', () => {
      listeningServer.off('error', rejectStartup);
      console.log(`Backend Express server running on http://localhost:${PORT}`);
      console.log(`Ollama API configured at: ${process.env.OLLAMA_ENDPOINT || "http://localhost:11434/api/chat"}`);
      resolve(listeningServer);
    });
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(error => {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  });
}
async function startServer() {
  app.listen(PORT, () => {
    console.log(`Backend Express server running on http://localhost:${PORT}`);
    console.log(`MongoDB user API available at http://localhost:${PORT}/api/users`);
  });
  try {
    await connectUserDatabase();
    await seedUserDemoData();
    console.log("MongoDB user data connected and ready.");
  } catch (error) {
    console.error("MongoDB is unavailable. User endpoints will work once it reconnects:", error.message);
  }
}

startServer();

export default app;
