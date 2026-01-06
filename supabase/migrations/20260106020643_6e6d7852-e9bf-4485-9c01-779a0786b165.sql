-- Create app_role enum for role types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check admin role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Drop existing permissive policies on tournaments
DROP POLICY IF EXISTS "Anyone can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Anyone can update tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Anyone can delete tournaments" ON public.tournaments;

-- Create admin-only policies for tournaments management
CREATE POLICY "Admin can insert tournaments"
ON public.tournaments
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update tournaments"
ON public.tournaments
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete tournaments"
ON public.tournaments
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Drop existing permissive policy on tournament_registrations
DROP POLICY IF EXISTS "Tournament registrations are publicly readable" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Anyone can delete registrations" ON public.tournament_registrations;

-- Create admin-only read policy for tournament registrations (protects PII)
CREATE POLICY "Admin can view registrations"
ON public.tournament_registrations
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create admin-only delete policy for tournament registrations
CREATE POLICY "Admin can delete registrations"
ON public.tournament_registrations
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));