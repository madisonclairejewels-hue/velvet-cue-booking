-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a permissive policy for public booking creation
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);