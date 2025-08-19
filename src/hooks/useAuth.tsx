import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // Create profile if it doesn't exist
          setTimeout(() => {
            createProfile(session?.user);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createProfile = async (user: User | undefined) => {
    if (!user?.email) return;

    const emailValidation = validateUniversityEmail(user.email);
    if (!emailValidation.valid) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          admission_year: emailValidation.admissionYear!,
          student_id: emailValidation.studentId!,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
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

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    return { error };
  };

  return {
    user,
    session,
    loading,
    signInWithOTP,
    verifyOTP,
    signOut,
    validateUniversityEmail
  };
};