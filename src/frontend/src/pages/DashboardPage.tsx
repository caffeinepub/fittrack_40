import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Droplets,
  Flame,
  Footprints,
  Loader2,
  Plus,
  Weight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDailyGoals,
  useDailySummary,
  useLogSteps,
  useLogWater,
  useUserProfile,
} from "../hooks/useQueries";
import { formatDate, todayDate_ } from "../lib/dateUtils";

function ProgressRing({
  value,
  max,
  size = 80,
  color = "oklch(0.84 0.22 140)",
  label,
}: {
  value: number;
  max: number;
  size?: number;
  color?: string;
  label: string;
}) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      role="img"
      aria-label={`${label}: ${Math.round(pct * 100)}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="oklch(0.22 0.018 265)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${color}80)`,
          transition: "stroke-dashoffset 1s ease",
        }}
      />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  goal,
  unit,
  color,
  index,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  index: number;
}) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);

  return (
    <motion.div
      className="card-elevated rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color }} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
          </div>
          <div className="text-3xl font-display font-bold text-foreground">
            {value.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Goal: {goal.toLocaleString()} {unit}
          </div>
        </div>
        <div className="relative">
          <ProgressRing
            value={value}
            max={goal}
            size={72}
            color={color}
            label={label}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">
              {Math.round(pct)}%
            </span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.8,
            delay: index * 0.08 + 0.3,
            ease: "easeOut",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDailySummary();
  const { data: goals } = useDailyGoals();
  const { data: profile } = useUserProfile();
  const logWater = useLogWater();
  const logSteps = useLogSteps();

  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [waterCustomOpen, setWaterCustomOpen] = useState(false);
  const [waterCustomInput, setWaterCustomInput] = useState("");

  const today = formatDate(new Date());

  const calories = Number(summary?.totalCalories ?? 0);
  const water = Number(summary?.totalWaterMl ?? 0);
  const steps = Number(summary?.totalSteps ?? 0);
  const weight = summary?.latestWeight ?? null;

  const calGoal = Number(goals?.calorieGoal ?? 2000);
  const waterGoal = Number(goals?.waterGoalMl ?? 2500);
  const stepGoal = Number(goals?.stepGoal ?? 10000);
  const weightGoal = goals?.weightGoalLbs ?? 160;

  const handleQuickWater = async (ml: number) => {
    try {
      await logWater.mutateAsync({ date: todayDate_(), amountMl: BigInt(ml) });
      toast.success(`+${ml}ml water logged!`);
    } catch {
      toast.error("Failed to log water");
    }
  };

  const handleLogSteps = async () => {
    const s = Number.parseInt(stepsInput);
    if (!s || s <= 0) return;
    try {
      await logSteps.mutateAsync({ date: todayDate_(), steps: BigInt(s) });
      toast.success(`${s.toLocaleString()} steps logged!`);
      setStepsOpen(false);
      setStepsInput("");
    } catch {
      toast.error("Failed to log steps");
    }
  };

  const handleCustomWater = async () => {
    const ml = Number.parseInt(waterCustomInput);
    if (!ml || ml <= 0) return;
    try {
      await logWater.mutateAsync({ date: todayDate_(), amountMl: BigInt(ml) });
      toast.success(`+${ml}ml water logged!`);
      setWaterCustomOpen(false);
      setWaterCustomInput("");
    } catch {
      toast.error("Failed to log water");
    }
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto lg:max-w-3xl">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-muted-foreground mb-1">{today}</p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Hey, {profile?.name ?? "Athlete"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your fitness summary for today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      {summaryLoading ? (
        <div
          data-ocid="dashboard.loading_state"
          className="flex items-center justify-center h-48"
        >
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={Flame}
            label="Calories"
            value={calories}
            goal={calGoal}
            unit="kcal"
            color="oklch(0.75 0.18 55)"
            index={0}
          />
          <StatCard
            icon={Droplets}
            label="Water"
            value={water}
            goal={waterGoal}
            unit="ml"
            color="oklch(0.72 0.18 200)"
            index={1}
          />
          <StatCard
            icon={Footprints}
            label="Steps"
            value={steps}
            goal={stepGoal}
            unit="steps"
            color="oklch(0.84 0.22 140)"
            index={2}
          />
          <motion.div
            className="card-elevated rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Weight className="w-4 h-4 text-chart-4" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Weight
              </span>
            </div>
            <div className="text-3xl font-display font-bold text-foreground">
              {weight !== null ? weight.toFixed(1) : "—"}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                lbs
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Goal: {weightGoal} lbs
            </div>
            {weight !== null && (
              <div
                className="mt-2 text-xs font-medium"
                style={{
                  color:
                    weight <= weightGoal
                      ? "oklch(0.84 0.22 140)"
                      : "oklch(0.75 0.18 55)",
                }}
              >
                {weight <= weightGoal
                  ? "✓ At goal weight"
                  : `${(weight - weightGoal).toFixed(1)} lbs above goal`}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Quick Log
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            data-ocid="dashboard.water-250.button"
            className="card-elevated rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors active:scale-95"
            onClick={() => handleQuickWater(250)}
            disabled={logWater.isPending}
          >
            <Droplets className="w-5 h-5 text-chart-2 mb-2" />
            <div className="font-semibold text-sm text-foreground">
              +250ml Water
            </div>
            <div className="text-xs text-muted-foreground">One glass</div>
          </button>

          <button
            type="button"
            data-ocid="dashboard.water-500.button"
            className="card-elevated rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors active:scale-95"
            onClick={() => handleQuickWater(500)}
            disabled={logWater.isPending}
          >
            <Droplets className="w-5 h-5 text-chart-2 mb-2" />
            <div className="font-semibold text-sm text-foreground">
              +500ml Water
            </div>
            <div className="text-xs text-muted-foreground">Large glass</div>
          </button>

          <Dialog open={stepsOpen} onOpenChange={setStepsOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                data-ocid="dashboard.steps.open_modal_button"
                className="card-elevated rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors active:scale-95"
              >
                <Footprints className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm text-foreground">
                  Log Steps
                </div>
                <div className="text-xs text-muted-foreground">
                  Add step count
                </div>
              </button>
            </DialogTrigger>
            <DialogContent data-ocid="dashboard.steps.dialog">
              <DialogHeader>
                <DialogTitle>Log Steps</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="steps-input">Steps taken today</Label>
                  <Input
                    id="steps-input"
                    data-ocid="dashboard.steps.input"
                    type="number"
                    placeholder="e.g. 8000"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogSteps()}
                    className="mt-1"
                  />
                </div>
                <Button
                  data-ocid="dashboard.steps.submit_button"
                  className="w-full"
                  onClick={handleLogSteps}
                  disabled={logSteps.isPending}
                >
                  {logSteps.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Log Steps
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={waterCustomOpen} onOpenChange={setWaterCustomOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                data-ocid="dashboard.water-custom.open_modal_button"
                className="card-elevated rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors active:scale-95"
              >
                <Plus className="w-5 h-5 text-chart-2 mb-2" />
                <div className="font-semibold text-sm text-foreground">
                  Custom Water
                </div>
                <div className="text-xs text-muted-foreground">
                  Enter amount
                </div>
              </button>
            </DialogTrigger>
            <DialogContent data-ocid="dashboard.water-custom.dialog">
              <DialogHeader>
                <DialogTitle>Log Custom Water</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="water-custom-input">Amount (ml)</Label>
                  <Input
                    id="water-custom-input"
                    data-ocid="dashboard.water-custom.input"
                    type="number"
                    placeholder="e.g. 350"
                    value={waterCustomInput}
                    onChange={(e) => setWaterCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomWater()}
                    className="mt-1"
                  />
                </div>
                <Button
                  data-ocid="dashboard.water-custom.submit_button"
                  className="w-full"
                  onClick={handleCustomWater}
                  disabled={logWater.isPending}
                >
                  {logWater.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Log Water
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {calories > 0 && (
        <motion.div
          className="card-elevated rounded-2xl p-5 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-display font-semibold text-foreground mb-4 uppercase tracking-wider">
            Today&apos;s Macros
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Protein",
                value: Number(summary?.totalProtein ?? 0),
                color: "oklch(0.84 0.22 140)",
                unit: "g",
              },
              {
                label: "Carbs",
                value: Number(summary?.totalCarbs ?? 0),
                color: "oklch(0.75 0.18 55)",
                unit: "g",
              },
              {
                label: "Fat",
                value: Number(summary?.totalFat ?? 0),
                color: "oklch(0.7 0.18 280)",
                unit: "g",
              },
            ].map(({ label, value, color, unit }) => (
              <div key={label} className="text-center">
                <div
                  className="text-2xl font-display font-bold"
                  style={{ color }}
                >
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {unit} {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
