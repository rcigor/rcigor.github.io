const React = require("react");
const { fireEvent, render, screen } = require("@testing-library/react");
const { loadRunningPlanModules } = require("./testHelpers");

describe("MarathonPrepBuilderApp", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("shows disclaimer first and allows accept flow", () => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();

    render(React.createElement(MarathonPrepBuilderApp));

    expect(screen.getByText(/important health and safety disclaimer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /accept and continue/i }));

    expect(screen.getByText(/you accepted to use this at your own risk/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1: event date/i)).toBeInTheDocument();
  });

  test("shows time travel and ambitious plan messages", () => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();

    render(React.createElement(MarathonPrepBuilderApp));

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /accept and continue/i }));

    const dateInput = screen.getByLabelText(/when is your running event/i);
    fireEvent.change(dateInput, { target: { value: "2000-01-01" } });

    expect(screen.getByText(/good luck time travelling/i)).toBeInTheDocument();

    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 10);
    const soonDateStr = soonDate.toISOString().split("T")[0];

    fireEvent.change(dateInput, { target: { value: soonDateStr } });
    fireEvent.change(screen.getByLabelText(/choose your distance/i), { target: { value: "full" } });

    expect(screen.getByText(/we can't generate that ambitious a plan/i)).toBeInTheDocument();
  });

  test("redirects to tools index when disclaimer is declined", () => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();
    const navigateMock = jest.fn();
    window.__RUNNING_PLAN_NAVIGATE__ = navigateMock;

    render(React.createElement(MarathonPrepBuilderApp));
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));

    expect(navigateMock).toHaveBeenCalledWith("index.html");
    delete window.__RUNNING_PLAN_NAVIGATE__;
  });

  test("loads shared plan from URL params and renders it directly", () => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();
    const sharedPayload = {
      v: 1,
      planName: "Shared Test Plan",
      form: {
        eventDate: "2030-05-01",
        distance: "10k",
        expectedTime: "1:05",
        trainingDaysPerWeek: "4",
      },
      plan: [[{ day: "Monday", dateLabel: "1 May 2030", type: "EVENT DAY", duration: 0 }]],
    };

    const shareUrl = window.RunningPlan.utils.buildShareUrl(sharedPayload);
    const search = shareUrl.includes("?") ? `?${shareUrl.split("?")[1]}` : "";
    window.history.pushState({}, "", `/${search}`);

    render(React.createElement(MarathonPrepBuilderApp));

    expect(screen.getByText("Shared Test Plan")).toBeInTheDocument();
    expect(screen.getByText(/event day/i)).toBeInTheDocument();
    expect(screen.queryByText(/important health and safety disclaimer/i)).not.toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });
});
