import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string().regex(
  /^(\d{2})-52HL(\d{3})@students\.unilorin\.edu\.ng$/,
  "Email must follow the format: YY-52HL001@students.unilorin.edu.ng"
);

// Request validation schemas
const sendOtpSchema = z.object({
  email: emailSchema
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z.string().length(6, "OTP must be 6 digits"),
});

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  supervisor_name: z.string().min(1, "Supervisor name is required"),
  year_of_submission: z.number().min(2015).max(new Date().getFullYear() + 1),
  description: z.string().min(1, "Description is required"),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
});

// Utility functions
function validateUniversityEmail(email: string) {
  const pattern = /^(\d{2})-52HL(\d{3})@students\.unilorin\.edu\.ng$/;
  const match = email.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: 'Email must follow the format: YY-52HL001@students.unilorin.edu.ng'
    };
  }

  const admissionYear = parseInt(`20${match[1]}`);
  const studentId = match[2];

  // Validate year range
  const currentYear = new Date().getFullYear();
  if (admissionYear < 2015 || admissionYear > currentYear) {
    return {
      valid: false,
      error: 'Invalid admission year in email format'
    };
  }

  // Validate student ID range
  const idNumber = parseInt(studentId);
  if (idNumber < 1 || idNumber > 999) {
    return {
      valid: false,
      error: 'Student ID must be between 001 and 999'
    };
  }

  return {
    valid: true,
    admissionYear,
    studentId
  };
}

function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Mock email sending (replace with real email service)
async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  console.log(`[EMAIL] Sending OTP ${code} to ${email}`);
  // TODO: Integrate with real email service like SendGrid, AWS SES, etc.
  return true;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = `otp:${email}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      // Validate request body
      const validation = sendOtpSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.issues[0].message 
        });
      }

      const { email } = validation.data;

      // Rate limiting
      if (!checkRateLimit(email)) {
        return res.status(429).json({ 
          error: "Too many OTP requests. Please try again in 15 minutes.",
          retryAfter: 15 * 60
        });
      }

      // Validate email format
      const emailValidation = validateUniversityEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.error });
      }

      // Check for recent OTP requests (allow new requests after 1 minute)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentOtps = await storage.getRecentOtpCodes(email, oneMinuteAgo);
      
      if (recentOtps.length > 0) {
        const lastOtp = recentOtps[0];
        const timeSinceLastOtp = Date.now() - lastOtp.created_at.getTime();
        const secondsRemaining = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
        
        if (secondsRemaining > 0) {
          return res.status(429).json({ 
            error: `Please wait ${secondsRemaining} seconds before requesting a new OTP`,
            retryAfter: secondsRemaining
          });
        }
      }

      // Generate OTP code
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await storage.createOtpCode({
        email,
        code,
        expires_at: expiresAt,
        used: false
      });

      // Send email
      const emailSent = await sendOtpEmail(email, code);
      if (!emailSent) {
        return res.status(500).json({ error: "Failed to send email" });
      }

      // For development, include the OTP in the response
      res.json({ 
        message: "OTP sent successfully",
        ...(process.env.NODE_ENV === 'development' && { developmentOtp: code })
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      // Validate request body
      const validation = verifyOtpSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.issues[0].message 
        });
      }

      const { email, token } = validation.data;
      
      // Validate email format
      const emailValidation = validateUniversityEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.error });
      }

      // Verify OTP
      const otpRecord = await storage.verifyOtpCode(email, token);
      if (!otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP code" });
      }

      // Check if profile exists, create if not
      let profile = await storage.getProfileByEmail(email);
      if (!profile) {
        profile = await storage.createProfile({
          email,
          admission_year: emailValidation.admissionYear!,
          student_id: emailValidation.studentId!
        });
      }

      // Set session
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      
      req.session.userId = profile.id;
      req.session.userEmail = profile.email;

      res.json({ 
        message: "Authentication successful",
        user: {
          id: profile.id,
          email: profile.email,
          admission_year: profile.admission_year,
          student_id: profile.student_id
        }
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (!req.session) {
      return res.status(400).json({ error: "No active session" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/profile", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({
        id: profile.id,
        email: profile.email,
        admission_year: profile.admission_year,
        student_id: profile.student_id
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error getting projects:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Validate request body
      const validation = createProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.issues[0].message 
        });
      }

      const data = validation.data;

      const project = await storage.createProject({
        ...data,
        uploaded_by: userId,
        file_url: null, // TODO: Handle file upload
        file_name: null,
        file_size: null
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/projects/my", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error getting user projects:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Cleanup expired OTPs periodically
  const cleanupInterval = setInterval(async () => {
    try {
      await storage.cleanupExpiredOtps();
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  const httpServer = createServer(app);

  // Cleanup interval on server close
  httpServer.on('close', () => {
    clearInterval(cleanupInterval);
  });

  return httpServer;
}
