import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

export function Footer() {
  const { data: settings } = useSettings();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-secondary/50 border-t border-border/30 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl text-foreground mb-4">
              AHS <span className="text-gold-gradient">Snooker Club</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Varanasi's premier destination for serious snooker players. 
              Professional tables, refined atmosphere, and a community of excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "About", id: "about" },
                { label: "Book a Table", id: "booking" },
                { label: "Tournaments", id: "tournaments" },
                { label: "Pricing", id: "pricing" },
                { label: "Gallery", id: "gallery" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>{settings?.address || "Sigra, Varanasi"}</li>
              <li>{settings?.contact_number || "+91 9876543210"}</li>
              <li>{settings?.opening_hours || "10:00 AM - 11:00 PM"}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {settings?.club_name || "AHS Snooker Club"}. All Rights Reserved.
          </p>
          <Link
            to="/admin"
            className="text-muted-foreground/50 hover:text-muted-foreground text-xs transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
