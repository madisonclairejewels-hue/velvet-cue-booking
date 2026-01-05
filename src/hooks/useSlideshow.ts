import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  image_url: string;
  tagline: string | null;
  order_index: number | null;
  active: boolean | null;
  created_at: string;
}

export function useSlideshow() {
  return useQuery({
    queryKey: ["slideshow-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Slide[];
    },
  });
}
