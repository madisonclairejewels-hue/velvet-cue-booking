-- ============================================
-- FIX 1: Protect booking PII with admin-only read
-- ============================================

-- Drop the permissive public read policy
DROP POLICY IF EXISTS "Bookings are publicly readable" ON public.bookings;

-- Create admin-only read policy for full booking details
CREATE POLICY "Admin can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create a view for public availability (no PII exposed)
CREATE OR REPLACE VIEW public.booking_availability AS
SELECT booking_date, time_slot, table_number, status
FROM public.bookings
WHERE status = 'confirmed';

-- Grant access to the view for anonymous users
GRANT SELECT ON public.booking_availability TO anon, authenticated;

-- Update booking management policies
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;

CREATE POLICY "Admin can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- FIX 2: Protect all admin-managed tables
-- ============================================

-- Settings: Admin-only UPDATE (keep public read for frontend)
DROP POLICY IF EXISTS "Anyone can update settings" ON public.settings;

CREATE POLICY "Admin can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Pricing: Admin-only management (keep public read for frontend)
DROP POLICY IF EXISTS "Anyone can insert pricing" ON public.pricing;
DROP POLICY IF EXISTS "Anyone can update pricing" ON public.pricing;
DROP POLICY IF EXISTS "Anyone can delete pricing" ON public.pricing;

CREATE POLICY "Admin can insert pricing"
ON public.pricing
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update pricing"
ON public.pricing
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete pricing"
ON public.pricing
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Gallery: Admin-only management (keep public read for frontend)
DROP POLICY IF EXISTS "Anyone can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can delete gallery" ON public.gallery;

CREATE POLICY "Admin can insert gallery"
ON public.gallery
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update gallery"
ON public.gallery
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete gallery"
ON public.gallery
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Slideshow: Admin-only management (keep public read for frontend)
DROP POLICY IF EXISTS "Anyone can insert slideshow images" ON public.slideshow;
DROP POLICY IF EXISTS "Anyone can update slideshow images" ON public.slideshow;
DROP POLICY IF EXISTS "Anyone can delete slideshow images" ON public.slideshow;

CREATE POLICY "Admin can insert slideshow"
ON public.slideshow
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update slideshow"
ON public.slideshow
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete slideshow"
ON public.slideshow
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Blocked slots: Admin-only management (keep public read for availability checking)
DROP POLICY IF EXISTS "Anyone can insert blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Anyone can update blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Anyone can delete blocked slots" ON public.blocked_slots;

CREATE POLICY "Admin can insert blocked_slots"
ON public.blocked_slots
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update blocked_slots"
ON public.blocked_slots
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete blocked_slots"
ON public.blocked_slots
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- FIX 3: Server-side input validation for bookings
-- ============================================

-- Create validation trigger function for bookings
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate user_name length (1-100 chars)
  IF LENGTH(TRIM(NEW.user_name)) < 1 OR LENGTH(NEW.user_name) > 100 THEN
    RAISE EXCEPTION 'Invalid user name: must be 1-100 characters';
  END IF;
  
  -- Validate phone_number format (basic check: 7-20 chars, numbers and common phone chars)
  IF NEW.phone_number !~ '^[+]?[0-9\s()-]{7,20}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Validate time slot is one of the allowed values
  IF NEW.time_slot NOT IN (
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', 
    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', 
    '8:00 PM', '9:00 PM', '10:00 PM'
  ) THEN
    RAISE EXCEPTION 'Invalid time slot';
  END IF;
  
  -- Validate table number (1-6)
  IF NEW.table_number < 1 OR NEW.table_number > 6 THEN
    RAISE EXCEPTION 'Invalid table number: must be 1-6';
  END IF;
  
  -- Validate booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book a date in the past';
  END IF;
  
  -- Validate booking date is not too far in future (14 days max)
  IF NEW.booking_date > CURRENT_DATE + INTERVAL '14 days' THEN
    RAISE EXCEPTION 'Cannot book more than 14 days in advance';
  END IF;
  
  -- Validate notes length if provided
  IF NEW.notes IS NOT NULL AND LENGTH(NEW.notes) > 500 THEN
    RAISE EXCEPTION 'Notes too long: maximum 500 characters';
  END IF;
  
  -- Trim whitespace from text fields
  NEW.user_name := TRIM(NEW.user_name);
  NEW.phone_number := TRIM(NEW.phone_number);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking();