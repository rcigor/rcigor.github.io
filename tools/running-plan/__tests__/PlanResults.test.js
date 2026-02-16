const React = require("react");
const { fireEvent, render, screen } = require("@testing-library/react");
const { loadRunningPlanModules } = require("./testHelpers");

describe("PlanResults", () => {
  beforeEach(() => {
    loadRunningPlanModules();
    window.print = jest.fn();
  });

  test("prints and restarts", () => {
    const onStartOver = jest.fn();

    render(
      React.createElement(window.RunningPlan.PlanResults, {
        plan: [
          [{ day: "Monday", type: "Rest Day", duration: 0, description: null, exercises: null }],
        ],
        distanceLabel: "10km",
        expectedTime: "1:00",
        daysRemaining: 40,
        onStartOver,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /print plan/i }));
    expect(window.print).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /start over/i }));
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });
});
