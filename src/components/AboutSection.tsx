import { motion } from "framer-motion";
import clubInterior from "@/assets/club-interior.jpg";

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={clubInterior}
          alt="Club interior"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Established Excellence
          </span>
          
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-8">
            About the Club
          </h2>

          <div className="section-divider w-32 mx-auto mb-12" />

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            AHS Snooker Club is Varanasi's premier destination for serious snooker players. 
            Our club offers a refined environment where precision meets passion, 
            featuring professional-grade tables and an atmosphere designed for focus and excellence.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Professional Tables",
                description: "Tournament-standard tables with premium cloth and precise cushions",
              },
              {
                title: "Serious Environment",
                description: "A calm, focused atmosphere where players can perfect their craft",
              },
              {
                title: "Expert Community",
                description: "Join a community of dedicated players and enthusiasts",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="card-glow bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-sm"
              >
                <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
