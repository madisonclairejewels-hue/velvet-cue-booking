import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  // Check if any admin already exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Use a raw count query to check if any admin exists
        // This works even without authentication since we're just checking existence
        const { count, error } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        if (error) {
          // If we get a permission error, assume we need to check differently
          console.log("Could not check admin count, proceeding with setup");
          setAdminExists(false);
        } else {
          setAdminExists((count ?? 0) > 0);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setAdminExists(false);
      } finally {
        setCheckingAdmins(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    const validation = setupSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!signUpData.user) {
        throw new Error("Failed to create user account");
      }

      // Step 2: Add admin role for this user
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: signUpData.user.id,
          role: "admin",
        });

      if (roleError) {
        // If role insertion fails, we should inform the user
        throw new Error("Account created but failed to grant admin role. Please contact support.");
      }

      setSuccess(true);

      // Redirect to admin after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "An error occurred during setup");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmins) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border/50 rounded-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-serif text-2xl text-foreground mb-4">Setup Complete</h1>
            <p className="text-muted-foreground mb-6">
              An admin user already exists. Please use the regular login page to access the admin panel.
            </p>
            <Button
              variant="premium"
              className="w-full"
              onClick={() => navigate("/admin")}
            >
              Go to Admin Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-accent/30 rounded-sm p-8 shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-accent" />
            </motion.div>
            <h1 className="font-serif text-2xl text-foreground mb-4">Admin Created!</h1>
            <p className="text-muted-foreground mb-2">
              Your admin account has been created successfully.
            </p>
            <p className="text-muted-foreground text-sm">
              Redirecting to admin panel...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border/50 rounded-sm p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl text-foreground mb-2">Admin Setup</h1>
            <p className="text-muted-foreground text-sm">
              Create the first admin account for your snooker club
            </p>
          </div>

          {/* Warning */}
          <div className="bg-accent/10 border border-accent/30 rounded-sm p-4 mb-6">
            <p className="text-accent text-sm">
              <strong>First-time setup:</strong> This page is only available when no admin exists. 
              After creating the first admin, additional admins must be added manually.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </motion.div>
          )}

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="bg-muted/50 pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="bg-muted/50 pl-10"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-muted/50 pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="premium"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-muted-foreground text-xs text-center">
              Already have an admin account?{" "}
              <button
                onClick={() => navigate("/admin")}
                className="text-primary hover:underline"
              >
                Go to login
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
