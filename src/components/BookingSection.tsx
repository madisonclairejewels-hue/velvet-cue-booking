import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Hash, User, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useBookings, useBlockedSlots, useCreateBooking, TIME_SLOTS, TABLES } from "@/hooks/useBookings";
import { format, addDays, isBefore, startOfDay } from "date-fns";

export function BookingSection() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: bookings } = useBookings(selectedDate);
  const { data: blockedSlots } = useBlockedSlots(selectedDate);
  const createBooking = useCreateBooking();

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  });

  const isSlotBooked = (timeSlot: string, tableNumber: number) => {
    return bookings?.some(
      (b) => b.time_slot === timeSlot && b.table_number === tableNumber && b.status === "confirmed"
    );
  };

  const isSlotBlocked = (timeSlot: string, tableNumber: number) => {
    return blockedSlots?.some(
      (b) =>
        (b.time_slot === null || b.time_slot === timeSlot) &&
        (b.table_number === null || b.table_number === tableNumber)
    );
  };

  const isSlotAvailable = (timeSlot: string, tableNumber: number) => {
    return !isSlotBooked(timeSlot, tableNumber) && !isSlotBlocked(timeSlot, tableNumber);
  };

  const getAvailableTablesForSlot = (timeSlot: string) => {
    return TABLES.filter((table) => isSlotAvailable(timeSlot, table));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || !selectedTable || !userName || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBooking.mutateAsync({
        user_name: userName,
        phone_number: phoneNumber,
        booking_date: selectedDate,
        time_slot: selectedTimeSlot,
        table_number: selectedTable,
        notes: null,
      });

      setShowConfirmation(true);

      // Reset form
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedTimeSlot("");
        setSelectedTable(null);
        setUserName("");
        setPhoneNumber("");
      }, 5000);
    } catch (error: any) {
      if (error.message?.includes("unique_booking")) {
        toast({
          title: "Slot Already Booked",
          description: "This time slot has just been booked. Please select another.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (showConfirmation) {
    return (
      <section id="booking" className="py-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glow bg-card border border-accent/30 p-12 rounded-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="h-10 w-10 text-accent" />
            </motion.div>
            <h2 className="font-serif text-3xl text-foreground mb-4">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your table has been reserved. We look forward to seeing you.
            </p>
            <div className="bg-muted/50 p-6 rounded-sm text-left space-y-2">
              <p className="text-foreground">
                <span className="text-muted-foreground">Date:</span>{" "}
                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Time:</span> {selectedTimeSlot}
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Table:</span> #{selectedTable}
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Name:</span> {userName}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Reserve Your Spot
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Book a Table
          </h2>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card-glow bg-card border border-border/50 p-8 md:p-12 rounded-sm"
        >
          {/* Date Selection */}
          <div className="mb-10">
            <Label className="flex items-center gap-2 text-foreground mb-4">
              <Calendar className="h-4 w-4 text-accent" />
              Select Date
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const isSelected = selectedDate === date;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTimeSlot("");
                      setSelectedTable(null);
                    }}
                    className={`flex-shrink-0 flex flex-col items-center p-4 rounded-sm border transition-all duration-300 min-w-[80px] ${
                      isSelected
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <span className="text-xs uppercase">{format(dateObj, "EEE")}</span>
                    <span className="text-2xl font-medium mt-1">{format(dateObj, "d")}</span>
                    <span className="text-xs">{format(dateObj, "MMM")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="mb-10">
            <Label className="flex items-center gap-2 text-foreground mb-4">
              <Clock className="h-4 w-4 text-accent" />
              Select Time Slot
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => {
                const availableTables = getAvailableTablesForSlot(slot);
                const isSelected = selectedTimeSlot === slot;
                const isAvailable = availableTables.length > 0;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedTimeSlot(slot);
                      setSelectedTable(null);
                    }}
                    className={`p-3 rounded-sm border text-sm transition-all duration-300 ${
                      isSelected
                        ? "border-accent bg-accent/10 text-foreground"
                        : isAvailable
                        ? "border-border/50 bg-muted/30 text-muted-foreground hover:border-accent/50"
                        : "border-border/30 bg-muted/10 text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    <span>{slot}</span>
                    <span className={`block text-xs mt-1 ${isAvailable ? "text-accent/70" : "text-snooker-red/70"}`}>
                      {availableTables.length} tables
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Selection */}
          {selectedTimeSlot && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-10"
            >
              <Label className="flex items-center gap-2 text-foreground mb-4">
                <Hash className="h-4 w-4 text-accent" />
                Select Table
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {TABLES.map((table) => {
                  const isAvailable = isSlotAvailable(selectedTimeSlot, table);
                  const isSelected = selectedTable === table;

                  return (
                    <button
                      key={table}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedTable(table)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-sm border transition-all duration-300 ${
                        isSelected
                          ? "border-accent bg-accent/20 text-foreground"
                          : isAvailable
                          ? "border-border/50 bg-muted/30 text-muted-foreground hover:border-accent/50"
                          : "border-border/30 bg-snooker-red/10 text-muted-foreground/50 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-2xl font-serif">{table}</span>
                      <span className="text-xs mt-1">{isAvailable ? "Available" : "Booked"}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Contact Details */}
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6 mb-10"
            >
              <div>
                <Label className="flex items-center gap-2 text-foreground mb-2">
                  <User className="h-4 w-4 text-accent" />
                  Your Name
                </Label>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-muted/50 border-border/50 focus:border-accent"
                  required
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-foreground mb-2">
                  <Phone className="h-4 w-4 text-accent" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-muted/50 border-border/50 focus:border-accent"
                  required
                />
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            variant="premium"
            size="xl"
            disabled={!selectedDate || !selectedTimeSlot || !selectedTable || !userName || !phoneNumber || createBooking.isPending}
            className="w-full"
          >
            {createBooking.isPending ? "Booking..." : "Confirm Booking"}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
