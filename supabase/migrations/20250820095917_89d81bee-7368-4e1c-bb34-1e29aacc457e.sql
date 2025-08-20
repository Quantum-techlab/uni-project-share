-- Create profiles table for user authentication
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  admission_year INTEGER NOT NULL,
  student_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  year_of_submission INTEGER NOT NULL,
  description TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Authenticated users can view all projects" ON public.projects
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own projects" ON public.projects
FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own projects" ON public.projects
FOR DELETE USING (auth.uid() = uploaded_by);

-- Create OTP codes table for email verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on otp_codes (public access for verification process)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for OTP codes (allow service role access)
CREATE POLICY "Service role can manage OTP codes" ON public.otp_codes
FOR ALL USING (true);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_pattern TEXT := '^(\d{2})-52HL(\d{3})@students\.unilorin\.edu\.ng$';
  admission_year INTEGER;
  student_id TEXT;
BEGIN
  -- Extract admission year and student ID from email
  SELECT 
    CASE 
      WHEN NEW.email ~ email_pattern THEN
        2000 + (substring(NEW.email from '^(\d{2})')::INTEGER)
      ELSE NULL
    END,
    CASE 
      WHEN NEW.email ~ email_pattern THEN
        substring(NEW.email from '-52HL(\d{3})')
      ELSE NULL
    END
  INTO admission_year, student_id;

  -- Only create profile for valid university emails
  IF admission_year IS NOT NULL AND student_id IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, email, admission_year, student_id)
    VALUES (NEW.id, NEW.email, admission_year, student_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();