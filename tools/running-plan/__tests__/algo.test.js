const { loadRunningPlanModules } = require("./testHelpers");

describe("running-plan utils", () => {
  beforeEach(() => {
    loadRunningPlanModules();
  });

  test("builds weekly plan with expected structure for valid inputs", () => {
    const utils = window.RunningPlan.utils;

    const plan = utils.buildWeeklyPlan({
      daysRemaining: 35,
      expectedTimeMinutes: 100,
      trainingDaysPerWeek: "4",
    });

    expect(plan).toHaveLength(5);

    plan.forEach((week) => {
      expect(week).toHaveLength(7);
    });

    const week1 = plan[0];
    expect(week1[0]).toMatchObject({ day: "Monday" });
    expect(week1[6]).toMatchObject({ day: "Sunday" });
    expect(week1.some((session) => session.type === "Strength Training")).toBe(true);
    expect(week1.some((session) => session.type === "Rest Day")).toBe(true);
  });
});
