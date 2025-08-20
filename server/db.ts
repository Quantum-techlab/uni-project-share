import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, use a fallback or disable database operations
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || 
  "postgresql://postgres:password@localhost:54322/postgres";

// In development without proper DB URL, we'll create a mock connection
if (!process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL) {
  console.warn("Warning: No database URL configured. Using fallback for development.");
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
