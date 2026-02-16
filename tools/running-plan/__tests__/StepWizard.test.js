const React = require("react");
const { fireEvent, render, screen } = require("@testing-library/react");
const { loadRunningPlanModules } = require("./testHelpers");

describe("StepWizard", () => {
  beforeEach(() => {
    loadRunningPlanModules();
  });

  test("shows only current step input and supports edit callback", () => {
    const onEditStep = jest.fn();

    render(
      React.createElement(window.RunningPlan.StepWizard, {
        form: {
          eventDate: "2030-05-01",
          distance: "10k",
          expectedTime: "",
          trainingDaysPerWeek: "",
        },
        daysRemaining: 120,
        validationMessage: null,
        currentStep: 3,
        onEditStep,
        onDateChange: jest.fn(),
        onDistanceChange: jest.fn(),
        onExpectedTimeChange: jest.fn(),
        onTrainingDaysChange: jest.fn(),
        onGenerate: jest.fn(),
        canGenerate: false,
      })
    );

    expect(screen.getByText(/step 3: target time/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    expect(screen.getByText(/step 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit step 1/i }));
    expect(onEditStep).toHaveBeenCalledWith(1);
  });

  test("renders distance options from constants", () => {
    render(
      React.createElement(window.RunningPlan.StepWizard, {
        form: {
          eventDate: "2030-05-01",
          distance: "",
          expectedTime: "",
          trainingDaysPerWeek: "",
        },
        daysRemaining: 120,
        validationMessage: null,
        currentStep: 2,
        onEditStep: jest.fn(),
        onDateChange: jest.fn(),
        onDistanceChange: jest.fn(),
        onExpectedTimeChange: jest.fn(),
        onTrainingDaysChange: jest.fn(),
        onGenerate: jest.fn(),
        canGenerate: false,
      })
    );

    expect(screen.getByRole("option", { name: "10km" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Half marathon" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Full marathon" })).toBeInTheDocument();
  });
});
