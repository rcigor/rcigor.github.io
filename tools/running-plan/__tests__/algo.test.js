const { loadRunningPlanModules } = require("./testHelpers");

describe("running-plan utils", () => {
  beforeEach(() => {
    loadRunningPlanModules();
  });

  test("builds weekly plan with expected structure for valid inputs", () => {
    const utils = window.RunningPlan.utils;
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 35);
    const eventDateStr = eventDate.toISOString().split("T")[0];

    const plan = utils.buildWeeklyPlan({
      eventDateStr,
      expectedTimeMinutes: 100,
      trainingDaysPerWeek: "4",
    });

    const flattened = plan.flat();

    expect(plan).toHaveLength(6);
    expect(flattened).toHaveLength(36);
    expect(plan[0]).toHaveLength(7);
    expect(plan[plan.length - 1].length).toBeGreaterThan(0);

    flattened.forEach((session) => {
      expect(session.day).toBeTruthy();
      expect(session.dateLabel).toMatch(/^\\d{1,2} [A-Za-z]{3} \\d{4}$/);
    });

    const eventDays = flattened.filter((session) => session.type === "EVENT DAY");
    expect(eventDays).toHaveLength(1);
    expect(eventDays[0].dateLabel).toBe(utils.formatDate(new Date(eventDateStr)));
  });
});
