import express from "express";
import cors from "cors";
import "dotenv/config";
import { handleGenAiChat } from "./module/genAi/controller/controller.js";
import { errorLogger } from "./shared/logger.js";
import userRoutes from './module/user/routes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '22mb' }));

// Medical GenAI Chatbot Endpoint
app.post("/api/genai/chat", handleGenAiChat);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get("/api/genai/health", (req, res) => {
  res.json({
    status: "ok",
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || "http://localhost:11434/api/chat",
    model: process.env.OLLAMA_MODEL || "llama3.2:latest",
  });
});

// Centralized Error Handling Middleware (logs to backend/logs/error.log)
app.use(errorLogger);

app.listen(PORT, () => {
  console.log(`Backend Express server running on http://localhost:${PORT}`);
  console.log(`Ollama API configured at: ${process.env.OLLAMA_ENDPOINT || "http://localhost:11434/api/chat"}`);
});

export default app;
