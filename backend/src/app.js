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
    groqEndpoint: process.env.GROQ_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  });
});

// Centralized Error Handling Middleware (logs to backend/logs/error.log)
app.use(errorLogger);

app.listen(PORT, () => {
  console.log(`Backend Express server running on http://localhost:${PORT}`);
  console.log(`Groq API configured at: ${process.env.GROQ_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions"}`);
});

export default app;
