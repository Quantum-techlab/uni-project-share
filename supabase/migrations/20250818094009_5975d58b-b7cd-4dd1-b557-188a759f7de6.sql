-- Create profiles table for student information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  admission_year INTEGER NOT NULL,
  student_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  year_of_submission INTEGER NOT NULL,
  description TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for projects
CREATE POLICY "Authenticated users can view all projects" 
ON public.projects 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = uploaded_by);

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', false);

-- Create storage policies
CREATE POLICY "Authenticated users can view project files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'projects');

CREATE POLICY "Users can upload project files" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_title ON public.projects(title);
CREATE INDEX idx_projects_supervisor ON public.projects(supervisor_name);
CREATE INDEX idx_projects_year ON public.projects(year_of_submission);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);