window.RunningPlan = window.RunningPlan || {};

const { useMemo, useState } = React;

function MarathonPrepBuilderApp() {
  const [disclaimerStatus, setDisclaimerStatus] = useState("pending");
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    eventDate: "",
    distance: "",
    expectedTime: "",
    trainingDaysPerWeek: "",
  });

  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState(null);

  const dateInfo = useMemo(
    () => window.RunningPlan.utils.getDaysRemaining(form.eventDate),
    [form.eventDate]
  );

  const validationMessage = useMemo(
    () =>
      window.RunningPlan.utils.getValidationMessage({
        dateStr: form.eventDate,
        distanceValue: form.distance,
      }),
    [form.eventDate, form.distance]
  );

  const expectedTimeMinutes = useMemo(
    () => window.RunningPlan.utils.parseExpectedTime(form.expectedTime),
    [form.expectedTime]
  );

  const distanceMeta = useMemo(
    () => window.RunningPlan.utils.getDistanceMeta(form.distance),
    [form.distance]
  );

  const canGenerate = Boolean(
    form.eventDate &&
    form.distance &&
    form.trainingDaysPerWeek &&
    expectedTimeMinutes &&
    !validationMessage &&
    dateInfo.daysRemaining !== null &&
    dateInfo.daysRemaining >= 0
  );

  const resetAfterStep = (step) => {
    setPlan(null);
    setPlanError(null);

    setForm((prev) => {
      if (step === 1) {
        return {
          eventDate: prev.eventDate,
          distance: "",
          expectedTime: "",
          trainingDaysPerWeek: "",
        };
      }

      if (step === 2) {
        return { ...prev, expectedTime: "", trainingDaysPerWeek: "" };
      }

      if (step === 3) {
        return { ...prev, trainingDaysPerWeek: "" };
      }

      return prev;
    });
  };

  const handleDateChange = (value) => {
    setForm((prev) => ({ ...prev, eventDate: value }));
    resetAfterStep(1);

    const dateValidation = window.RunningPlan.utils.getValidationMessage({
      dateStr: value,
      distanceValue: "",
    });
    if (value && !dateValidation) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleDistanceChange = (value) => {
    setForm((prev) => ({ ...prev, distance: value }));
    resetAfterStep(2);

    const nextValidation = window.RunningPlan.utils.getValidationMessage({
      dateStr: form.eventDate,
      distanceValue: value,
    });
    if (value && !nextValidation) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleExpectedTimeChange = (value) => {
    setForm((prev) => ({ ...prev, expectedTime: value }));
    resetAfterStep(3);

    if (window.RunningPlan.utils.parseExpectedTime(value)) {
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  };

  const handleTrainingDaysChange = (value) => {
    setForm((prev) => ({ ...prev, trainingDaysPerWeek: value }));
    setPlan(null);
    setPlanError(null);

    if (value) {
      setCurrentStep(5);
    } else {
      setCurrentStep(4);
    }
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
    resetAfterStep(step);
  };

  const handleGeneratePlan = () => {
    if (validationMessage) {
      setPlan(null);
      setPlanError(validationMessage);
      return;
    }

    if (!canGenerate) {
      return;
    }

    if (!distanceMeta || dateInfo.daysRemaining < distanceMeta.minDays) {
      setPlan(null);
      setPlanError(window.RunningPlan.AMBITIOUS_PLAN_MSG);
      return;
    }

    const generated = window.RunningPlan.utils.buildWeeklyPlan({
      eventDateStr: form.eventDate,
      expectedTimeMinutes,
      trainingDaysPerWeek: form.trainingDaysPerWeek,
    });

    setPlan(generated);
    setPlanError(null);
  };

  const handleStartOver = () => {
    setPlan(null);
    setPlanError(null);
    setCurrentStep(1);
    setForm({ eventDate: "", distance: "", expectedTime: "", trainingDaysPerWeek: "" });
  };

  if (disclaimerStatus === "declined") {
    return null;
  }

  if (disclaimerStatus === "pending") {
    return (
      <window.RunningPlan.DisclaimerGate
        onAccept={() => setDisclaimerStatus("accepted")}
        onDecline={() => setDisclaimerStatus("declined")}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[800px] text-left">
      <a
        href="index.html"
        className="mb-8 inline-flex items-center gap-2 text-[1.2em] text-[#444] no-underline print:hidden"
      >
        <img
          src="../back-arrow.svg"
          alt="Back"
          width="20"
          height="20"
          className="[filter:invert(26%)_sepia(48%)_saturate(603%)_hue-rotate(122deg)_brightness(97%)_contrast(101%)]"
        />{" "}
        Back
      </a>

      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        {window.RunningPlan.RISK_ACCEPTED_BANNER}
      </div>

      <header className="mb-8">
        <h1 className="mb-2 text-5xl font-bold text-brand">Marathon Prep Builder</h1>
        <p className="m-0 text-[1.2em] text-[#444]">Plan your training schedule</p>
      </header>

      {!plan && (
        <window.RunningPlan.StepWizard
          form={form}
          daysRemaining={dateInfo.daysRemaining}
          validationMessage={validationMessage}
          currentStep={currentStep}
          onEditStep={handleEditStep}
          onDateChange={handleDateChange}
          onDistanceChange={handleDistanceChange}
          onExpectedTimeChange={handleExpectedTimeChange}
          onTrainingDaysChange={handleTrainingDaysChange}
          onGenerate={handleGeneratePlan}
          canGenerate={canGenerate}
        />
      )}

      {planError && !plan && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          {planError}
        </div>
      )}

      {plan && (
        <window.RunningPlan.PlanResults
          plan={plan}
          distanceLabel={distanceMeta ? distanceMeta.label : "Race"}
          expectedTime={form.expectedTime}
          daysRemaining={dateInfo.daysRemaining}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

window.RunningPlan.MarathonPrepBuilderApp = MarathonPrepBuilderApp;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MarathonPrepBuilderApp };
}

if (typeof document !== "undefined") {
  const rootElement = document.getElementById("root");
  if (rootElement && typeof ReactDOM !== "undefined") {
    ReactDOM.render(<MarathonPrepBuilderApp />, rootElement);
  }
}
