window.RunningPlan = window.RunningPlan || {};

const { useMemo, useState } = React;

function MarathonPrepBuilderApp() {
  const [sharedPayload] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.RunningPlan.utils.getSharePayloadFromHash(window.location.hash);
  });

  const hasSharedPlan = Boolean(
    sharedPayload && sharedPayload.plan && Array.isArray(sharedPayload.plan)
  );

  const [disclaimerStatus, setDisclaimerStatus] = useState("pending");
  const [currentStep, setCurrentStep] = useState(hasSharedPlan ? 5 : 1);

  const [form, setForm] = useState(() => ({
    eventDate: "",
    distance: "",
    expectedTime: "",
    trainingDaysPerWeek: "",
    ...(sharedPayload && sharedPayload.form ? sharedPayload.form : {}),
  }));

  const [planName, setPlanName] = useState(() =>
    sharedPayload && sharedPayload.planName ? sharedPayload.planName : ""
  );

  const [plan, setPlan] = useState(hasSharedPlan ? sharedPayload.plan : null);
  const [planError, setPlanError] = useState(null);
  const [copyStatus, setCopyStatus] = useState("idle");

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

  const shareUrl = useMemo(() => {
    if (!plan) return "";

    const fallbackName = distanceMeta
      ? `${distanceMeta.label} plan (${form.eventDate || "undated"})`
      : "Running plan";

    return window.RunningPlan.utils.buildShareUrl({
      v: 1,
      planName: planName || fallbackName,
      form,
      plan,
    });
  }, [plan, planName, form, distanceMeta]);

  const resetAfterStep = (step) => {
    setPlan(null);
    setPlanError(null);
    setCopyStatus("idle");

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
    setCopyStatus("idle");

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
    setCopyStatus("idle");

    if (!planName && distanceMeta) {
      setPlanName(`${distanceMeta.label} plan (${form.eventDate})`);
    }
  };

  const handleUpdateSession = (weekIndex, dayIndex, patch) => {
    setPlan((prevPlan) => {
      if (!Array.isArray(prevPlan)) return prevPlan;

      return prevPlan.map((week, wi) => {
        if (wi !== weekIndex) return week;

        return week.map((session, di) => {
          if (di !== dayIndex) return session;
          return { ...session, ...patch };
        });
      });
    });

    setCopyStatus("idle");
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        if (typeof window !== "undefined") {
          window.prompt("Copy this URL:", shareUrl);
        }
      }

      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (_error) {
      setCopyStatus("idle");
    }
  };

  const handleStartOver = () => {
    setPlan(null);
    setPlanError(null);
    setCurrentStep(1);
    setPlanName("");
    setCopyStatus("idle");
    setForm({ eventDate: "", distance: "", expectedTime: "", trainingDaysPerWeek: "" });
  };

  const navigateToToolsIndex = () => {
    if (typeof window === "undefined") return;

    if (typeof window.__RUNNING_PLAN_NAVIGATE__ === "function") {
      window.__RUNNING_PLAN_NAVIGATE__("index.html");
      return;
    }

    if (window.location && typeof window.location.assign === "function") {
      window.location.assign("index.html");
    }
  };

  if (disclaimerStatus === "pending") {
    return (
      <window.RunningPlan.DisclaimerGate
        onAccept={() => setDisclaimerStatus("accepted")}
        onDecline={navigateToToolsIndex}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[900px] text-left">
      <a
        href="index.html"
        className="mb-8 inline-flex items-center gap-2 text-[1.2em] text-[#444] no-underline print:hidden"
      >
        <img src="../back-arrow.svg" alt="Back" width="20" height="20" className="opacity-70" />{" "}
        Back
      </a>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        {window.RunningPlan.RISK_ACCEPTED_BANNER}
      </div>

      <header className="mb-8">
        <h1 className="mb-2 text-5xl font-bold text-ink">Event-Day Run Planner</h1>
        <p className="m-0 text-[1.2em] text-[#444]">Plan your running event</p>
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
          planName={planName}
          onPlanNameChange={(value) => {
            setPlanName(value);
            setCopyStatus("idle");
          }}
          onUpdateSession={handleUpdateSession}
          shareUrl={shareUrl}
          onCopyShareUrl={handleCopyShareUrl}
          copyStatus={copyStatus}
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
