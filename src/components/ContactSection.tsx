import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";

export function ContactSection() {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Public users can INSERT but cannot SELECT from contact_messages (PII)
      const { error } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const number = settings?.whatsapp_number?.replace(/\D/g, "") || "919876543210";
    window.open(`https://wa.me/${number}`, "_blank");
  };

  return (
    <section id="contact" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Get in Touch
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Contact Us
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <Label className="text-foreground">Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-card border-border/50 mt-2"
                required
              />
            </div>

            <div>
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-card border-border/50 mt-2"
                required
              />
            </div>

            <div>
              <Label className="text-foreground">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                rows={5}
                className="bg-card border-border/50 mt-2 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </motion.form>

          {/* Quick Contact */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="card-glow bg-card border border-border/50 p-8 rounded-sm">
              <h3 className="font-serif text-xl text-foreground mb-6">Quick Contact</h3>

              <div className="space-y-4">
                <a
                  href={`tel:${settings?.contact_number || "+919876543210"}`}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-sm hover:bg-muted/50 transition-colors"
                >
                  <Phone className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-foreground text-sm font-medium">Call Us</p>
                    <p className="text-muted-foreground text-sm">
                      {settings?.contact_number || "+91 9876543210"}
                    </p>
                  </div>
                </a>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-sm hover:bg-muted/50 transition-colors w-full text-left"
                >
                  <MessageCircle className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-foreground text-sm font-medium">WhatsApp</p>
                    <p className="text-muted-foreground text-sm">Send us a message</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center text-muted-foreground text-sm">
              <p>We typically respond within 24 hours.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
