import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricing } from "@/hooks/usePricing";

export function PricingSection() {
  const { data: pricing, isLoading } = usePricing();

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse">Loading pricing...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-gradient font-serif text-sm tracking-[0.3em] uppercase mb-4 block">
            Membership
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
            Pricing Plans
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricing?.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative card-glow rounded-sm overflow-hidden ${
                plan.is_popular
                  ? "bg-card border-2 border-accent/50"
                  : "bg-card border border-border/50"
              }`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground text-center py-2 text-xs uppercase tracking-wider font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.is_popular ? "pt-14" : ""}`}>
                <h3 className="font-serif text-2xl text-foreground mb-2">{plan.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-serif text-foreground">₹{plan.price}</span>
                  {plan.duration && (
                    <span className="text-muted-foreground ml-2">/{plan.duration}</span>
                  )}
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  variant={plan.is_popular ? "premium" : "ghost-gold"}
                  className="w-full"
                  onClick={scrollToBooking}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
