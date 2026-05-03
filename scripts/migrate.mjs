import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: join(__dirname, "../drizzle/migrations") });
    console.log("Migrations completed successfully");
  } finally {
    await pool.end();
  }
}

// PostgreSQL "already exists" error codes — schema is already in the desired state
const ALREADY_EXISTS_CODES = new Set(["42710", "42P07", "42701", "42P16"]);

runMigrations().catch((err) => {
  if (ALREADY_EXISTS_CODES.has(err?.code)) {
    console.warn("Migration skipped — schema already exists:", err.message);
    process.exit(0);
  }
  console.error("Migration failed:", err);
  process.exit(1);
});
