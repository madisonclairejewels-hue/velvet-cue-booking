import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tournament {
  id: string;
  tournament_name: string;
  date: string;
  description: string | null;
  entry_fee: number | null;
  prize_pool: string | null;
  max_participants: number | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  player_name: string;
  phone_number: string;
  email: string | null;
  created_at: string;
}

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Tournament[];
    },
  });
}

export function useUpcomingTournaments() {
  return useQuery({
    queryKey: ["tournaments", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .in("status", ["upcoming", "ongoing"])
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Tournament[];
    },
  });
}

export function useTournamentRegistrations(tournamentId?: string) {
  return useQuery({
    queryKey: ["tournament-registrations", tournamentId],
    queryFn: async () => {
      let query = supabase.from("tournament_registrations").select("*");
      
      if (tournamentId) {
        query = query.eq("tournament_id", tournamentId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as TournamentRegistration[];
    },
    enabled: !!tournamentId || tournamentId === undefined,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournament: Omit<Tournament, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("tournaments")
        .insert(tournament)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tournament> & { id: string }) => {
      const { data, error } = await supabase
        .from("tournaments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useRegisterForTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: Omit<TournamentRegistration, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .insert(registration)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations"] });
    },
  });
}
