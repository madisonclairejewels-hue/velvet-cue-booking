-- Allow authenticated users to insert their own admin role ONLY if no admin exists yet
-- This is for first-time setup only

-- Create a function to check if any admin exists
CREATE OR REPLACE FUNCTION public.no_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'admin'
  )
$$;

-- Create policy allowing first admin creation
CREATE POLICY "Allow first admin creation"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin' 
  AND public.no_admin_exists()
);