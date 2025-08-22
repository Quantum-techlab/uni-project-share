import { profiles, projects, otpCodes, type Profile, type InsertProfile, type Project, type InsertProject, type OtpCode, type InsertOtpCode } from "@shared/schema";
import { eq, and, gt, or, lt, desc } from "drizzle-orm";
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
  getRecentOtpCodes(email: string, since: Date): Promise<OtpCode[]>;
  cleanupExpiredOtps(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    try {
      const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get profile');
    }
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    try {
      const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting profile by email:', error);
      throw new Error('Failed to get profile by email');
    }
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    try {
      const result = await db.insert(profiles).values(profile).returning();
      if (!result[0]) {
        throw new Error('Failed to create profile');
      }
      return result[0];
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects).orderBy(desc(projects.created_at));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to get projects');
    }
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    try {
      return await db.select().from(projects)
        .where(eq(projects.uploaded_by, userId))
        .orderBy(desc(projects.created_at));
    } catch (error) {
      console.error('Error getting projects by user:', error);
      throw new Error('Failed to get user projects');
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const result = await db.insert(projects).values(project).returning();
      if (!result[0]) {
        throw new Error('Failed to create project');
      }
      return result[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const result = await db.update(projects)
        .set({ ...project, updated_at: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  // OTP operations
  async createOtpCode(otpData: InsertOtpCode): Promise<OtpCode> {
    try {
      const result = await db.insert(otpCodes).values(otpData).returning();
      if (!result[0]) {
        throw new Error('Failed to create OTP code');
      }
      return result[0];
    } catch (error) {
      console.error('Error creating OTP code:', error);
      throw new Error('Failed to create OTP code');
    }
  }

  async verifyOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    try {
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
        return result[0];
      }
      
      return undefined;
    } catch (error) {
      console.error('Error verifying OTP code:', error);
      throw new Error('Failed to verify OTP code');
    }
  }

  async getRecentOtpCodes(email: string, since: Date): Promise<OtpCode[]> {
    try {
      return await db.select().from(otpCodes)
        .where(
          and(
            eq(otpCodes.email, email),
            gt(otpCodes.created_at, since)
          )
        )
        .orderBy(desc(otpCodes.created_at));
    } catch (error) {
      console.error('Error getting recent OTP codes:', error);
      throw new Error('Failed to get recent OTP codes');
    }
  }

  async cleanupExpiredOtps(): Promise<number> {
    try {
      const result = await db.delete(otpCodes).where(
        or(
          eq(otpCodes.used, true),
          lt(otpCodes.expires_at, new Date())
        )
      );
      const deletedCount = result.length;
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired OTP codes`);
      }
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw new Error('Failed to cleanup expired OTPs');
    }
  }
}

export const storage = new DatabaseStorage();
