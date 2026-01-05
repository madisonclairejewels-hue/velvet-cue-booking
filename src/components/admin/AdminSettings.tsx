import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, MapPin, Clock, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

export function AdminSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    club_name: "",
    address: "",
    opening_hours: "",
    contact_number: "",
    whatsapp_number: "",
    google_maps_link: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        club_name: settings.club_name || "",
        address: settings.address || "",
        opening_hours: settings.opening_hours || "",
        contact_number: settings.contact_number || "",
        whatsapp_number: settings.whatsapp_number || "",
        google_maps_link: settings.google_maps_link || "",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync(form);
    toast({ title: "Settings saved successfully!" });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-muted-foreground" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your club's information and website settings.
          </p>
        </div>
        {hasChanges && (
          <Button variant="premium" onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Club Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Club Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Club Name</Label>
              <Input
                value={form.club_name}
                onChange={(e) => handleChange("club_name", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="Enter club name"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="Full address"
                rows={3}
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-accent" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Contact Number</Label>
              <Input
                value={form.contact_number}
                onChange={(e) => handleChange("contact_number", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                value={form.whatsapp_number}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="+91 9876543210"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for WhatsApp booking confirmations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hours & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Opening Hours
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Opening Hours</Label>
              <Input
                value={form.opening_hours}
                onChange={(e) => handleChange("opening_hours", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="e.g., 10:00 AM - 11:00 PM"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed on the website location section
              </p>
            </div>
          </div>
        </motion.div>

        {/* Google Maps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Google Maps Link</Label>
              <Input
                value={form.google_maps_link}
                onChange={(e) => handleChange("google_maps_link", e.target.value)}
                className="bg-muted/50 mt-1"
                placeholder="https://maps.google.com/?q=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for the "Get Directions" button
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button (mobile) */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden"
        >
          <Button
            variant="premium"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-primary/5 border border-primary/20 rounded-sm p-4"
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Note:</span> All changes made here will
          be reflected immediately on the main website after saving.
        </p>
      </motion.div>
    </div>
  );
}
