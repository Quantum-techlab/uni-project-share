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

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a verification code to login.",
      });
    }

    return { error };
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
    signOut,
    validateUniversityEmail
  };
};