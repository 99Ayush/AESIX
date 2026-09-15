// import mongoose from "mongoose";
import config from "./shared/config.js";

export async function connectDatabase() {
  // const uri ="mongodb+srv://ayushpanther_db_user:K0dEyxPngLRn5i9B@aesix-db.85x9avh.mongodb.net";

  const uri = config.database.uri;
  console.log(uri);
  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  try {
    await mongoose.connect(uri);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB runtime error: ${error.message}`);
  });
}

function check() {
  const uri = config.database.uri;
  console.log(uri);
}

check();
