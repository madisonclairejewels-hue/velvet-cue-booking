import { motion } from "framer-motion";
import { Layers, Wind, Sofa, Coffee, Volume2, Wifi } from "lucide-react";

const amenities = [
  {
    icon: Layers,
    title: "Professional Tables",
    description: "Tournament-standard snooker tables with premium cloth",
  },
  {
    icon: Wind,
    title: "Air Conditioned",
    description: "Climate-controlled environment for optimal play",
  },
  {
    icon: Sofa,
    title: "Comfortable Seating",
    description: "Premium seating for players and spectators",
  },
  {
    icon: Coffee,
    title: "Refreshments",
    description: "Complimentary tea, coffee, and snacks",
  },
  {
    icon: Volume2,
    title: "Quiet Environment",
    description: "Calm, distraction-free atmosphere",
  },
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    description: "High-speed internet connectivity",
  },
];

export function AmenitiesSection() {
  return (
    <section id="amenities" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Experience
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Club Amenities
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-card/50 border border-border/30 rounded-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-accent/10 rounded-sm flex-shrink-0">
                <amenity.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-1">{amenity.title}</h3>
                <p className="text-muted-foreground text-sm">{amenity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
