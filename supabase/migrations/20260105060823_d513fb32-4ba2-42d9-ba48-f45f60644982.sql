-- Settings table for club configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_name TEXT NOT NULL DEFAULT 'AHS Snooker Club',
  address TEXT NOT NULL DEFAULT 'Varanasi, Uttar Pradesh, India',
  google_maps_link TEXT DEFAULT 'https://maps.google.com/?q=Varanasi',
  opening_hours TEXT NOT NULL DEFAULT '10:00 AM - 11:00 PM',
  contact_number TEXT DEFAULT '+91 9876543210',
  whatsapp_number TEXT DEFAULT '+91 9876543210',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pricing table
CREATE TABLE public.pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  duration TEXT,
  features TEXT[],
  is_popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool TEXT,
  max_participants INTEGER DEFAULT 32,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournament registrations table
CREATE TABLE public.tournament_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  table_number INTEGER NOT NULL CHECK (table_number >= 1 AND table_number <= 6),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blocked slots table for admin to block specific times
CREATE TABLE public.blocked_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  time_slot TEXT,
  table_number INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- Public read policies for frontend display
CREATE POLICY "Settings are publicly readable" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Pricing is publicly readable" ON public.pricing FOR SELECT USING (true);
CREATE POLICY "Gallery is publicly readable" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Tournaments are publicly readable" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Bookings are publicly readable" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Blocked slots are publicly readable" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "Tournament registrations are publicly readable" ON public.tournament_registrations FOR SELECT USING (true);

-- Public insert policies for user actions
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can register for tournaments" ON public.tournament_registrations FOR INSERT WITH CHECK (true);

-- Admin policies (no auth, so allowing all for now)
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can update pricing" ON public.pricing FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert pricing" ON public.pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete pricing" ON public.pricing FOR DELETE USING (true);
CREATE POLICY "Anyone can insert gallery" ON public.gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gallery" ON public.gallery FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gallery" ON public.gallery FOR DELETE USING (true);
CREATE POLICY "Anyone can insert tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tournaments" ON public.tournaments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tournaments" ON public.tournaments FOR DELETE USING (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bookings" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Anyone can insert blocked slots" ON public.blocked_slots FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blocked slots" ON public.blocked_slots FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete blocked slots" ON public.blocked_slots FOR DELETE USING (true);
CREATE POLICY "Anyone can delete registrations" ON public.tournament_registrations FOR DELETE USING (true);

-- Insert default settings
INSERT INTO public.settings (club_name, address, google_maps_link, opening_hours, contact_number, whatsapp_number)
VALUES ('AHS Snooker Club', 'Sigra, Varanasi, Uttar Pradesh 221010, India', 'https://maps.google.com/?q=Varanasi+Sigra', '10:00 AM - 11:00 PM', '+91 9876543210', '+91 9876543210');

-- Insert default pricing
INSERT INTO public.pricing (title, price, description, duration, features, is_popular, sort_order)
VALUES 
  ('Hourly Play', 150, 'Perfect for casual players', 'per hour', ARRAY['Professional table access', 'Cue & chalk provided', 'Air-conditioned hall'], false, 1),
  ('Monthly Pass', 2500, 'Unlimited access for serious players', 'per month', ARRAY['Unlimited table time', 'Priority booking', 'Free refreshments', 'Guest passes (2/month)'], true, 2),
  ('Tournament Entry', 500, 'Compete with the best', 'per event', ARRAY['Official tournament entry', 'Prize pool eligibility', 'Certificate of participation'], false, 3);

-- Create unique constraint to prevent double booking
CREATE UNIQUE INDEX unique_booking ON public.bookings (booking_date, time_slot, table_number) WHERE status = 'confirmed';

-- Enable realtime for bookings and tournaments
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;