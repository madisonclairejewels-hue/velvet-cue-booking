import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Trophy, DollarSign, Image, MapPin, Users, ArrowLeft, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAllBookings, useUpdateBooking, useDeleteBooking } from "@/hooks/useBookings";
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament, useTournamentRegistrations } from "@/hooks/useTournaments";
import { useAllPricing, useUpdatePricing, useCreatePricing, useDeletePricing } from "@/hooks/usePricing";
import { useGallery, useCreateGalleryImage, useDeleteGalleryImage } from "@/hooks/useGallery";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

type Tab = "bookings" | "tournaments" | "pricing" | "gallery" | "settings";

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  // Data hooks
  const { data: bookings, isLoading: bookingsLoading } = useAllBookings();
  const { data: tournaments } = useTournaments();
  const { data: pricing } = useAllPricing();
  const { data: gallery } = useGallery();
  const { data: settings } = useSettings();

  // Mutation hooks
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const updatePricing = useUpdatePricing();
  const createPricing = useCreatePricing();
  const deletePricingMutation = useDeletePricing();
  const createGalleryImage = useCreateGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();
  const updateSettings = useUpdateSettings();

  // Tournament form state
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({
    tournament_name: "",
    date: "",
    description: "",
    entry_fee: 0,
    prize_pool: "",
    max_participants: 32,
    status: "upcoming" as const,
  });

  // Gallery form state
  const [newImageUrl, setNewImageUrl] = useState("");

  const tabs = [
    { id: "bookings" as Tab, label: "Bookings", icon: Calendar },
    { id: "tournaments" as Tab, label: "Tournaments", icon: Trophy },
    { id: "pricing" as Tab, label: "Pricing", icon: DollarSign },
    { id: "gallery" as Tab, label: "Gallery", icon: Image },
    { id: "settings" as Tab, label: "Settings", icon: MapPin },
  ];

  const handleCreateTournament = async () => {
    if (!tournamentForm.tournament_name || !tournamentForm.date) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    await createTournament.mutateAsync(tournamentForm);
    toast({ title: "Tournament created!" });
    setShowTournamentForm(false);
    setTournamentForm({ tournament_name: "", date: "", description: "", entry_fee: 0, prize_pool: "", max_participants: 32, status: "upcoming" });
  };

  const handleAddGalleryImage = async () => {
    if (!newImageUrl) return;
    await createGalleryImage.mutateAsync({ image_url: newImageUrl, caption: null, order_index: 0 });
    toast({ title: "Image added!" });
    setNewImageUrl("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-serif text-xl text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "premium" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-foreground mb-6">All Bookings</h2>
            {bookingsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !bookings?.length ? (
              <p className="text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-card border border-border/50 p-4 rounded-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-foreground font-medium">{booking.user_name}</p>
                      <p className="text-muted-foreground text-sm">{booking.phone_number}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{format(new Date(booking.booking_date), "MMM d, yyyy")}</p>
                      <p>{booking.time_slot} • Table #{booking.table_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${booking.status === "confirmed" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {booking.status}
                      </span>
                      {booking.status === "confirmed" && (
                        <Button size="sm" variant="ghost" onClick={() => updateBooking.mutate({ id: booking.id, status: "cancelled" })}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl text-foreground">Tournaments</h2>
              <Button variant="premium" onClick={() => setShowTournamentForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Tournament
              </Button>
            </div>

            {showTournamentForm && (
              <div className="bg-card border border-border/50 p-6 rounded-sm space-y-4">
                <Input placeholder="Tournament Name *" value={tournamentForm.tournament_name} onChange={(e) => setTournamentForm({ ...tournamentForm, tournament_name: e.target.value })} className="bg-muted/50" />
                <Input type="date" value={tournamentForm.date} onChange={(e) => setTournamentForm({ ...tournamentForm, date: e.target.value })} className="bg-muted/50" />
                <Textarea placeholder="Description" value={tournamentForm.description} onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })} className="bg-muted/50" />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Entry Fee" value={tournamentForm.entry_fee} onChange={(e) => setTournamentForm({ ...tournamentForm, entry_fee: Number(e.target.value) })} className="bg-muted/50" />
                  <Input placeholder="Prize Pool" value={tournamentForm.prize_pool} onChange={(e) => setTournamentForm({ ...tournamentForm, prize_pool: e.target.value })} className="bg-muted/50" />
                </div>
                <div className="flex gap-2">
                  <Button variant="premium" onClick={handleCreateTournament}>Create</Button>
                  <Button variant="ghost" onClick={() => setShowTournamentForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tournaments?.map((t) => (
                <div key={t.id} className="bg-card border border-border/50 p-4 rounded-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-foreground font-medium">{t.tournament_name}</p>
                    <p className="text-muted-foreground text-sm">{format(new Date(t.date), "MMM d, yyyy")} • ₹{t.entry_fee}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={t.status}
                      onChange={(e) => updateTournament.mutate({ id: t.id, status: e.target.value as any })}
                      className="bg-muted border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => deleteTournament.mutate(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-foreground">Pricing Plans</h2>
            <div className="space-y-3">
              {pricing?.map((p) => (
                <div key={p.id} className="bg-card border border-border/50 p-4 rounded-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-foreground font-medium">{p.title}</p>
                    <p className="text-accent">₹{p.price} / {p.duration}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch checked={p.active ?? true} onCheckedChange={(checked) => updatePricing.mutate({ id: p.id, active: checked })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Popular</span>
                      <Switch checked={p.is_popular ?? false} onCheckedChange={(checked) => updatePricing.mutate({ id: p.id, is_popular: checked })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-foreground">Gallery</h2>
            <div className="flex gap-2">
              <Input placeholder="Image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="bg-muted/50" />
              <Button variant="premium" onClick={handleAddGalleryImage}>Add</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery?.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-sm" />
                  <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteGalleryImage.mutate(img.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && settings && (
          <div className="space-y-6 max-w-xl">
            <h2 className="font-serif text-2xl text-foreground">Club Settings</h2>
            <div className="space-y-4">
              <div>
                <Label>Club Name</Label>
                <Input defaultValue={settings.club_name} onBlur={(e) => updateSettings.mutate({ club_name: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea defaultValue={settings.address} onBlur={(e) => updateSettings.mutate({ address: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input defaultValue={settings.opening_hours} onBlur={(e) => updateSettings.mutate({ opening_hours: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input defaultValue={settings.contact_number || ""} onBlur={(e) => updateSettings.mutate({ contact_number: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input defaultValue={settings.whatsapp_number || ""} onBlur={(e) => updateSettings.mutate({ whatsapp_number: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
              <div>
                <Label>Google Maps Link</Label>
                <Input defaultValue={settings.google_maps_link || ""} onBlur={(e) => updateSettings.mutate({ google_maps_link: e.target.value })} className="bg-muted/50 mt-2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
