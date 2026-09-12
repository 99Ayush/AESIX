import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { handleGenAiChat } from './module/genAi/controller/controller.js';
import authRouter from './module/auth/controller/auth.controller.js';
import userRoutes from './module/user/routes.js';
import config from './shared/config.js';
import { errorLogger } from './shared/logger.js';

const app = express();
const port = Number(process.env.PORT || 5000);
let server;

app.use(cors());
app.use(express.json({ limit: '22mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/genai/health', (_req, res) => res.json({
  status: 'ok',
  groqEndpoint: process.env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions',
  model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
}));
app.post('/api/genai/chat', handleGenAiChat);
app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use(errorLogger);

export async function startServer() {
  if (server) return server;
  if (!config.database.uri) throw new Error('MONGODB_URI is required. Configure backend/.env.');

  await mongoose.connect(config.database.uri, { serverSelectionTimeoutMS: 10_000 });
  server = await new Promise((resolve, reject) => {
    const candidate = app.listen(port);
    candidate.once('error', reject);
    candidate.once('listening', () => resolve(candidate));
  });
  console.log(`AESIX API listening on http://localhost:${port}`);
  return server;
}

export async function stopServer() {
  if (!server) return;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  server = undefined;
  await mongoose.disconnect();
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

export default app;
