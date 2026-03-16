import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  ChevronDown,
  Dumbbell,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ExerciseSet } from "../backend.d";
import {
  useExerciseLibrary,
  useLogWorkout,
  useWorkouts,
} from "../hooks/useQueries";
import { formatDate_, todayDate_ } from "../lib/dateUtils";

const MUSCLE_LABELS: Record<string, string> = {
  shoulders: "Shoulders",
  arms: "Arms",
  back: "Back",
  core: "Core",
  chest: "Chest",
  legs: "Legs",
  fullBody: "Full Body",
  cardio: "Cardio",
};

interface WorkoutExerciseForm {
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
  duration: string;
}

export default function WorkoutPage() {
  const { data: workouts, isLoading } = useWorkouts();
  const { data: library } = useExerciseLibrary();
  const logWorkout = useLogWorkout();

  const [open, setOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExerciseForm[]>([]);
  const [searchEx, setSearchEx] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  const filteredLibrary = (library ?? []).filter((e) =>
    e.name.toLowerCase().includes(searchEx.toLowerCase()),
  );

  const groupedLibrary = filteredLibrary.reduce<
    Record<string, typeof filteredLibrary>
  >((acc, ex) => {
    const group = ex.muscleGroup as string;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  const addExercise = (name: string) => {
    setExercises((prev) => [
      ...prev,
      { exerciseName: name, sets: "3", reps: "10", weight: "0", duration: "0" },
    ]);
    setShowLibrary(false);
    setSearchEx("");
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateExercise = (
    idx: number,
    field: keyof WorkoutExerciseForm,
    val: string,
  ) => {
    setExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    );
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      toast.error("Enter a workout name");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }

    const sets: ExerciseSet[] = exercises.map((e) => ({
      exerciseName: e.exerciseName,
      sets: BigInt(Number.parseInt(e.sets) || 1),
      reps: BigInt(Number.parseInt(e.reps) || 0),
      weight: BigInt(Number.parseInt(e.weight) || 0),
      duration: BigInt(Number.parseInt(e.duration) || 0),
    }));

    try {
      await logWorkout.mutateAsync({
        date: todayDate_(),
        name: workoutName,
        exercises: sets,
      });
      toast.success("Workout logged!");
      setOpen(false);
      setWorkoutName("");
      setExercises([]);
    } catch {
      toast.error("Failed to log workout");
    }
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Workouts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your training sessions
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="workout.open_modal_button"
              className="gap-2 glow-primary-sm"
            >
              <Plus className="w-4 h-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="workout.dialog"
            className="max-w-lg max-h-[90vh] flex flex-col"
          >
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-1">
              <div className="space-y-5 py-2">
                {/* Workout Name */}
                <div>
                  <Label htmlFor="workout-name">Workout Name</Label>
                  <Input
                    id="workout-name"
                    data-ocid="workout.name.input"
                    placeholder="e.g. Upper Body Push"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Exercises */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Exercises ({exercises.length})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="workout.add_exercise.button"
                      onClick={() => setShowLibrary(!showLibrary)}
                      className="gap-1 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Add Exercise
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          showLibrary ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Library selector */}
                  {showLibrary && (
                    <div className="bg-secondary rounded-xl p-3 mb-3">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          data-ocid="workout.exercise_search.search_input"
                          placeholder="Search exercises..."
                          value={searchEx}
                          onChange={(e) => setSearchEx(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                      <ScrollArea className="h-48">
                        {Object.entries(groupedLibrary).map(([group, exs]) => (
                          <div key={group} className="mb-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                              {MUSCLE_LABELS[group] ?? group}
                            </div>
                            <div className="space-y-1">
                              {exs.map((ex) => (
                                <button
                                  key={ex.name}
                                  type="button"
                                  onClick={() => addExercise(ex.name)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-background transition-colors text-foreground"
                                >
                                  {ex.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {filteredLibrary.length === 0 && (
                          <div className="text-center text-muted-foreground text-sm py-4">
                            No exercises found
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}

                  {/* Exercise list */}
                  <div className="space-y-3">
                    {exercises.map((ex, idx) => (
                      <div
                        key={`${ex.exerciseName}-${idx}`}
                        className="bg-secondary rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-sm text-foreground">
                            {ex.exerciseName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExercise(idx)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {(
                            ["sets", "reps", "weight", "duration"] as const
                          ).map((field) => (
                            <div key={field}>
                              <div className="text-xs text-muted-foreground mb-1 capitalize">
                                {field === "weight"
                                  ? "lbs"
                                  : field === "duration"
                                    ? "min"
                                    : field}
                              </div>
                              <Input
                                type="number"
                                value={ex[field]}
                                onChange={(e) =>
                                  updateExercise(idx, field, e.target.value)
                                }
                                className="h-8 text-sm px-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {exercises.length === 0 && (
                      <div
                        data-ocid="workout.exercises.empty_state"
                        className="text-center text-muted-foreground text-sm py-6 bg-secondary rounded-xl"
                      >
                        No exercises added yet. Click &quot;Add Exercise&quot;
                        to begin.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                data-ocid="workout.cancel.button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="workout.submit_button"
                onClick={handleSubmit}
                disabled={logWorkout.isPending}
                className="glow-primary-sm"
              >
                {logWorkout.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Workout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workouts List */}
      {isLoading ? (
        <div
          data-ocid="workout.loading_state"
          className="flex justify-center py-16"
        >
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (workouts ?? []).length === 0 ? (
        <motion.div
          data-ocid="workout.empty_state"
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            No workouts yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Log your first workout to start tracking your progress.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {(workouts ?? []).map((workout, idx) => (
            <motion.div
              key={`${workout.name}-${idx}`}
              data-ocid={`workout.item.${idx + 1}`}
              className="card-elevated rounded-2xl p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-lg">
                    {workout.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate_(workout.date)}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">
                  {workout.exercises.length} exercises
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.map((ex, ei) => (
                  <div
                    key={`${ex.exerciseName}-${ei}`}
                    className="text-xs bg-secondary rounded-lg px-3 py-1.5 text-foreground"
                  >
                    <span className="font-medium">{ex.exerciseName}</span>
                    {Number(ex.sets) > 0 && (
                      <span className="text-muted-foreground ml-1">
                        {Number(ex.sets)}×{Number(ex.reps)}
                        {Number(ex.weight) > 0
                          ? ` @ ${Number(ex.weight)}lbs`
                          : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
