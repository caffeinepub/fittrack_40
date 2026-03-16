import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPrompt() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: Activity,
      label: "Track Workouts",
      desc: "Log exercises with sets, reps & weight",
    },
    {
      icon: Target,
      label: "Set Goals",
      desc: "Daily calorie, step & water targets",
    },
    {
      icon: TrendingUp,
      label: "Monitor Progress",
      desc: "Track weight & body metrics over time",
    },
    { icon: Zap, label: "Quick Logging", desc: "Fast nutrition & water entry" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('/assets/generated/fittrack-hero-bg.dim_1200x400.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center glow-primary">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <span className="text-4xl font-display font-800 text-foreground tracking-tight">
            FitTrack
          </span>
        </motion.div>

        <motion.h1
          className="text-2xl font-display font-semibold text-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your performance, tracked.
        </motion.h1>
        <motion.p
          className="text-muted-foreground mb-10 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Log workouts, nutrition, hydration and body metrics — all in one
          place.
        </motion.p>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card-elevated rounded-xl p-4 text-left">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <div className="font-display font-semibold text-sm text-foreground">
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            data-ocid="login.primary_button"
            className="w-full h-12 text-base font-semibold glow-primary-sm"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
          >
            {isLoggingIn
              ? "Connecting..."
              : isInitializing
                ? "Loading..."
                : "Get Started — Login"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
