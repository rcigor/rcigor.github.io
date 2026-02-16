window.RunningPlan = window.RunningPlan || {};

window.RunningPlan.utils = {
  DAY_NAMES: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

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

  formatDate(date) {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  isSameCalendarDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
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

  buildWeeklyPlan({ eventDateStr, daysRemaining, expectedTimeMinutes, trainingDaysPerWeek }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = eventDateStr ? new Date(eventDateStr) : null;
    if (eventDate) {
      eventDate.setHours(0, 0, 0, 0);
    }

    let totalDays;
    if (eventDate && !Number.isNaN(eventDate.getTime())) {
      totalDays = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24)) + 1;
    } else if (typeof daysRemaining === "number") {
      totalDays = daysRemaining + 1;
    } else {
      totalDays = 0;
    }

    if (totalDays <= 0) {
      return [];
    }

    const totalWeeks = Math.ceil(totalDays / 7);
    const trainingDays = Number(trainingDaysPerWeek);
    const plan = [];

    const minSlowRunDuration = Math.round(expectedTimeMinutes * 0.3);
    const maxSlowRunDuration = expectedTimeMinutes;

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
      const weekIndex = Math.floor(dayOffset / 7);
      if (!plan[weekIndex]) {
        plan[weekIndex] = [];
      }

      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      const dayName = this.DAY_NAMES[currentDate.getDay()];
      const daysUntilRace = totalDays - dayOffset - 1;
      const weeksUntilRace = Math.ceil((daysUntilRace + 1) / 7);

      const intensityFactor = 1 + (weekIndex / Math.max(totalWeeks, 1)) * 0.5;
      const hiitDuration = 30 + weekIndex * 5;
      const slowRunDuration =
        minSlowRunDuration +
        Math.round(
          (maxSlowRunDuration - minSlowRunDuration) * (weekIndex / Math.max(totalWeeks - 1, 1))
        );

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

      if (eventDate && this.isSameCalendarDay(currentDate, eventDate)) {
        plan[weekIndex].push({
          day: dayName,
          dateLabel: this.formatDate(currentDate),
          type: "EVENT DAY",
          duration: 0,
          description: null,
          exercises: null,
        });
        continue;
      }

      const sessionConfig = sessionConfigs.find((s) => s.day === dayName);

      if (!sessionConfig) {
        plan[weekIndex].push({
          day: dayName,
          dateLabel: this.formatDate(currentDate),
          type: "Rest Day",
          duration: 0,
          description: null,
          exercises: null,
        });
        continue;
      }

      if (sessionConfig.type === "Outdoor Slow Run" && weeksUntilRace <= 2) {
        plan[weekIndex].push({
          day: dayName,
          dateLabel: this.formatDate(currentDate),
          type: "Rest Day",
          duration: 0,
          description: null,
          exercises: null,
        });
        continue;
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

      plan[weekIndex].push({
        day: dayName,
        dateLabel: this.formatDate(currentDate),
        type: sessionConfig.type,
        duration,
        description,
        exercises,
      });
    }

    return plan;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.RunningPlan.utils;
}
