import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUpcomingTournaments, useRegisterForTournament, Tournament } from "@/hooks/useTournaments";
import { format } from "date-fns";
import { z } from "zod";

// Validation schema for tournament registration
const registrationSchema = z.object({
  player_name: z.string()
    .trim()
    .min(1, "Player name is required")
    .max(100, "Player name must be less than 100 characters"),
  phone_number: z.string()
    .trim()
    .regex(/^[+]?[0-9\s()-]{7,20}$/, "Please enter a valid phone number"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export function TournamentsSection() {
  const { toast } = useToast();
  const { data: tournaments, isLoading } = useUpcomingTournaments();
  const registerMutation = useRegisterForTournament();

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!selectedTournament) return;

    // Client-side validation
    const validation = registrationSchema.safeParse({
      player_name: playerName,
      phone_number: phoneNumber,
      email: email || undefined,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setValidationErrors(errors);

      toast({
        title: "Validation Error",
        description: Object.values(errors)[0],
        variant: "destructive",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        tournament_id: selectedTournament.id,
        player_name: playerName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim() || null,
      });

      toast({
        title: "Registration Successful!",
        description: `You have been registered for ${selectedTournament.tournament_name}.`,
      });

      setSelectedTournament(null);
      setPlayerName("");
      setPhoneNumber("");
      setEmail("");
      setValidationErrors({});
    } catch (error: any) {
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("Invalid")) {
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    setSelectedTournament(null);
    setPlayerName("");
    setPhoneNumber("");
    setEmail("");
    setValidationErrors({});
  };

  if (isLoading) {
    return (
      <section id="tournaments" className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse">Loading tournaments...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tournaments" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Compete
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Upcoming Tournaments
          </h2>
        </motion.div>

        {!tournaments || tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No upcoming tournaments at the moment.</p>
            <p className="text-muted-foreground/70 text-sm mt-2">Check back soon for new events!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {tournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-glow bg-card border border-border/50 rounded-sm overflow-hidden group"
                >
                  {/* Status badge */}
                  <div className="relative p-6 pb-0">
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 text-xs uppercase tracking-wider rounded-sm ${
                        tournament.status === "ongoing"
                          ? "bg-snooker-red/20 text-snooker-red"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-foreground mb-4">
                      {tournament.tournament_name}
                    </h3>

                    {tournament.description && (
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                        {tournament.description}
                      </p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span className="text-sm">
                          {format(new Date(tournament.date), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>

                      {tournament.entry_fee !== null && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span className="text-sm">
                            Entry Fee: ₹{tournament.entry_fee}
                          </span>
                        </div>
                      )}

                      {tournament.prize_pool && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Trophy className="h-4 w-4 text-accent" />
                          <span className="text-sm">
                            Prize Pool: {tournament.prize_pool}
                          </span>
                        </div>
                      )}

                      {tournament.max_participants && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="text-sm">
                            Max {tournament.max_participants} players
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="premium"
                      className="w-full"
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      Register Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Registration Modal */}
        <Dialog open={!!selectedTournament} onOpenChange={handleClose}>
          <DialogContent className="bg-card border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-foreground">
                Register for Tournament
              </DialogTitle>
            </DialogHeader>

            {selectedTournament && (
              <div className="mt-4">
                <div className="bg-muted/50 p-4 rounded-sm mb-6">
                  <h4 className="font-serif text-lg text-foreground mb-2">
                    {selectedTournament.tournament_name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(selectedTournament.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  {selectedTournament.entry_fee !== null && (
                    <p className="text-accent text-sm mt-1">
                      Entry Fee: ₹{selectedTournament.entry_fee}
                    </p>
                  )}
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label className="text-foreground">Player Name *</Label>
                    <Input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 100))}
                      placeholder="Enter your full name"
                      className={`bg-muted/50 border-border/50 mt-2 ${validationErrors.player_name ? 'border-destructive' : ''}`}
                      required
                      maxLength={100}
                    />
                    {validationErrors.player_name && (
                      <p className="text-destructive text-xs mt-1">{validationErrors.player_name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-foreground">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.slice(0, 20))}
                      placeholder="+91 XXXXX XXXXX"
                      className={`bg-muted/50 border-border/50 mt-2 ${validationErrors.phone_number ? 'border-destructive' : ''}`}
                      required
                      maxLength={20}
                    />
                    {validationErrors.phone_number && (
                      <p className="text-destructive text-xs mt-1">{validationErrors.phone_number}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-foreground">Email (Optional)</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`bg-muted/50 border-border/50 mt-2 ${validationErrors.email ? 'border-destructive' : ''}`}
                    />
                    {validationErrors.email && (
                      <p className="text-destructive text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="premium"
                    size="lg"
                    className="w-full mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                  </Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
