
-- Function to handle new user registration
-- This should be run to create/replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, callsign, first_name, last_name)
  VALUES (new.id, new.email, 
          coalesce(new.raw_user_meta_data->>'callsign', ''),
          coalesce(new.raw_user_meta_data->>'first_name', ''),
          coalesce(new.raw_user_meta_data->>'last_name', ''));
  RETURN new;
END;
$$;

-- Create trigger to run the function after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND is_staff = true
  );
END;
$$;

-- Drop existing policies that might cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Staff can view all users" ON public.users;

-- Create RLS policies that don't cause infinite recursion
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Staff can view all users"
ON public.users
FOR SELECT
USING (public.is_admin(auth.uid()));
