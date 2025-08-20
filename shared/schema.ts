import { pgTable, text, varchar, serial, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// User profiles table (replaces Supabase auth.users + profiles)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  admission_year: integer("admission_year").notNull(),
  student_id: text("student_id").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  supervisor_name: text("supervisor_name").notNull(),
  year_of_submission: integer("year_of_submission").notNull(),
  description: text("description").notNull(),
  abstract: text("abstract"),
  keywords: text("keywords").array(),
  file_url: text("file_url"),
  file_name: text("file_name"),
  file_size: integer("file_size"),
  uploaded_by: uuid("uploaded_by").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// OTP codes table for authentication
export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const insertOtpCodeSchema = createInsertSchema(otpCodes);
export const selectOtpCodeSchema = createSelectSchema(otpCodes);

export type Profile = z.infer<typeof selectProfileSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Project = z.infer<typeof selectProjectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type OtpCode = z.infer<typeof selectOtpCodeSchema>;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;

// Legacy exports for compatibility
export type User = Profile;
export type InsertUser = InsertProfile;
