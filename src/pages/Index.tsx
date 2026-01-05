import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { BookingSection } from "@/components/BookingSection";
import { TournamentsSection } from "@/components/TournamentsSection";
import { PricingSection } from "@/components/PricingSection";
import { GallerySection } from "@/components/GallerySection";
import { AmenitiesSection } from "@/components/AmenitiesSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <LocationSection />
        <BookingSection />
        <TournamentsSection />
        <PricingSection />
        <GallerySection />
        <AmenitiesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
