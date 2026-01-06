-- ============================================
-- FIX 1: Secure gallery storage bucket policies
-- ============================================

-- Drop the permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON storage.objects;

-- Create admin-only policies for gallery storage
CREATE POLICY "Admin can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

-- ============================================
-- FIX 2: Server-side validation for tournament registrations
-- ============================================

-- Create validation trigger function for tournament registrations
CREATE OR REPLACE FUNCTION public.validate_tournament_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Validate player_name (1-100 chars)
  IF LENGTH(TRIM(NEW.player_name)) < 1 OR LENGTH(NEW.player_name) > 100 THEN
    RAISE EXCEPTION 'Invalid player name: must be 1-100 characters';
  END IF;
  
  -- Validate phone_number format (7-20 chars, numbers and common phone chars)
  IF NEW.phone_number !~ '^[+]?[0-9\s()-]{7,20}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND LENGTH(TRIM(NEW.email)) > 0 AND 
     NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Trim whitespace from text fields
  NEW.player_name := TRIM(NEW.player_name);
  NEW.phone_number := TRIM(NEW.phone_number);
  IF NEW.email IS NOT NULL THEN
    NEW.email := TRIM(LOWER(NEW.email));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tournament registration validation
DROP TRIGGER IF EXISTS validate_tournament_registration_trigger ON public.tournament_registrations;
CREATE TRIGGER validate_tournament_registration_trigger
  BEFORE INSERT ON public.tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tournament_registration();