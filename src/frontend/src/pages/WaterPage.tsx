import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDailyGoals,
  useDailySummary,
  useLogWater,
} from "../hooks/useQueries";
import { todayDate_ } from "../lib/dateUtils";

export default function WaterPage() {
  const { data: summary } = useDailySummary();
  const { data: goals } = useDailyGoals();
  const logWater = useLogWater();

  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const current = Number(summary?.totalWaterMl ?? 0);
  const goal = Number(goals?.waterGoalMl ?? 2500);
  const pct = Math.min(current / Math.max(goal, 1), 1);
  const remaining = Math.max(goal - current, 0);

  const handleAdd = async (ml: number) => {
    try {
      await logWater.mutateAsync({ date: todayDate_(), amountMl: BigInt(ml) });
      toast.success(`+${ml}ml logged!`);
    } catch {
      toast.error("Failed to log water");
    }
  };

  const handleCustom = async () => {
    const ml = Number.parseInt(customAmount);
    if (!ml || ml <= 0) return;
    await handleAdd(ml);
    setCustomOpen(false);
    setCustomAmount("");
  };

  const glassHeight = 200;
  const waterHeight = Math.round(glassHeight * pct);

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Hydration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Stay hydrated throughout the day
        </p>
      </div>

      {/* Visual Water Glass */}
      <motion.div
        className="card-elevated rounded-2xl p-8 mb-8 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative mb-6">
          <svg
            width="120"
            height="220"
            viewBox="0 0 120 220"
            role="img"
            aria-label={`Water glass: ${Math.round(pct * 100)}% full`}
          >
            <path
              d="M15 20 L10 200 Q10 210 20 210 L100 210 Q110 210 110 200 L105 20 Z"
              fill="none"
              stroke="oklch(0.35 0.02 265)"
              strokeWidth="2"
            />
            <clipPath id="glass-clip">
              <path d="M16 21 L11 199 Q11 208 20 208 L100 208 Q109 208 109 199 L104 21 Z" />
            </clipPath>
            <motion.rect
              x="11"
              y={210 - waterHeight - 2}
              width="98"
              height={waterHeight}
              fill="oklch(0.72 0.18 200 / 0.6)"
              clipPath="url(#glass-clip)"
              initial={{ height: 0, y: 208 }}
              animate={{ height: waterHeight, y: 210 - waterHeight - 2 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.rect
              x="11"
              y={210 - waterHeight - 2}
              width="18"
              height={waterHeight}
              fill="oklch(0.85 0.1 200 / 0.2)"
              clipPath="url(#glass-clip)"
              initial={{ height: 0, y: 208 }}
              animate={{ height: waterHeight, y: 210 - waterHeight - 2 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <text
              x="60"
              y="120"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="oklch(0.95 0.005 265)"
              fontSize="22"
              fontWeight="700"
              fontFamily="Bricolage Grotesque, sans-serif"
            >
              {Math.round(pct * 100)}%
            </text>
          </svg>
        </div>

        <div className="text-center">
          <div className="text-4xl font-display font-bold text-foreground">
            {current}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              ml
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {remaining > 0 ? (
              <span>
                {remaining}ml to reach your {goal}ml goal
              </span>
            ) : (
              <span className="text-primary font-semibold">
                🎉 Goal reached! Great job!
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Quick Add
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[250, 500, 750].map((ml) => (
          <motion.button
            key={ml}
            type="button"
            data-ocid={`water.add-${ml}.button`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="card-elevated rounded-xl py-4 flex flex-col items-center gap-1 transition-colors hover:bg-secondary/70"
            onClick={() => handleAdd(ml)}
            disabled={logWater.isPending}
          >
            <Droplets className="w-5 h-5 text-chart-2" />
            <span className="font-display font-bold text-foreground text-sm">
              +{ml}ml
            </span>
            <span className="text-xs text-muted-foreground">
              {ml === 250 ? "Glass" : ml === 500 ? "Bottle" : "Large"}
            </span>
          </motion.button>
        ))}
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogTrigger asChild>
          <Button
            data-ocid="water.custom.open_modal_button"
            variant="outline"
            className="w-full gap-2"
            disabled={logWater.isPending}
          >
            <Plus className="w-4 h-4" />
            Custom Amount
          </Button>
        </DialogTrigger>
        <DialogContent data-ocid="water.custom.dialog">
          <DialogHeader>
            <DialogTitle>Log Custom Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="water-custom">Amount (ml)</Label>
              <Input
                id="water-custom"
                data-ocid="water.custom.input"
                type="number"
                placeholder="e.g. 330"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustom()}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="water.custom.cancel_button"
              onClick={() => setCustomOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="water.custom.submit_button"
              onClick={handleCustom}
              disabled={logWater.isPending}
              className="glow-primary-sm"
            >
              {logWater.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Log Water
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
