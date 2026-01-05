import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trophy, Plus, Trash2, Edit, Users, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useTournaments,
  useCreateTournament,
  useUpdateTournament,
  useDeleteTournament,
  useTournamentRegistrations,
} from "@/hooks/useTournaments";

export function AdminTournaments() {
  const { toast } = useToast();
  const { data: tournaments, isLoading } = useTournaments();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);

  const [form, setForm] = useState({
    tournament_name: "",
    date: "",
    description: "",
    entry_fee: 0,
    prize_pool: "",
    max_participants: 32,
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
  });

  const resetForm = () => {
    setForm({
      tournament_name: "",
      date: "",
      description: "",
      entry_fee: 0,
      prize_pool: "",
      max_participants: 32,
      status: "upcoming",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.tournament_name || !form.date) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (editingId) {
      await updateTournament.mutateAsync({ id: editingId, ...form });
      toast({ title: "Tournament updated!" });
    } else {
      await createTournament.mutateAsync(form);
      toast({ title: "Tournament created!" });
    }

    resetForm();
  };

  const handleEdit = (tournament: any) => {
    setForm({
      tournament_name: tournament.tournament_name,
      date: tournament.date,
      description: tournament.description || "",
      entry_fee: tournament.entry_fee || 0,
      prize_pool: tournament.prize_pool || "",
      max_participants: tournament.max_participants || 32,
      status: tournament.status,
    });
    setEditingId(tournament.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTournament.mutateAsync(id);
    toast({ title: "Tournament deleted!" });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTournament.mutateAsync({ id, status: status as any });
    toast({ title: "Status updated!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            Tournament Management
          </h1>
          <p className="text-muted-foreground">Create and manage tournaments.</p>
        </div>
        {!showForm && (
          <Button variant="premium" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tournament
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4">
            {editingId ? "Edit Tournament" : "Create New Tournament"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tournament Name *</Label>
                <Input
                  value={form.tournament_name}
                  onChange={(e) => setForm({ ...form, tournament_name: e.target.value })}
                  className="bg-muted/50 mt-1"
                  placeholder="Enter tournament name"
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-muted/50 mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-muted/50 mt-1"
                placeholder="Tournament description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Entry Fee (₹)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.entry_fee || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+/, "").replace(/\D/g, "");
                    setForm({ ...form, entry_fee: value ? parseInt(value, 10) : 0 });
                  }}
                  className="bg-muted/50 mt-1"
                />
              </div>
              <div>
                <Label>Prize Pool</Label>
                <Input
                  value={form.prize_pool}
                  onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
                  className="bg-muted/50 mt-1"
                  placeholder="e.g., ₹10,000"
                />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })}
                  className="bg-muted/50 mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-muted/50 border border-border rounded-sm px-3 py-2 mt-1"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="premium" onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Save Changes" : "Create Tournament"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tournaments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <h2 className="text-lg font-medium text-foreground mb-4">
          All Tournaments ({tournaments?.length || 0})
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !tournaments?.length ? (
          <p className="text-muted-foreground py-8 text-center">No tournaments yet.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onEdit={() => handleEdit(tournament)}
                onDelete={() => handleDelete(tournament.id)}
                onStatusChange={handleStatusChange}
                onViewRegistrations={() => setViewingRegistrations(tournament.id)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Registrations Modal */}
      {viewingRegistrations && (
        <RegistrationsModal
          tournamentId={viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}
    </div>
  );
}

function TournamentCard({
  tournament,
  onEdit,
  onDelete,
  onStatusChange,
  onViewRegistrations,
}: {
  tournament: any;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, status: string) => void;
  onViewRegistrations: () => void;
}) {
  return (
    <div className="bg-muted/30 border border-border/30 p-4 rounded-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-foreground font-medium">{tournament.tournament_name}</h3>
          <p className="text-muted-foreground text-sm">
            {format(new Date(tournament.date), "MMMM d, yyyy")}
          </p>
          {tournament.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {tournament.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-accent">₹{tournament.entry_fee} Entry</span>
            {tournament.prize_pool && (
              <span className="text-foreground">Prize: {tournament.prize_pool}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tournament.status}
            onChange={(e) => onStatusChange(tournament.id, e.target.value)}
            className={`bg-muted border border-border rounded-sm px-3 py-1.5 text-sm ${
              tournament.status === "upcoming"
                ? "text-blue-500"
                : tournament.status === "ongoing"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <Button size="sm" variant="ghost" onClick={onViewRegistrations}>
            <Users className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RegistrationsModal({
  tournamentId,
  onClose,
}: {
  tournamentId: string;
  onClose: () => void;
}) {
  const { data: registrations, isLoading } = useTournamentRegistrations(tournamentId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border/50 rounded-sm p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-foreground">Registrations</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !registrations?.length ? (
          <p className="text-muted-foreground py-4">No registrations yet.</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg, index) => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-sm"
              >
                <div>
                  <p className="text-foreground font-medium">{reg.player_name}</p>
                  <p className="text-muted-foreground text-sm">{reg.phone_number}</p>
                  {reg.email && (
                    <p className="text-muted-foreground text-xs">{reg.email}</p>
                  )}
                </div>
                <span className="text-muted-foreground text-sm">#{index + 1}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
