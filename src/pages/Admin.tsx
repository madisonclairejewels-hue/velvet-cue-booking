import { useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminSlideshow } from "@/components/admin/AdminSlideshow";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminTournaments } from "@/components/admin/AdminTournaments";
import { AdminPricing } from "@/components/admin/AdminPricing";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminSettings } from "@/components/admin/AdminSettings";

type Section = "dashboard" | "slideshow" | "gallery" | "tournaments" | "pricing" | "bookings" | "settings";

function AdminContent() {
  const { isAuthenticated } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "slideshow":
        return <AdminSlideshow />;
      case "gallery":
        return <AdminGallery />;
      case "tournaments":
        return <AdminTournaments />;
      case "pricing":
        return <AdminPricing />;
      case "bookings":
        return <AdminBookings />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={(section) => setActiveSection(section as Section)}
      />

      {/* Main Content */}
      <main className="min-h-screen pl-0 transition-all duration-300">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-6 pl-16">
            <div>
              <h2 className="text-foreground font-serif text-lg capitalize">
                {activeSection === "dashboard" ? "Dashboard" : activeSection.replace("-", " ")}
              </h2>
            </div>
            <div className="text-sm text-muted-foreground">
              AHS Snooker Club Admin
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

const Admin = () => {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
};

export default Admin;
