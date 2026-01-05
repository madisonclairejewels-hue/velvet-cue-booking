import { useState } from "react";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar, Phone, User, Clock, Hash, Filter, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAllBookings, useUpdateBooking, useDeleteBooking } from "@/hooks/useBookings";

type FilterType = "all" | "today" | "upcoming" | "confirmed" | "cancelled";

export function AdminBookings() {
  const { toast } = useToast();
  const { data: bookings, isLoading } = useAllBookings();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterBookings = () => {
    if (!bookings) return [];

    let filtered = [...bookings];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.user_name.toLowerCase().includes(query) ||
          b.phone_number.includes(query)
      );
    }

    // Apply status/date filter
    switch (filter) {
      case "today":
        filtered = filtered.filter((b) => isToday(parseISO(b.booking_date)));
        break;
      case "upcoming":
        filtered = filtered.filter((b) => new Date(b.booking_date) >= new Date());
        break;
      case "confirmed":
        filtered = filtered.filter((b) => b.status === "confirmed");
        break;
      case "cancelled":
        filtered = filtered.filter((b) => b.status === "cancelled");
        break;
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
    );
  };

  const handleConfirm = async (id: string) => {
    await updateBooking.mutateAsync({ id, status: "confirmed" });
    toast({ title: "Booking confirmed!" });
  };

  const handleCancel = async (id: string) => {
    await updateBooking.mutateAsync({ id, status: "cancelled" });
    toast({ title: "Booking cancelled!" });
  };

  const handleComplete = async (id: string) => {
    await updateBooking.mutateAsync({ id, status: "completed" });
    toast({ title: "Booking marked as completed!" });
  };

  const filteredBookings = filterBookings();

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "confirmed", label: "Confirmed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Bookings Management
        </h1>
        <p className="text-muted-foreground">View and manage all table bookings.</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-sm p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? "premium" : "ghost"}
                size="sm"
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{bookings?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total Bookings</p>
        </div>
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {bookings?.filter((b) => isToday(parseISO(b.booking_date))).length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-accent">
            {bookings?.filter((b) => b.status === "confirmed").length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </div>
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {bookings?.filter((b) => b.status === "cancelled").length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Cancelled</p>
        </div>
      </div>

      {/* Bookings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <h2 className="text-lg font-medium text-foreground mb-4">
          {filter === "all" ? "All Bookings" : `${filters.find((f) => f.id === filter)?.label} Bookings`}{" "}
          ({filteredBookings.length})
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !filteredBookings.length ? (
          <p className="text-muted-foreground py-8 text-center">No bookings found.</p>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`bg-muted/30 border rounded-sm p-4 ${
                  booking.status === "cancelled"
                    ? "border-destructive/30 opacity-60"
                    : booking.status === "completed"
                    ? "border-primary/30"
                    : "border-border/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{booking.user_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{booking.phone_number}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm ${
                          isToday(parseISO(booking.booking_date))
                            ? "text-primary font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {getDateLabel(booking.booking_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 justify-end text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.time_slot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Table {booking.table_number}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded ${
                        booking.status === "confirmed"
                          ? "bg-primary/20 text-primary"
                          : booking.status === "completed"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleComplete(booking.id)}
                          title="Mark as completed"
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel(booking.id)}
                          title="Cancel booking"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}

                    {booking.status === "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleConfirm(booking.id)}
                        title="Reconfirm booking"
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
