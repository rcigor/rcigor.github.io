window.RunningPlan = window.RunningPlan || {};

window.RunningPlan.utils = {
  getDistanceMeta(distanceValue) {
    return (
      (window.RunningPlan.DISTANCE_OPTIONS || []).find((d) => d.value === distanceValue) || null
    );
  },

  parseExpectedTime(timeStr) {
    const match = String(timeStr || "")
      .trim()
      .match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) return null;

    return hours * 60 + minutes;
  },

  getDaysRemaining(dateStr) {
    if (!dateStr) {
      return { daysRemaining: null, isPast: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    const diffMs = eventDate - today;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: days,
      isPast: days < 0,
    };
  },

  getValidationMessage({ dateStr, distanceValue }) {
    const { daysRemaining, isPast } = this.getDaysRemaining(dateStr);

    if (dateStr && isPast) {
      return window.RunningPlan.TIME_TRAVEL_MSG;
    }

    if (!distanceValue || daysRemaining === null || isPast) {
      return null;
    }

    const distance = this.getDistanceMeta(distanceValue);
    if (!distance) {
      return null;
    }

    if (daysRemaining < distance.minDays) {
      return window.RunningPlan.AMBITIOUS_PLAN_MSG;
    }

    return null;
  },

  buildWeeklyPlan({ daysRemaining, expectedTimeMinutes, trainingDaysPerWeek }) {
    const totalWeeks = Math.floor(daysRemaining / 7);
    const trainingDays = Number(trainingDaysPerWeek);
    const plan = [];

    const minSlowRunDuration = Math.round(expectedTimeMinutes * 0.3);
    const maxSlowRunDuration = expectedTimeMinutes;

    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (let w = 0; w < totalWeeks; w += 1) {
      const week = [];
      const intensityFactor = 1 + (w / Math.max(totalWeeks, 1)) * 0.5;
      const weeksUntilRace = totalWeeks - w;

      const hiitDuration = 30 + w * 5;
      const slowRunDuration =
        minSlowRunDuration +
        Math.round((maxSlowRunDuration - minSlowRunDuration) * (w / Math.max(totalWeeks - 1, 1)));

      let sessionConfigs = [];

      if (trainingDays === 3) {
        sessionConfigs = [
          { type: "Strength Training", day: "Monday" },
          { type: "HIIT Indoor Cycling", day: "Wednesday" },
          { type: "Outdoor Slow Run", day: "Saturday" },
        ];
      } else if (trainingDays === 4) {
        sessionConfigs = [
          { type: "Strength Training", day: "Monday" },
          { type: "HIIT Indoor Cycling", day: "Tuesday" },
          { type: "Outdoor Slow Run", day: "Thursday" },
          { type: "Outdoor Sprint Strides", day: "Saturday" },
        ];
      } else if (trainingDays === 5) {
        sessionConfigs = [
          { type: "Strength Training", day: "Monday" },
          { type: "Long Indoor Cycling", day: "Tuesday" },
          { type: "HIIT Indoor Cycling", day: "Wednesday" },
          { type: "Outdoor Slow Run", day: "Thursday" },
          { type: "Outdoor Sprint Strides", day: "Saturday" },
        ];
      } else if (trainingDays === 6) {
        sessionConfigs = [
          { type: "Strength Training", day: "Monday" },
          { type: "Long Indoor Cycling", day: "Tuesday" },
          { type: "HIIT Indoor Cycling", day: "Wednesday" },
          { type: "Outdoor Slow Run", day: "Thursday" },
          { type: "HIIT Indoor Cycling", day: "Friday" },
          { type: "Outdoor Sprint Strides", day: "Saturday" },
        ];
      }

      allDays.forEach((day) => {
        const sessionConfig = sessionConfigs.find((s) => s.day === day);

        if (!sessionConfig) {
          week.push({ day, type: "Rest Day", duration: 0, description: null, exercises: null });
          return;
        }

        if (sessionConfig.type === "Outdoor Slow Run" && weeksUntilRace <= 2) {
          week.push({ day, type: "Rest Day", duration: 0, description: null, exercises: null });
          return;
        }

        let duration = 0;
        let description = null;
        let exercises = null;

        if (sessionConfig.type === "Strength Training") {
          exercises = window.RunningPlan.STRENGTH_EXERCISES;
        } else if (sessionConfig.type === "HIIT Indoor Cycling") {
          duration = hiitDuration;
          description = "High Intensity Interval Training";
        } else if (sessionConfig.type === "Long Indoor Cycling") {
          duration = Math.round((60 + Math.random() * 10) * intensityFactor);
          description = "Steady long ride";
        } else if (sessionConfig.type === "Outdoor Slow Run") {
          duration = weeksUntilRace === 1 ? Math.round(slowRunDuration * 0.75) : slowRunDuration;
          description = "Easy pace";
        } else if (sessionConfig.type === "Outdoor Sprint Strides") {
          description = "6 x 200m, rest 2 mins in between";
        }

        week.push({ day, type: sessionConfig.type, duration, description, exercises });
      });

      plan.push(week);
    }

    return plan;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.RunningPlan.utils;
}
