import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

// Better error handling for missing database URL
if (!databaseUrl) {
  console.error("ERROR: No database URL configured. Please set SUPABASE_DB_URL or DATABASE_URL environment variable.");
  process.exit(1);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });

// Test database connection on startup
pool.connect().then(() => {
  console.log("✅ Database connected successfully");
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});
