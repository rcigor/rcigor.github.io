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

  test("edits one selected day at a time using the side editor", () => {
    const StatefulWrapper = () => {
      const [plan, setPlan] = React.useState([
        [
          {
            day: "Monday",
            dateLabel: "10 Mar 2026",
            type: "Rest Day",
            duration: 0,
            description: null,
            exercises: null,
          },
          {
            day: "Tuesday",
            dateLabel: "11 Mar 2026",
            type: "Outdoor Slow Run",
            duration: 35,
            description: "Easy pace",
            exercises: null,
          },
        ],
      ]);

      return React.createElement(window.RunningPlan.PlanResults, {
        plan,
        distanceLabel: "10km",
        expectedTime: "1:00",
        daysRemaining: 40,
        onStartOver: jest.fn(),
        planName: "Test plan",
        onPlanNameChange: jest.fn(),
        onCopyShareUrl: jest.fn(),
        onUpdateSession: (weekIndex, dayIndex, patch) =>
          setPlan((prevPlan) =>
            prevPlan.map((week, wi) =>
              wi !== weekIndex
                ? week
                : week.map((session, di) => (di !== dayIndex ? session : { ...session, ...patch }))
            )
          ),
      });
    };

    render(React.createElement(StatefulWrapper));

    fireEvent.click(screen.getByRole("button", { name: /enable edit mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit monday/i }));

    expect(screen.getByText(/edit training day/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/session type/i), {
      target: { value: "Custom Tempo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /close editor/i }));

    expect(screen.getByText(/custom tempo/i)).toBeInTheDocument();
    expect(screen.getByText(/outdoor slow run/i)).toBeInTheDocument();
  });
});
