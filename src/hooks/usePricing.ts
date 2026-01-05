import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Pricing {
  id: string;
  title: string;
  price: number;
  description: string | null;
  duration: string | null;
  features: string[] | null;
  is_popular: boolean | null;
  active: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Pricing[];
    },
  });
}

export function useAllPricing() {
  return useQuery({
    queryKey: ["pricing", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Pricing[];
    },
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pricing> & { id: string }) => {
      const { data, error } = await supabase
        .from("pricing")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
}

export function useCreatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricing: Omit<Pricing, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("pricing")
        .insert(pricing)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
}

export function useDeletePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
}
