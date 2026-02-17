const React = require("react");
const { fireEvent, render, screen } = require("@testing-library/react");
const { loadRunningPlanModules } = require("./testHelpers");

function formatDateWithOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function acceptDisclaimer() {
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /accept and continue/i }));
}

describe("Marathon builder acceptance flow", () => {
  test.each([
    { distance: "10k", minDays: 28 },
    { distance: "half", minDays: 42 },
    { distance: "full", minDays: 90 },
  ])("blocks plan when prep time is below minimum for $distance", ({ distance, minDays }) => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();
    render(React.createElement(MarathonPrepBuilderApp));

    acceptDisclaimer();

    fireEvent.change(screen.getByLabelText(/when is your running event/i), {
      target: { value: formatDateWithOffset(minDays - 1) },
    });

    fireEvent.change(screen.getByLabelText(/choose your distance/i), {
      target: { value: distance },
    });

    expect(screen.getByText(/we can't generate that ambitious a plan/i)).toBeInTheDocument();
  });

  test("generates a plan for valid inputs through step-by-step flow", () => {
    const { MarathonPrepBuilderApp } = loadRunningPlanModules();
    render(React.createElement(MarathonPrepBuilderApp));

    acceptDisclaimer();

    fireEvent.change(screen.getByLabelText(/when is your running event/i), {
      target: { value: formatDateWithOffset(40) },
    });

    fireEvent.change(screen.getByLabelText(/choose your distance/i), {
      target: { value: "10k" },
    });

    fireEvent.change(screen.getByLabelText(/expected finish time/i), {
      target: { value: "1:05" },
    });

    fireEvent.change(screen.getByLabelText(/how many days per week will you train/i), {
      target: { value: "4" },
    });

    fireEvent.click(screen.getByRole("button", { name: /generate training plan/i }));

    expect(screen.getByText(/10km plan/i)).toBeInTheDocument();
    expect(screen.getByText(/week 1/i)).toBeInTheDocument();
    expect(screen.getByText(/event day/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print plan/i })).toBeInTheDocument();
  });
});
