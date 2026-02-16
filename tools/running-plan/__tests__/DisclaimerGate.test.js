const React = require("react");
const { fireEvent, render, screen } = require("@testing-library/react");
const { loadRunningPlanModules } = require("./testHelpers");

describe("DisclaimerGate", () => {
  beforeEach(() => {
    loadRunningPlanModules();
  });

  test("requires checkbox before accepting", () => {
    const onAccept = jest.fn();
    const onDecline = jest.fn();

    render(React.createElement(window.RunningPlan.DisclaimerGate, { onAccept, onDecline }));

    const acceptButton = screen.getByRole("button", { name: /accept and continue/i });
    expect(acceptButton).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox"));
    expect(acceptButton).toBeEnabled();

    fireEvent.click(acceptButton);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  test("can decline disclaimer", () => {
    const onAccept = jest.fn();
    const onDecline = jest.fn();

    render(React.createElement(window.RunningPlan.DisclaimerGate, { onAccept, onDecline }));

    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });
});
