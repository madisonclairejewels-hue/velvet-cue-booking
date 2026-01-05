import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const heroImages = [hero1, hero2, hero3];

const taglines = [
  "Precision. Focus. Class.",
  "Where Legends Are Made.",
  "The Art of the Perfect Shot.",
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTournaments = () => {
    document.getElementById("tournaments")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Background slideshow */}
      {heroImages.map((img, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: currentSlide === index ? 1 : 0,
            scale: currentSlide === index ? 1.05 : 1,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <img
            src={img}
            alt={`Snooker table ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </motion.div>
      ))}

      {/* Gradient overlay */}
      <div className="hero-gradient absolute inset-0 z-10" />

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-6"
        >
          <span className="text-gold-gradient font-serif text-lg tracking-[0.3em] uppercase">
            Varanasi
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground mb-6"
        >
          AHS Snooker Club
        </motion.h1>

        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <p className="font-serif text-xl md:text-2xl text-foreground/80 italic">
            {taglines[currentSlide]}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="premium"
            size="xl"
            onClick={scrollToBooking}
            className="min-w-[180px]"
          >
            Book a Table
          </Button>
          <Button
            variant="ghost-gold"
            size="xl"
            onClick={scrollToTournaments}
            className="min-w-[180px]"
          >
            View Tournaments
          </Button>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-32 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                currentSlide === index
                  ? "w-8 bg-accent"
                  : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
