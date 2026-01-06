-- Fix the security definer view by using SECURITY INVOKER
DROP VIEW IF EXISTS public.booking_availability;

CREATE VIEW public.booking_availability 
WITH (security_invoker = true)
AS
SELECT booking_date, time_slot, table_number, status
FROM public.bookings
WHERE status = 'confirmed';

-- Re-grant access
GRANT SELECT ON public.booking_availability TO anon, authenticated;

-- Fix the validate_booking function search_path
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
$$;