import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import clubInterior from "@/assets/club-interior.jpg";

const defaultImages = [hero1, hero2, hero3, clubInterior];

export function GallerySection() {
  const { data: galleryImages } = useGallery();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use gallery images if available, otherwise use default images
  const images = galleryImages && galleryImages.length > 0
    ? galleryImages.map((img) => img.image_url)
    : defaultImages;

  return (
    <section id="gallery" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Visual Tour
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Gallery
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedImage(image)}
              className="relative aspect-square overflow-hidden rounded-sm group"
            >
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/0 transition-colors duration-300 group-hover:bg-background/20" />
            </motion.button>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-8"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-8 right-8 text-foreground/70 hover:text-foreground transition-colors"
              >
                <X className="h-8 w-8" />
              </button>

              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage}
                alt="Gallery preview"
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
