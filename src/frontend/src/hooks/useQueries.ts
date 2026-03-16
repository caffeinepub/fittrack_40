import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BodyMetric,
  DailyGoals,
  FoodEntry,
  StepsLog,
  UserProfile,
  WaterIntake,
  WorkoutLog,
} from "../backend.d";
import { todayDate_ } from "../lib/dateUtils";
import { useActor } from "./useActor";

export function useDailySummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dailySummary", todayDate_()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDailySummary(todayDate_());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkouts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExerciseLibrary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["exerciseLibrary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExerciseLibrary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 10,
  });
}

export function useNutritionEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["nutrition", todayDate_()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNutritionEntries(todayDate_());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogWater() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (intake: WaterIntake) => {
      if (!actor) throw new Error("Not connected");
      return actor.logWaterIntake(intake);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useLogSteps() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: StepsLog) => {
      if (!actor) throw new Error("Not connected");
      return actor.logSteps(log);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useLogBodyMetric() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: BodyMetric) => {
      if (!actor) throw new Error("Not connected");
      return actor.logBodyMetric(metric);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useLogNutrition() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ entry }: { entry: FoodEntry }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logNutritionEntry(todayDate_(), entry);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["nutrition"] });
      void qc.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useLogWorkout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workout: WorkoutLog) => {
      if (!actor) throw new Error("Not connected");
      return actor.logWorkout(workout);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useSetDailyGoals() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goals: DailyGoals) => {
      if (!actor) throw new Error("Not connected");
      return actor.setDailyGoals(goals);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dailyGoals"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useDailyGoals() {
  const { isFetching } = useActor();
  return useQuery({
    queryKey: ["dailyGoals"],
    queryFn: async () => {
      const stored = localStorage.getItem("fittrack_goals");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          calorieGoal: BigInt(parsed.calorieGoal ?? 2000),
          stepGoal: BigInt(parsed.stepGoal ?? 10000),
          waterGoalMl: BigInt(parsed.waterGoalMl ?? 2500),
          weightGoalLbs: Number(parsed.weightGoalLbs ?? 160),
        } as DailyGoals;
      }
      return {
        calorieGoal: BigInt(2000),
        stepGoal: BigInt(10000),
        waterGoalMl: BigInt(2500),
        weightGoalLbs: 160,
      } as DailyGoals;
    },
    enabled: !isFetching,
  });
}
