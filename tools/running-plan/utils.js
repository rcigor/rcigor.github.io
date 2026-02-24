window.RunningPlan = window.RunningPlan || {};

window.RunningPlan.utils = {
  DAY_NAMES: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  SHARE_TYPE_DICTIONARY: [
    "Rest Day",
    "Strength Training",
    "HIIT Indoor Cycling",
    "Long Indoor Cycling",
    "Outdoor Slow Run",
    "Outdoor Sprint Strides",
    "EVENT DAY",
  ],
  MONTH_DICTIONARY: {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  },

  getDistanceMeta(distanceValue) {
    return (
      (window.RunningPlan.DISTANCE_OPTIONS || []).find((d) => d.value === distanceValue) || null
    );
  },

  parseDateInput(dateStr) {
    const source = String(dateStr || "").trim();
    const match = source.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    if (Number.isNaN(parsed.getTime())) return null;
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  },

  parseDateLabel(dateLabel) {
    const source = String(dateLabel || "").trim();
    const match = source.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
    if (!match) return null;

    const day = Number(match[1]);
    const month = this.MONTH_DICTIONARY[match[2]];
    const year = Number(match[3]);

    if (month === undefined) return null;

    const parsed = new Date(year, month, day);
    if (Number.isNaN(parsed.getTime())) return null;
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month || parsed.getDate() !== day) {
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  },

  toDateInput(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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

    const eventDate = this.parseDateInput(dateStr);
    if (!eventDate) {
      return { daysRemaining: null, isPast: false };
    }

    const days = this.daysDiffByCalendar(today, eventDate);

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

  daysDiffByCalendar(startDate, endDate) {
    const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24));
  },

  toShareToken(value, dictionary) {
    const source = String(value || "");
    if (!source) return "";

    const index = Array.isArray(dictionary) ? dictionary.indexOf(source) : -1;
    return index >= 0 ? index : source;
  },

  fromShareToken(token, dictionary) {
    if (typeof token === "number" && Array.isArray(dictionary) && dictionary[token]) {
      return dictionary[token];
    }

    return token || "";
  },

  compactSession(session) {
    const source = session && typeof session === "object" ? session : {};
    const exerciseDictionary = window.RunningPlan.STRENGTH_EXERCISES || [];

    let durationValue = source.duration;
    if (durationValue === undefined || durationValue === null || durationValue === "") {
      durationValue = 0;
    } else if (typeof durationValue === "string" && /^\d+$/.test(durationValue.trim())) {
      durationValue = Number(durationValue.trim());
    }

    const compactExercises = Array.isArray(source.exercises)
      ? source.exercises
          .map((exercise) => this.toShareToken(exercise, exerciseDictionary))
          .filter((exercise) => exercise !== "")
      : [];

    const compactSession = [
      this.toShareToken(source.day, this.DAY_NAMES),
      source.dateLabel || "",
      this.toShareToken(source.type, this.SHARE_TYPE_DICTIONARY),
      durationValue,
      source.description || "",
      compactExercises.length > 0 ? compactExercises : "",
      source.isTaperWeek ? 1 : 0,
    ];

    while (compactSession.length > 0) {
      const tail = compactSession[compactSession.length - 1];
      if (tail === "" || tail === 0) {
        compactSession.pop();
      } else {
        break;
      }
    }

    return compactSession;
  },

  sessionsAreEqual(a, b) {
    return JSON.stringify(this.compactSession(a)) === JSON.stringify(this.compactSession(b));
  },

  expandSession(compactSession) {
    const source = Array.isArray(compactSession) ? compactSession : [];
    const exerciseDictionary = window.RunningPlan.STRENGTH_EXERCISES || [];

    const compactExercises = source[5];
    const exercises =
      Array.isArray(compactExercises) && compactExercises.length > 0
        ? compactExercises.map((exercise) => this.fromShareToken(exercise, exerciseDictionary))
        : null;

    return {
      day: this.fromShareToken(source[0], this.DAY_NAMES),
      dateLabel: source[1] || "",
      type: this.fromShareToken(source[2], this.SHARE_TYPE_DICTIONARY),
      duration: source.length > 3 ? source[3] : 0,
      description: source[4] || null,
      exercises,
      isTaperWeek: Boolean(source[6]),
    };
  },

  toCompactSharePayload(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const form = source.form && typeof source.form === "object" ? source.form : {};
    const plan = Array.isArray(source.plan) ? source.plan : [];
    const firstSession = plan[0] && plan[0][0] ? plan[0][0] : null;
    const startDate = firstSession ? this.parseDateLabel(firstSession.dateLabel) : null;
    const expectedTimeMinutes = this.parseExpectedTime(form.expectedTime || "");
    const canBuildBasePlan =
      Boolean(startDate) &&
      Boolean(form.eventDate) &&
      Boolean(form.trainingDaysPerWeek) &&
      Boolean(expectedTimeMinutes);

    if (canBuildBasePlan) {
      const basePlan = this.buildWeeklyPlan({
        eventDateStr: form.eventDate,
        expectedTimeMinutes,
        trainingDaysPerWeek: form.trainingDaysPerWeek,
        startDateStr: this.toDateInput(startDate),
      });

      if (Array.isArray(basePlan) && basePlan.length === plan.length) {
        const edits = [];
        let sameStructure = true;

        for (let weekIndex = 0; weekIndex < plan.length; weekIndex += 1) {
          const sourceWeek = Array.isArray(plan[weekIndex]) ? plan[weekIndex] : [];
          const baseWeek = Array.isArray(basePlan[weekIndex]) ? basePlan[weekIndex] : [];

          if (sourceWeek.length !== baseWeek.length) {
            sameStructure = false;
            break;
          }

          for (let dayIndex = 0; dayIndex < sourceWeek.length; dayIndex += 1) {
            if (!this.sessionsAreEqual(sourceWeek[dayIndex], baseWeek[dayIndex])) {
              edits.push([weekIndex, dayIndex, this.compactSession(sourceWeek[dayIndex])]);
            }
          }
        }

        if (sameStructure) {
          return {
            v: 3,
            n: source.planName || "",
            f: [
              form.eventDate || "",
              form.distance || "",
              form.expectedTime || "",
              form.trainingDaysPerWeek || "",
              this.toDateInput(startDate),
            ],
            e: edits,
          };
        }
      }
    }

    return {
      v: 2,
      n: source.planName || "",
      f: [
        form.eventDate || "",
        form.distance || "",
        form.expectedTime || "",
        form.trainingDaysPerWeek || "",
      ],
      p: Array.isArray(source.plan)
        ? source.plan.map((week) =>
            Array.isArray(week) ? week.map((session) => this.compactSession(session)) : []
          )
        : [],
    };
  },

  fromCompactSharePayload(payload) {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    if (payload.v === 3) {
      const form = Array.isArray(payload.f) ? payload.f : [];
      const baseForm = {
        eventDate: form[0] || "",
        distance: form[1] || "",
        expectedTime: form[2] || "",
        trainingDaysPerWeek: form[3] || "",
      };
      const startDateStr = form[4] || "";
      const expectedTimeMinutes = this.parseExpectedTime(baseForm.expectedTime);

      if (!startDateStr || !expectedTimeMinutes || !baseForm.trainingDaysPerWeek) {
        return null;
      }

      const basePlan = this.buildWeeklyPlan({
        eventDateStr: baseForm.eventDate,
        expectedTimeMinutes,
        trainingDaysPerWeek: baseForm.trainingDaysPerWeek,
        startDateStr,
      });

      const edits = Array.isArray(payload.e) ? payload.e : [];
      edits.forEach((edit) => {
        if (!Array.isArray(edit) || edit.length < 3) return;
        const weekIndex = Number(edit[0]);
        const dayIndex = Number(edit[1]);
        const session = this.expandSession(edit[2]);

        if (
          Number.isNaN(weekIndex) ||
          Number.isNaN(dayIndex) ||
          !basePlan[weekIndex] ||
          !basePlan[weekIndex][dayIndex]
        ) {
          return;
        }

        basePlan[weekIndex][dayIndex] = session;
      });

      return {
        v: 3,
        planName: payload.n || "",
        form: baseForm,
        plan: basePlan,
      };
    }

    if (payload.v !== 2 || !Array.isArray(payload.p)) return null;

    const form = Array.isArray(payload.f) ? payload.f : [];

    return {
      v: 2,
      planName: payload.n || "",
      form: {
        eventDate: form[0] || "",
        distance: form[1] || "",
        expectedTime: form[2] || "",
        trainingDaysPerWeek: form[3] || "",
      },
      plan: payload.p.map((week) =>
        Array.isArray(week) ? week.map((session) => this.expandSession(session)) : []
      ),
    };
  },

  encodeBase64Url(value) {
    const raw = String(value || "");
    let base64 = "";

    if (typeof btoa === "function") {
      base64 = btoa(unescape(encodeURIComponent(raw)));
    } else if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(raw, "utf8").toString("base64");
    } else {
      return "";
    }

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  },

  decodeBase64Url(value) {
    try {
      let normalized = String(value || "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      while (normalized.length % 4 !== 0) {
        normalized += "=";
      }

      if (typeof atob === "function") {
        return decodeURIComponent(escape(atob(normalized)));
      }

      if (typeof Buffer !== "undefined") {
        return Buffer.from(normalized, "base64").toString("utf8");
      }

      return "";
    } catch (_error) {
      return "";
    }
  },

  encodeSharePayload(payload) {
    try {
      const compactPayload = this.toCompactSharePayload(payload);
      const json = JSON.stringify(compactPayload);
      return this.encodeBase64Url(json);
    } catch (_error) {
      return "";
    }
  },

  decodeSharePayload(encodedPayload) {
    try {
      const decoded = this.decodeBase64Url(encodedPayload);
      if (!decoded) return null;

      const parsed = JSON.parse(decoded);
      return this.fromCompactSharePayload(parsed);
    } catch (_error) {
      return null;
    }
  },

  buildShareUrl(payload) {
    const encoded = this.encodeSharePayload(payload);
    if (!encoded) return "";

    return `${window.RunningPlan.SHARE_BASE_URL}#params=${encodeURIComponent(encoded)}`;
  },

  getSharePayloadFromHash(hash) {
    const source = String(hash || "");
    if (!source || !source.startsWith("#")) return null;

    const query = source.slice(1);
    const params = new URLSearchParams(query);
    const encoded = params.get("params");

    if (!encoded) return null;

    return this.decodeSharePayload(encoded);
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

  buildWeeklyPlan({
    eventDateStr,
    daysRemaining,
    expectedTimeMinutes,
    trainingDaysPerWeek,
    startDateStr,
  }) {
    const today = startDateStr ? this.parseDateInput(startDateStr) : null;
    const startDay = today || new Date();
    startDay.setHours(0, 0, 0, 0);

    const eventDate = eventDateStr ? this.parseDateInput(eventDateStr) : null;

    let totalDays;
    if (eventDate && !Number.isNaN(eventDate.getTime())) {
      totalDays = this.daysDiffByCalendar(startDay, eventDate) + 1;
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

      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + dayOffset);

      const dayName = this.DAY_NAMES[currentDate.getDay()];
      const daysUntilRace = totalDays - dayOffset - 1;
      const isTaperWeek = daysUntilRace > 0 && daysUntilRace <= 7;

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
          isTaperWeek: false,
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
          description: isTaperWeek ? "Taper week recovery" : null,
          exercises: null,
          isTaperWeek,
        });
        continue;
      }

      let duration = 0;
      let description = null;
      let exercises = null;

      if (sessionConfig.type === "Strength Training") {
        if (isTaperWeek) {
          exercises = window.RunningPlan.STRENGTH_EXERCISES.slice(0, 4);
          description = "Light mobility and activation (taper week)";
        } else {
          exercises = window.RunningPlan.STRENGTH_EXERCISES;
        }
      } else if (sessionConfig.type === "HIIT Indoor Cycling") {
        duration = isTaperWeek ? Math.max(20, Math.round(hiitDuration * 0.6)) : hiitDuration;
        description = isTaperWeek
          ? "Reduced intensity intervals (taper week)"
          : "High Intensity Interval Training";
      } else if (sessionConfig.type === "Long Indoor Cycling") {
        const variability = (weekIndex * 17 + dayOffset * 13) % 11;
        const baseDuration = Math.round((60 + variability) * intensityFactor);
        duration = isTaperWeek ? Math.max(30, Math.round(baseDuration * 0.6)) : baseDuration;
        description = isTaperWeek ? "Steady easy ride (taper week)" : "Steady long ride";
      } else if (sessionConfig.type === "Outdoor Slow Run") {
        if (isTaperWeek) {
          duration = Math.max(20, Math.round(slowRunDuration * 0.5));
          description = "Easy pace (taper week)";
        } else if (daysUntilRace <= 14) {
          duration = Math.max(25, Math.round(slowRunDuration * 0.75));
          description = "Easy pace (pre-taper)";
        } else {
          duration = slowRunDuration;
          description = "Easy pace";
        }
      } else if (sessionConfig.type === "Outdoor Sprint Strides") {
        description = isTaperWeek
          ? "4 x 100m relaxed strides (taper week)"
          : "6 x 200m, rest 2 mins in between";
      }

      plan[weekIndex].push({
        day: dayName,
        dateLabel: this.formatDate(currentDate),
        type: sessionConfig.type,
        duration,
        description,
        exercises,
        isTaperWeek,
      });
    }

    return plan;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.RunningPlan.utils;
}
