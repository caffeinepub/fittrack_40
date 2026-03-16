import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Date = {
    year : Nat;
    month : Nat; // 1-based (January is 1)
    day : Nat;
  };

  module Date {
    public func compare(date1 : Date, date2 : Date) : Order.Order {
      switch (Nat.compare(date1.year, date2.year)) {
        case (#equal) {
          switch (Nat.compare(date1.month, date2.month)) {
            case (#equal) {
              Nat.compare(date1.day, date2.day);
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type ExerciseType = {
    #strength;
    #cardio;
  };

  type MuscleGroup = {
    #chest;
    #back;
    #legs;
    #arms;
    #shoulders;
    #core;
    #fullBody;
    #cardio;
  };

  type Exercise = {
    name : Text;
    muscleGroup : MuscleGroup;
    exerciseType : ExerciseType;
  };

  module Exercise {
    public func compare(exercise1 : Exercise, exercise2 : Exercise) : Order.Order {
      Text.compare(exercise1.name, exercise2.name);
    };
  };

  let exerciseLibrary = List.empty<Exercise>();

  // Populate exercise library with predefined exercises
  exerciseLibrary.add({
    name = "Bench Press";
    muscleGroup = #chest;
    exerciseType = #strength;
  });
  exerciseLibrary.add({
    name = "Squats";
    muscleGroup = #legs;
    exerciseType = #strength;
  });
  exerciseLibrary.add({
    name = "Pull-Ups";
    muscleGroup = #back;
    exerciseType = #strength;
  });
  exerciseLibrary.add({
    name = "Running";
    muscleGroup = #cardio;
    exerciseType = #cardio;
  });

  type ExerciseSet = {
    exerciseName : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat; // in lbs
    duration : Nat; // in minutes
  };

  type WorkoutLog = {
    date : Date;
    name : Text;
    exercises : [ExerciseSet];
  };

  module WorkoutLog {
    public func compare(log1 : WorkoutLog, log2 : WorkoutLog) : Order.Order {
      Date.compare(log1.date, log2.date);
    };
  };

  // Map: Principal (user) -> List of WorkoutLog
  let workoutLogs = Map.empty<Principal, List.List<WorkoutLog>>();

  type FoodEntry = {
    name : Text;
    calories : Nat;
    protein : Nat; // in grams
    carbs : Nat; // in grams
    fat : Nat; // in grams
  };

  module FoodEntry {
    public func compare(entry1 : FoodEntry, entry2 : FoodEntry) : Order.Order {
      Text.compare(entry1.name, entry2.name);
    };
  };

  // Map: Principal (user) -> Map of Date -> List of FoodEntry
  let nutritionLogs = Map.empty<Principal, Map.Map<Date, List.List<FoodEntry>>>();

  type WaterIntake = {
    date : Date;
    amountMl : Nat;
  };

  type BodyMetric = {
    date : Date;
    weightLbs : Float;
    bodyFatPercentage : Float;
  };

  module BodyMetric {
    public func compare(metric1 : BodyMetric, metric2 : BodyMetric) : Order.Order {
      Date.compare(metric1.date, metric2.date);
    };
  };

  type DailyGoals = {
    calorieGoal : Nat;
    stepGoal : Nat;
    waterGoalMl : Nat;
    weightGoalLbs : Float;
  };

  type StepsLog = {
    date : Date;
    steps : Nat;
  };

  type DailySummary = {
    totalCalories : Nat;
    totalProtein : Nat;
    totalCarbs : Nat;
    totalFat : Nat;
    totalWaterMl : Nat;
    totalSteps : Nat;
    latestWeight : ?Float;
  };

  // Map: Principal (user) -> List of WaterIntake
  let waterIntakeLogs = Map.empty<Principal, List.List<WaterIntake>>();

  // Map: Principal (user) -> List of BodyMetric
  let bodyMetricsLogs = Map.empty<Principal, List.List<BodyMetric>>();

  // Map: Principal (user) -> DailyGoals
  let dailyGoals = Map.empty<Principal, DailyGoals>();

  // Map: Principal (user) -> List of StepsLog
  let stepsLogs = Map.empty<Principal, List.List<StepsLog>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type and Storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func logWorkout(workout : WorkoutLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };

    let userWorkouts = switch (workoutLogs.get(caller)) {
      case (null) { List.empty<WorkoutLog>() };
      case (?workouts) { workouts };
    };
    userWorkouts.add(workout);
    workoutLogs.add(caller, userWorkouts);
  };

  public query ({ caller }) func getWorkouts() : async [WorkoutLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get workouts");
    };

    switch (workoutLogs.get(caller)) {
      case (null) { [] };
      case (?workouts) { workouts.toArray().sort() };
    };
  };

  public shared ({ caller }) func logNutritionEntry(date : Date, entry : FoodEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log nutrition entries");
    };

    let userNutrition = switch (nutritionLogs.get(caller)) {
      case (null) { Map.empty<Date, List.List<FoodEntry>>() };
      case (?logs) { logs };
    };

    let dayEntries = switch (userNutrition.get(date)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };
    dayEntries.add(entry);
    userNutrition.add(date, dayEntries);
    nutritionLogs.add(caller, userNutrition);
  };

  public query ({ caller }) func getNutritionEntries(date : Date) : async [FoodEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get nutrition entries");
    };

    switch (nutritionLogs.get(caller)) {
      case (null) { [] };
      case (?userLogs) {
        switch (userLogs.get(date)) {
          case (null) { [] };
          case (?entries) { entries.toArray().sort() };
        };
      };
    };
  };

  public shared ({ caller }) func logWaterIntake(intake : WaterIntake) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log water intake");
    };

    let userWaterLogs = switch (waterIntakeLogs.get(caller)) {
      case (null) { List.empty<WaterIntake>() };
      case (?logs) { logs };
    };
    userWaterLogs.add(intake);
    waterIntakeLogs.add(caller, userWaterLogs);
  };

  public shared ({ caller }) func logBodyMetric(metric : BodyMetric) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log body metrics");
    };

    let userBodyMetrics = switch (bodyMetricsLogs.get(caller)) {
      case (null) { List.empty<BodyMetric>() };
      case (?metrics) { metrics };
    };
    userBodyMetrics.add(metric);
    bodyMetricsLogs.add(caller, userBodyMetrics);
  };

  public shared ({ caller }) func setDailyGoals(goals : DailyGoals) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set daily goals");
    };
    dailyGoals.add(caller, goals);
  };

  public shared ({ caller }) func logSteps(steps : StepsLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log steps");
    };

    let userStepsLogs = switch (stepsLogs.get(caller)) {
      case (null) { List.empty<StepsLog>() };
      case (?logs) { logs };
    };
    userStepsLogs.add(steps);
    stepsLogs.add(caller, userStepsLogs);
  };

  public query ({ caller }) func getExerciseLibrary() : async [Exercise] {
    exerciseLibrary.toArray().sort();
  };

  public query ({ caller }) func getDailySummary(today : Date) : async DailySummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get daily summary");
    };

    let (totalCalories, totalProtein, totalCarbs, totalFat) = switch (nutritionLogs.get(caller)) {
      case (null) { (0, 0, 0, 0) };
      case (?userLogs) {
        switch (userLogs.get(today)) {
          case (null) { (0, 0, 0, 0) };
          case (?entries) {
            let foods = entries.toArray();
            var calories = 0;
            var protein = 0;
            var carbs = 0;
            var fat = 0;
            for (entry in foods.values()) {
              calories += entry.calories;
              protein += entry.protein;
              carbs += entry.carbs;
              fat += entry.fat;
            };
            (calories, protein, carbs, fat);
          };
        };
      };
    };

    let totalWaterMl = switch (waterIntakeLogs.get(caller)) {
      case (null) { 0 };
      case (?logs) {
        let dayLogs = logs.toArray().filter(func(intake) { Date.compare(intake.date, today) == #equal });
        var total = 0;
        for (intake in dayLogs.values()) {
          total += intake.amountMl;
        };
        total;
      };
    };

    let totalSteps = switch (stepsLogs.get(caller)) {
      case (null) { 0 };
      case (?logs) {
        let dayLogs = logs.toArray().filter(func(log) { Date.compare(log.date, today) == #equal });
        var total = 0;
        for (log in dayLogs.values()) {
          total += log.steps;
        };
        total;
      };
    };

    let latestWeight = switch (bodyMetricsLogs.get(caller)) {
      case (null) { null };
      case (?metrics) {
        let sortedMetrics = metrics.toArray().sort();
        if (sortedMetrics.size() > 0) {
          ?sortedMetrics[0].weightLbs;
        } else {
          null;
        };
      };
    };

    {
      totalCalories;
      totalProtein;
      totalCarbs;
      totalFat;
      totalWaterMl;
      totalSteps;
      latestWeight;
    };
  };
};
