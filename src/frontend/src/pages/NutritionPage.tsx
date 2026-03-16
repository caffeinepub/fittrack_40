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
import { Loader2, Plus, Utensils } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDailyGoals,
  useLogNutrition,
  useNutritionEntries,
} from "../hooks/useQueries";

function MacroBar({
  protein,
  carbs,
  fat,
}: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        <motion.div
          className="h-full rounded-l-full"
          style={{ backgroundColor: "oklch(0.84 0.22 140)", width: `${pPct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="h-full"
          style={{ backgroundColor: "oklch(0.75 0.18 55)", width: `${cPct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${cPct}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        />
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: "oklch(0.7 0.18 280)", width: `${fPct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${fPct}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        />
      </div>
      <div className="flex gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          Protein {protein}g ({Math.round(pPct)}%)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: "oklch(0.75 0.18 55)" }}
          />
          Carbs {carbs}g ({Math.round(cPct)}%)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: "oklch(0.7 0.18 280)" }}
          />
          Fat {fat}g ({Math.round(fPct)}%)
        </span>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { data: entries, isLoading } = useNutritionEntries();
  const { data: goals } = useDailyGoals();
  const logNutrition = useLogNutrition();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const totalCalories = (entries ?? []).reduce(
    (sum, e) => sum + Number(e.calories),
    0,
  );
  const totalProtein = (entries ?? []).reduce(
    (sum, e) => sum + Number(e.protein),
    0,
  );
  const totalCarbs = (entries ?? []).reduce(
    (sum, e) => sum + Number(e.carbs),
    0,
  );
  const totalFat = (entries ?? []).reduce((sum, e) => sum + Number(e.fat), 0);
  const calGoal = Number(goals?.calorieGoal ?? 2000);
  const calPct = Math.min((totalCalories / calGoal) * 100, 100);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Enter a food name");
      return;
    }
    try {
      await logNutrition.mutateAsync({
        entry: {
          name: form.name,
          calories: BigInt(Number.parseInt(form.calories) || 0),
          protein: BigInt(Number.parseInt(form.protein) || 0),
          carbs: BigInt(Number.parseInt(form.carbs) || 0),
          fat: BigInt(Number.parseInt(form.fat) || 0),
        },
      });
      toast.success(`${form.name} logged!`);
      setOpen(false);
      setForm({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    } catch {
      toast.error("Failed to log food");
    }
  };

  const update = (field: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Nutrition
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Today&apos;s food log
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="nutrition.open_modal_button"
              className="gap-2 glow-primary-sm"
            >
              <Plus className="w-4 h-4" />
              Add Food
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="nutrition.dialog">
            <DialogHeader>
              <DialogTitle>Log Food</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="food-name">Food Name</Label>
                <Input
                  id="food-name"
                  data-ocid="nutrition.name.input"
                  placeholder="e.g. Grilled Chicken Breast"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="food-cal">Calories (kcal)</Label>
                  <Input
                    id="food-cal"
                    data-ocid="nutrition.calories.input"
                    type="number"
                    placeholder="0"
                    value={form.calories}
                    onChange={(e) => update("calories", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="food-protein">Protein (g)</Label>
                  <Input
                    id="food-protein"
                    data-ocid="nutrition.protein.input"
                    type="number"
                    placeholder="0"
                    value={form.protein}
                    onChange={(e) => update("protein", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="food-carbs">Carbs (g)</Label>
                  <Input
                    id="food-carbs"
                    data-ocid="nutrition.carbs.input"
                    type="number"
                    placeholder="0"
                    value={form.carbs}
                    onChange={(e) => update("carbs", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="food-fat">Fat (g)</Label>
                  <Input
                    id="food-fat"
                    data-ocid="nutrition.fat.input"
                    type="number"
                    placeholder="0"
                    value={form.fat}
                    onChange={(e) => update("fat", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                data-ocid="nutrition.cancel.button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="nutrition.submit_button"
                onClick={handleSubmit}
                disabled={logNutrition.isPending}
                className="glow-primary-sm"
              >
                {logNutrition.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Log Food
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calorie Summary */}
      <motion.div
        className="card-elevated rounded-2xl p-5 mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-4xl font-display font-bold text-foreground">
              {totalCalories}
            </span>
            <span className="text-muted-foreground text-sm ml-2">
              / {calGoal} kcal
            </span>
          </div>
          <span className="text-primary font-semibold text-sm">
            {Math.round(calPct)}% of goal
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${calPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <MacroBar protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
      </motion.div>

      {/* Food Entries */}
      {isLoading ? (
        <div
          data-ocid="nutrition.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (entries ?? []).length === 0 ? (
        <motion.div
          data-ocid="nutrition.empty_state"
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            No meals logged yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Add your first meal to start tracking nutrition.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {(entries ?? []).map((entry, idx) => (
            <motion.div
              key={`${entry.name}-${idx}`}
              data-ocid={`nutrition.item.${idx + 1}`}
              className="card-elevated rounded-xl p-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">
                    {entry.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    P: {Number(entry.protein)}g · C: {Number(entry.carbs)}g · F:{" "}
                    {Number(entry.fat)}g
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-primary">
                    {Number(entry.calories)}
                  </div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
