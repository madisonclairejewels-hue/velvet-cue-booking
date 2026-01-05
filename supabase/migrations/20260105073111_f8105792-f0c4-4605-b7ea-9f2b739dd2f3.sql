-- Create slideshow table for hero images
CREATE TABLE public.slideshow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  tagline TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slideshow ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active slides
CREATE POLICY "Anyone can view active slideshow images"
ON public.slideshow
FOR SELECT
USING (active = true);

-- Allow anyone to manage slideshow (for admin demo)
CREATE POLICY "Anyone can insert slideshow images"
ON public.slideshow
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update slideshow images"
ON public.slideshow
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete slideshow images"
ON public.slideshow
FOR DELETE
USING (true);