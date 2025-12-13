import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";



// Ensure we load the .env that lives in the server project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");

dotenv.config({ path: envPath });

console.log("Loading .env from:", envPath);
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function bootstrap() {
  try {
    await connectDatabase(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();

