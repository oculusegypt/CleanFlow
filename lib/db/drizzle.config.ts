import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

// __dirname here is lib/db — go up two levels to reach workspace root
const dbDir = path.join(__dirname, "../../data");
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = process.env["DB_PATH"] ?? path.join(dbDir, "sabaik.db");

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
