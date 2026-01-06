import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  user_name: string;
  phone_number: string;
  booking_date: string;
  time_slot: string;
  table_number: number;
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingAvailability {
  booking_date: string;
  time_slot: string;
  table_number: number;
  status: string;
}

export interface BlockedSlot {
  id: string;
  blocked_date: string;
  time_slot: string | null;
  table_number: number | null;
  reason: string | null;
  created_at: string;
}

export const TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
];

export const TABLES = [1, 2, 3, 4, 5, 6];

// Public hook: Uses the view that only exposes availability (no PII)
export function useBookingAvailability(date?: string) {
  return useQuery({
    queryKey: ["booking-availability", date],
    queryFn: async () => {
      let query = supabase.from("booking_availability").select("*");
      
      if (date) {
        query = query.eq("booking_date", date);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data as BookingAvailability[];
    },
  });
}

// Admin hook: Full booking details (requires admin auth)
export function useBookings(date?: string) {
  return useQuery({
    queryKey: ["bookings", date],
    queryFn: async () => {
      let query = supabase.from("bookings").select("*");
      
      if (date) {
        query = query.eq("booking_date", date);
      }
      
      const { data, error } = await query.order("booking_date", { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
  });
}

// Admin hook: All bookings (requires admin auth)
export function useAllBookings() {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useBlockedSlots(date?: string) {
  return useQuery({
    queryKey: ["blocked-slots", date],
    queryFn: async () => {
      let query = supabase.from("blocked_slots").select("*");
      
      if (date) {
        query = query.eq("blocked_date", date);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data as BlockedSlot[];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Omit<Booking, "id" | "created_at" | "updated_at" | "status">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...booking, status: "confirmed" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-availability"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-availability"] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-availability"] });
    },
  });
}

export function useCreateBlockedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: Omit<BlockedSlot, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("blocked_slots")
        .insert(slot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-slots"] });
    },
  });
}

export function useDeleteBlockedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-slots"] });
    },
  });
}
