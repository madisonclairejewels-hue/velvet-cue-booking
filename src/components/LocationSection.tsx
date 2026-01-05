import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function LocationSection() {
  const { data: settings } = useSettings();

  const handleGetDirections = () => {
    if (settings?.google_maps_link) {
      window.open(settings.google_maps_link, "_blank");
    }
  };

  return (
    <section id="location" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Find Us
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Location
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-border/50"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115400.39!2d82.918!3d25.317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db76febcf4d%3A0x68131710853ff0b5!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1704412800000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(100%) contrast(1.1) opacity(0.8)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AHS Snooker Club Location"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="card-glow bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    {settings?.address || "Sigra, Varanasi, Uttar Pradesh 221010, India"}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glow bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-sm">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Opening Hours</h3>
                  <p className="text-muted-foreground">
                    {settings?.opening_hours || "10:00 AM - 11:00 PM"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">Open 7 days a week</p>
                </div>
              </div>
            </div>

            <div className="card-glow bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-sm">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Contact</h3>
                  <p className="text-muted-foreground">
                    {settings?.contact_number || "+91 9876543210"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="premium"
              size="lg"
              onClick={handleGetDirections}
              className="w-full"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
