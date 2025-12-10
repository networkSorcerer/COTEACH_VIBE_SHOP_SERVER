import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use configurable log level or default to dev
const logLevel = process.env.LOG_LEVEL || "dev";
app.use(morgan(logLevel));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;

