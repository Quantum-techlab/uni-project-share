import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  admission_year: number;
  student_id: string;
}

export const useServerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const validateUniversityEmail = (email: string) => {
    // Pattern: YY-52HL001@students.unilorin.edu.ng
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

    // Validate year range (adjust as needed)
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
  };

  const signInWithOTP = async (email: string) => {
    const validation = validateUniversityEmail(email);
    if (!validation.valid) {
      toast({
        title: "Invalid Email Format",
        description: validation.error,
        variant: "destructive",
      });
      return { error: { message: validation.error } };
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: data.error || "Please wait before requesting a new OTP",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to send OTP",
            variant: "destructive",
          });
        }
        return { error: { message: data.error || "Failed to send OTP" } };
      }

      // Show development OTP in a toast if available
      if (data.developmentOtp) {
        toast({
          title: "Development OTP",
          description: `Your OTP code is: ${data.developmentOtp}`,
          duration: 10000, // 10 seconds
        });
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: { message: errorMessage } };
    }
  };

  const verifyOTP = async (email: string, code: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: code }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to verify OTP",
          variant: "destructive",
        });
        return { error: { message: data.error || "Failed to verify OTP" } };
      }

      setUser(data.user);
      
      toast({
        title: "Success",
        description: "Login successful! Welcome to ITSA Project Vault.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { 
        error: error instanceof Error ? error : new Error('Failed to verify OTP') 
      };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      } else {
        throw new Error('Logout failed');
      }
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: { message: errorMessage } };
    }
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signInWithOTP,
    verifyOTP,
    signOut,
    validateUniversityEmail
  };
};