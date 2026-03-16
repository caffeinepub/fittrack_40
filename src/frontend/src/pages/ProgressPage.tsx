import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Footprints, Loader2, Scale, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDailySummary,
  useLogBodyMetric,
  useLogSteps,
} from "../hooks/useQueries";
import { formatDate, todayDate_ } from "../lib/dateUtils";

export default function ProgressPage() {
  const { data: summary } = useDailySummary();
  const logMetric = useLogBodyMetric();
  const logSteps = useLogSteps();

  const [weightInput, setWeightInput] = useState("");
  const [bodyFatInput, setBodyFatInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");

  const handleLogMetric = async () => {
    const w = Number.parseFloat(weightInput);
    const bf = Number.parseFloat(bodyFatInput);
    if (!w || w <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    try {
      await logMetric.mutateAsync({
        date: todayDate_(),
        weightLbs: w,
        bodyFatPercentage: bf || 0,
      });
      toast.success("Body metrics logged!");
      setWeightInput("");
      setBodyFatInput("");
    } catch {
      toast.error("Failed to log metrics");
    }
  };

  const handleLogSteps = async () => {
    const s = Number.parseInt(stepsInput);
    if (!s || s <= 0) {
      toast.error("Enter a valid step count");
      return;
    }
    try {
      await logSteps.mutateAsync({ date: todayDate_(), steps: BigInt(s) });
      toast.success(`${s.toLocaleString()} steps logged!`);
      setStepsInput("");
    } catch {
      toast.error("Failed to log steps");
    }
  };

  const today = formatDate(new Date());
  const currentWeight = summary?.latestWeight;
  const currentSteps = Number(summary?.totalSteps ?? 0);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Progress
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your body metrics and activity
        </p>
      </div>

      {/* Today's Snapshot */}
      <motion.div
        className="card-elevated rounded-2xl p-5 mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {today}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-xl p-4 text-center">
            <Scale className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-foreground">
              {currentWeight != null ? `${currentWeight.toFixed(1)}` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              lbs logged today
            </div>
          </div>
          <div className="bg-secondary rounded-xl p-4 text-center">
            <Footprints className="w-5 h-5 text-chart-2 mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-foreground">
              {currentSteps > 0 ? currentSteps.toLocaleString() : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              steps today
            </div>
          </div>
        </div>
      </motion.div>

      {/* Log Body Metrics */}
      <motion.div
        className="card-elevated rounded-2xl p-5 mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Scale className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Log Body Metrics
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="weight-input">Weight (lbs)</Label>
            <Input
              id="weight-input"
              data-ocid="progress.weight.input"
              type="number"
              step="0.1"
              placeholder="e.g. 175.5"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bodyfat-input">Body Fat (%)</Label>
            <Input
              id="bodyfat-input"
              data-ocid="progress.bodyfat.input"
              type="number"
              step="0.1"
              placeholder="e.g. 18.5"
              value={bodyFatInput}
              onChange={(e) => setBodyFatInput(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <Button
          data-ocid="progress.metric.submit_button"
          onClick={handleLogMetric}
          disabled={logMetric.isPending}
          className="w-full glow-primary-sm"
        >
          {logMetric.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Log Body Metrics
        </Button>
      </motion.div>

      <Separator className="my-6" />

      {/* Log Steps */}
      <motion.div
        className="card-elevated rounded-2xl p-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Footprints className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Log Steps
          </h2>
        </div>
        <div className="mb-4">
          <Label htmlFor="steps-progress">Steps taken today</Label>
          <Input
            id="steps-progress"
            data-ocid="progress.steps.input"
            type="number"
            placeholder="e.g. 8500"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogSteps()}
            className="mt-1"
          />
        </div>
        <Button
          data-ocid="progress.steps.submit_button"
          onClick={handleLogSteps}
          disabled={logSteps.isPending}
          className="w-full"
          variant="secondary"
        >
          {logSteps.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Log Steps
        </Button>
      </motion.div>

      {/* Tips */}
      <motion.div
        className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-foreground mb-1">
              Track consistently
            </div>
            <div className="text-xs text-muted-foreground">
              Log your weight at the same time each morning for most accurate
              trend data. Aim for 3–4 measurements per week.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
