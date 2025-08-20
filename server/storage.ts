import { profiles, projects, otpCodes, type Profile, type InsertProfile, type Project, type InsertProject, type OtpCode, type InsertOtpCode } from "@shared/schema";
import { eq, and, gt, or, lt } from "drizzle-orm";
import { db } from "./db";

// Updated interface for database operations
export interface IStorage {
  // Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // OTP operations
  createOtpCode(otpData: InsertOtpCode): Promise<OtpCode>;
  verifyOtpCode(email: string, code: string): Promise<OtpCode | undefined>;
  cleanupExpiredOtps(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.created_at);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.uploaded_by, userId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...project, updated_at: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // OTP operations
  async createOtpCode(otpData: InsertOtpCode): Promise<OtpCode> {
    const result = await db.insert(otpCodes).values(otpData).returning();
    return result[0];
  }

  async verifyOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    const result = await db.select().from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gt(otpCodes.expires_at, new Date())
        )
      )
      .limit(1);
    
    if (result[0]) {
      // Mark as used
      await db.update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, result[0].id));
    }
    
    return result[0];
  }

  async cleanupExpiredOtps(): Promise<void> {
    await db.delete(otpCodes).where(
      or(
        eq(otpCodes.used, true),
        lt(otpCodes.expires_at, new Date())
      )
    );
  }
}

export const storage = new DatabaseStorage();
