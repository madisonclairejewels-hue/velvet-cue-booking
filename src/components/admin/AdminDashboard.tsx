import { motion } from "framer-motion";
import { format, isToday, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Calendar, Trophy, Image, DollarSign, Users, TrendingUp } from "lucide-react";
import { useAllBookings } from "@/hooks/useBookings";
import { useTournaments } from "@/hooks/useTournaments";
import { useGallery } from "@/hooks/useGallery";
import { useAllPricing } from "@/hooks/usePricing";

export function AdminDashboard() {
  const { data: bookings } = useAllBookings();
  const { data: tournaments } = useTournaments();
  const { data: gallery } = useGallery();
  const { data: pricing } = useAllPricing();

  // Calculate stats
  const todaysBookings = bookings?.filter((b) => isToday(new Date(b.booking_date))) || [];
  
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthlyBookings = bookings?.filter((b) => 
    isWithinInterval(new Date(b.booking_date), { start: monthStart, end: monthEnd })
  ) || [];

  const activeTournaments = tournaments?.filter((t) => t.status === "upcoming" || t.status === "ongoing") || [];
  const totalGalleryImages = gallery?.length || 0;

  // Calculate estimated monthly revenue (example: ₹300 per booking)
  const estimatedRevenue = monthlyBookings.length * 300;

  const stats = [
    {
      label: "Today's Bookings",
      value: todaysBookings.length,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Monthly Bookings",
      value: monthlyBookings.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Tournaments",
      value: activeTournaments.length,
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Gallery Images",
      value: totalGalleryImages,
      icon: Image,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your club.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border/50 rounded-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-sm flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-sm p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-sm flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Revenue</p>
            <p className="text-4xl font-bold text-foreground">₹{estimatedRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on {monthlyBookings.length} bookings @ ₹300 avg</p>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Bookings
          </h2>
          {todaysBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No bookings for today.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {todaysBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-sm"
                >
                  <div>
                    <p className="text-foreground font-medium text-sm">{booking.user_name}</p>
                    <p className="text-muted-foreground text-xs">{booking.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm">{booking.time_slot}</p>
                    <p className="text-muted-foreground text-xs">Table #{booking.table_number}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Recent Bookings
          </h2>
          {!bookings?.length ? (
            <p className="text-muted-foreground text-sm py-4">No bookings yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-sm"
                >
                  <div>
                    <p className="text-foreground font-medium text-sm">{booking.user_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(booking.booking_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      booking.status === "confirmed"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Active Tournaments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Active Tournaments
        </h2>
        {activeTournaments.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">No active tournaments.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="p-4 bg-muted/30 rounded-sm border border-border/30"
              >
                <p className="text-foreground font-medium mb-1">{tournament.tournament_name}</p>
                <p className="text-muted-foreground text-sm mb-2">
                  {format(new Date(tournament.date), "MMM d, yyyy")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-accent text-sm">₹{tournament.entry_fee}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      tournament.status === "upcoming"
                        ? "bg-blue-500/20 text-blue-500"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {tournament.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
