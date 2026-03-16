import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Target, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDailyGoals,
  useSaveProfile,
  useSetDailyGoals,
  useUserProfile,
} from "../hooks/useQueries";

export default function GoalsPage() {
  const { data: goals } = useDailyGoals();
  const { data: profile } = useUserProfile();
  const setGoals = useSetDailyGoals();
  const saveProfile = useSaveProfile();
  const qc = useQueryClient();

  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");
  const [weight, setWeight] = useState("");
  const [name, setName] = useState("");
  const [goalsSaved, setGoalsSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (goals) {
      setCalories(String(goals.calorieGoal));
      setSteps(String(goals.stepGoal));
      setWater(String(goals.waterGoalMl));
      setWeight(String(goals.weightGoalLbs));
    }
  }, [goals]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const handleSaveGoals = async () => {
    const cal = Number.parseInt(calories);
    const st = Number.parseInt(steps);
    const wat = Number.parseInt(water);
    const wt = Number.parseFloat(weight);
    if (!cal || !st || !wat || !wt) {
      toast.error("Fill in all goal fields");
      return;
    }

    // Persist goals locally too
    localStorage.setItem(
      "fittrack_goals",
      JSON.stringify({
        calorieGoal: cal,
        stepGoal: st,
        waterGoalMl: wat,
        weightGoalLbs: wt,
      }),
    );

    try {
      await setGoals.mutateAsync({
        calorieGoal: BigInt(cal),
        stepGoal: BigInt(st),
        waterGoalMl: BigInt(wat),
        weightGoalLbs: wt,
      });
      void qc.invalidateQueries({ queryKey: ["dailyGoals"] });
      setGoalsSaved(true);
      toast.success("Goals updated!");
      setTimeout(() => setGoalsSaved(false), 3000);
    } catch {
      toast.error("Failed to save goals");
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      setProfileSaved(true);
      toast.success("Profile saved!");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Goals & Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set your daily fitness targets
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        className="card-elevated rounded-2xl p-5 mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Your Profile
          </h2>
        </div>
        <div className="mb-4">
          <Label htmlFor="profile-name">Display Name</Label>
          <Input
            id="profile-name"
            data-ocid="goals.profile-name.input"
            placeholder="e.g. Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
            className="mt-1"
          />
        </div>
        <Button
          data-ocid="goals.profile.submit_button"
          onClick={handleSaveProfile}
          disabled={saveProfile.isPending}
          variant="secondary"
          className="w-full"
        >
          {saveProfile.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : profileSaved ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
          ) : null}
          {profileSaved ? "Saved!" : "Save Profile"}
        </Button>
      </motion.div>

      <Separator className="my-6" />

      {/* Goals Section */}
      <motion.div
        className="card-elevated rounded-2xl p-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Daily Targets
          </h2>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cal-goal">Daily Calories (kcal)</Label>
              <Input
                id="cal-goal"
                data-ocid="goals.calories.input"
                type="number"
                placeholder="2000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="step-goal">Daily Steps</Label>
              <Input
                id="step-goal"
                data-ocid="goals.steps.input"
                type="number"
                placeholder="10000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="water-goal">Daily Water (ml)</Label>
              <Input
                id="water-goal"
                data-ocid="goals.water.input"
                type="number"
                placeholder="2500"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight-goal">Target Weight (lbs)</Label>
              <Input
                id="weight-goal"
                data-ocid="goals.weight.input"
                type="number"
                step="0.1"
                placeholder="160"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Previews */}
          {(calories || steps || water || weight) && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Calories",
                  value: calories,
                  unit: "kcal",
                  color: "oklch(0.75 0.18 55)",
                },
                {
                  label: "Steps",
                  value: steps,
                  unit: "steps",
                  color: "oklch(0.84 0.22 140)",
                },
                {
                  label: "Water",
                  value: water,
                  unit: "ml",
                  color: "oklch(0.72 0.18 200)",
                },
                {
                  label: "Target Weight",
                  value: weight,
                  unit: "lbs",
                  color: "oklch(0.7 0.18 280)",
                },
              ].map(({ label, value, unit, color }) =>
                value ? (
                  <div key={label} className="bg-secondary rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      {label}
                    </div>
                    <div
                      className="font-display font-bold text-foreground"
                      style={{ color }}
                    >
                      {Number.parseInt(value).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {unit}
                      </span>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          )}

          <Button
            data-ocid="goals.save.submit_button"
            onClick={handleSaveGoals}
            disabled={setGoals.isPending}
            className="w-full glow-primary-sm"
          >
            {setGoals.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : goalsSaved ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : null}
            {goalsSaved ? "Goals Saved!" : "Save Goals"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
