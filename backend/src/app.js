import express from "express";
import http from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import dns from "node:dns";
import { Server } from "socket.io";

try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS override errors
}
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
  try {
    await mongoose.connect(config.database.uri, {
      serverSelectionTimeoutMS: 8_000,
      family: 4,
    });
  } catch (error) {
    if (config.database.uri.startsWith("mongodb+srv://")) {
      console.warn("MongoDB SRV connection attempt failed. Executing DoH direct connection fallback...");
      const match = config.database.uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?(?:\?(.*))?$/);
      if (match) {
        const [, user, pass, host, db = "aesix"] = match;
        const res = await fetch(`https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`, {
          headers: { accept: "application/dns-json" },
        });
        const data = await res.json();
        if (data.Answer && data.Answer.length > 0) {
          const hosts = data.Answer.map((a) => {
            const parts = a.data.trim().split(/\s+/);
            return { host: parts[3].replace(/\.$/, ""), port: parts[2] };
          });
          let connected = false;
          for (const target of hosts) {
            try {
              const directUri = `mongodb://${user}:${pass}@${target.host}:${target.port}/${db || "aesix"}?ssl=true&authSource=admin&directConnection=true`;
              const tempConn = await mongoose.connect(directUri, { serverSelectionTimeoutMS: 4_000, family: 4 });
              const isMaster = await tempConn.connection.db.command({ isMaster: 1 });
              if (isMaster.ismaster || isMaster.isWritablePrimary) {
                console.log(`Connected to writable primary MongoDB node (${target.host}:${target.port})!`);
                connected = true;
                break;
              } else {
                await mongoose.disconnect();
              }
            } catch (hostErr) {
              // Try next host candidate
            }
          }
          if (!connected) {
            const target = hosts[0];
            const directUri = `mongodb://${user}:${pass}@${target.host}:${target.port}/${db || "aesix"}?ssl=true&authSource=admin&directConnection=true`;
            await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10_000, family: 4 });
            console.log("Direct MongoDB connection established!");
          }
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
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
