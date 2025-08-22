import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const databaseUrl = process.env.SUPABASE_DB_URL;

// Better error handling for missing configuration
if (!supabaseUrl || !supabaseAnonKey || !databaseUrl) {
  console.error("ERROR: Missing Supabase configuration. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_DB_URL environment variables.");
  process.exit(1);
}

// Create Supabase client for auth and other operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create direct database connection for Drizzle ORM
const sql = postgres(databaseUrl);
export const db = drizzle(sql, { schema });
// Test database connection on startup
sql`SELECT 1`.then(() => {
  console.log("✅ Database connected successfully");
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});
