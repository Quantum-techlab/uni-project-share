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
  // For development, we'll return the OTP code to display in the UI
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email format
      const validation = validateUniversityEmail(email);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
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

      // Send email (mock implementation)
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
      const { email, token } = req.body;
      const code = token; // Handle both parameter names
      
      // Validate email format
      const validation = validateUniversityEmail(email);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Verify OTP
      const otpRecord = await storage.verifyOtpCode(email, code);
      if (!otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP code" });
      }

      // Check if profile exists, create if not
      let profile = await storage.getProfileByEmail(email);
      if (!profile) {
        profile = await storage.createProfile({
          email,
          admission_year: validation.admissionYear!,
          student_id: validation.studentId!
        });
      }

      // Set session (simple implementation)
      req.session = req.session || {};
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
    req.session?.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: "Failed to logout" });
      }
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

      const { title, supervisor_name, year_of_submission, description, abstract, keywords } = req.body;
      
      // Basic validation
      if (!title || !supervisor_name || !year_of_submission || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const project = await storage.createProject({
        title,
        supervisor_name,
        year_of_submission,
        description,
        abstract,
        keywords,
        uploaded_by: userId,
        file_url: null, // TODO: Handle file upload
        file_name: null,
        file_size: null
      });

      res.json(project);
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

  // Cleanup expired OTPs periodically
  setInterval(async () => {
    try {
      await storage.cleanupExpiredOtps();
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  const httpServer = createServer(app);
  return httpServer;
}
