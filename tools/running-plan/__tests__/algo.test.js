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
      expect(session.dateLabel).toMatch(/^\d{1,2} [A-Za-z]{3} \d{4}$/);
    });

    const eventDays = flattened.filter((session) => session.type === "EVENT DAY");
    expect(eventDays).toHaveLength(1);
    expect(eventDays[0].dateLabel).toBe(utils.formatDate(new Date(eventDateStr)));

    const taperSessions = flattened.filter((session) => session.isTaperWeek);
    expect(taperSessions.length).toBeGreaterThan(0);
    expect(
      taperSessions.some(
        (session) =>
          typeof session.description === "string" &&
          session.description.toLowerCase().includes("taper week")
      )
    ).toBe(true);
  });

  test("builds and parses share URLs with payload", () => {
    const utils = window.RunningPlan.utils;
    const payload = {
      v: 1,
      planName: "My sharable plan",
      form: {
        eventDate: "2030-05-01",
        distance: "10k",
        expectedTime: "1:05",
        trainingDaysPerWeek: "4",
      },
      plan: [[{ day: "Monday", dateLabel: "1 May 2030", type: "EVENT DAY", duration: 0 }]],
    };

    const shareUrl = utils.buildShareUrl(payload);
    expect(shareUrl.startsWith("https://igorcarreira.pt/tools/running-plan?params=")).toBe(true);

    const query = shareUrl.split("?")[1];
    const decoded = utils.getSharePayloadFromSearch(query);

    expect(decoded.planName).toBe(payload.planName);
    expect(decoded.form.distance).toBe("10k");
    expect(decoded.plan[0][0].type).toBe("EVENT DAY");
  });
});
