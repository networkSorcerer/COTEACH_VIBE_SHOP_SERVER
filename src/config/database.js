import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is required to connect to MongoDB");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  return mongoose.connection;
}

