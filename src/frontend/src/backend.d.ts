import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    name: string;
    exerciseType: ExerciseType;
    muscleGroup: MuscleGroup;
}
export interface WorkoutLog {
    date: Date_;
    name: string;
    exercises: Array<ExerciseSet>;
}
export interface StepsLog {
    date: Date_;
    steps: bigint;
}
export interface Date_ {
    day: bigint;
    month: bigint;
    year: bigint;
}
export interface DailyGoals {
    weightGoalLbs: number;
    calorieGoal: bigint;
    stepGoal: bigint;
    waterGoalMl: bigint;
}
export interface WaterIntake {
    date: Date_;
    amountMl: bigint;
}
export interface DailySummary {
    totalCarbs: bigint;
    totalFat: bigint;
    totalCalories: bigint;
    totalSteps: bigint;
    totalProtein: bigint;
    latestWeight?: number;
    totalWaterMl: bigint;
}
export interface FoodEntry {
    fat: bigint;
    carbs: bigint;
    calories: bigint;
    name: string;
    protein: bigint;
}
export interface BodyMetric {
    weightLbs: number;
    date: Date_;
    bodyFatPercentage: number;
}
export interface UserProfile {
    name: string;
}
export interface ExerciseSet {
    weight: bigint;
    duration: bigint;
    reps: bigint;
    sets: bigint;
    exerciseName: string;
}
export enum ExerciseType {
    strength = "strength",
    cardio = "cardio"
}
export enum MuscleGroup {
    shoulders = "shoulders",
    arms = "arms",
    back = "back",
    core = "core",
    chest = "chest",
    legs = "legs",
    fullBody = "fullBody",
    cardio = "cardio"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailySummary(today: Date_): Promise<DailySummary>;
    getExerciseLibrary(): Promise<Array<Exercise>>;
    getNutritionEntries(date: Date_): Promise<Array<FoodEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkouts(): Promise<Array<WorkoutLog>>;
    isCallerAdmin(): Promise<boolean>;
    logBodyMetric(metric: BodyMetric): Promise<void>;
    logNutritionEntry(date: Date_, entry: FoodEntry): Promise<void>;
    logSteps(steps: StepsLog): Promise<void>;
    logWaterIntake(intake: WaterIntake): Promise<void>;
    logWorkout(workout: WorkoutLog): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDailyGoals(goals: DailyGoals): Promise<void>;
}
