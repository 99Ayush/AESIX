import express from "express";
import cors from "cors";
import { handleGenAiChat } from "./module/genAi/controller/controller.js";
import { errorLogger } from "./shared/logger.js";
import authRouter from './module/auth/controller/auth.controller.js';
import config from './shared/config.js';
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;
let server;

app.use(cors());
app.use(express.json());

// Medical GenAI Chatbot Endpoint
app.post("/api/genai/chat", handleGenAiChat);

// Health check endpoint
app.get("/api/genai/health", (req, res) => {
  res.json({
    status: "ok",
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || "http://localhost:11434/api/chat",
    model: process.env.OLLAMA_MODEL || "llama3.2:latest",
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

export default app;
