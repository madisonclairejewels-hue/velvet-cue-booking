-- Drop the existing policy completely
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a truly permissive policy for anonymous and authenticated users
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);