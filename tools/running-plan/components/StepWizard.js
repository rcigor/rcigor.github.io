window.RunningPlan = window.RunningPlan || {};

const StepWizard = function StepWizard({
  form,
  daysRemaining,
  validationMessage,
  currentStep,
  onEditStep,
  onDateChange,
  onDistanceChange,
  onExpectedTimeChange,
  onTrainingDaysChange,
  onGenerate,
  canGenerate,
}) {
  const distanceMeta = window.RunningPlan.utils.getDistanceMeta(form.distance);

  const StepSummary = ({ step, label, value }) => (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Step {step}</div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-sm text-gray-700">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onEditStep(step)}
        className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 transition hover:bg-gray-100"
        aria-label={`Edit step ${step}`}
      >
        ✎
      </button>
    </div>
  );

  return (
    <div>
      {currentStep > 1 ? (
        <StepSummary
          step={1}
          label="Event date"
          value={`${form.eventDate} (${daysRemaining} days to go)`}
        />
      ) : (
        <section className="mb-8 rounded-lg border border-gray-200 p-5">
          <h2 className="mb-3 text-lg font-bold text-brand">Step 1: Event date</h2>
          <label htmlFor="eventDate" className="mb-2 block text-sm font-semibold text-brand">
            When is your running event?
          </label>
          <input
            type="date"
            id="eventDate"
            value={form.eventDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-base"
          />
        </section>
      )}

      {validationMessage === window.RunningPlan.TIME_TRAVEL_MSG && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          {window.RunningPlan.TIME_TRAVEL_MSG}
        </div>
      )}

      {currentStep > 2 ? (
        <StepSummary step={2} label="Distance" value={distanceMeta ? distanceMeta.label : ""} />
      ) : (
        currentStep >= 2 && (
          <section className="mb-8 rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-lg font-bold text-brand">Step 2: Distance</h2>
            <label htmlFor="distance" className="mb-2 block text-sm font-semibold text-brand">
              Choose your distance
            </label>
            <select
              id="distance"
              value={form.distance}
              onChange={(e) => onDistanceChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-base"
            >
              <option value="">Select distance</option>
              {window.RunningPlan.DISTANCE_OPTIONS.map((distance) => (
                <option key={distance.value} value={distance.value}>
                  {distance.label}
                </option>
              ))}
            </select>
            {daysRemaining !== null &&
              form.distance &&
              validationMessage !== window.RunningPlan.TIME_TRAVEL_MSG && (
                <p className="mt-3 text-sm text-gray-600">
                  Minimum prep for {distanceMeta.label}: {distanceMeta.minDays} days.
                </p>
              )}
          </section>
        )
      )}

      {validationMessage === window.RunningPlan.AMBITIOUS_PLAN_MSG && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          {window.RunningPlan.AMBITIOUS_PLAN_MSG}
        </div>
      )}

      {currentStep > 3 ? (
        <StepSummary step={3} label="Expected finish time" value={form.expectedTime} />
      ) : (
        currentStep >= 3 && (
          <section className="mb-8 rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-lg font-bold text-brand">Step 3: Target time</h2>
            <label htmlFor="expectedTime" className="mb-2 block text-sm font-semibold text-brand">
              Expected finish time (hours:minutes)
            </label>
            <input
              type="text"
              id="expectedTime"
              placeholder="e.g., 1:10 for 10km, 1:45 for half, 4:30 for full"
              value={form.expectedTime}
              onChange={(e) => onExpectedTimeChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-base"
            />
          </section>
        )
      )}

      {currentStep > 4 ? (
        <StepSummary
          step={4}
          label="Training days per week"
          value={`${form.trainingDaysPerWeek} days`}
        />
      ) : (
        currentStep >= 4 && (
          <section className="mb-8 rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-lg font-bold text-brand">Step 4: Weekly frequency</h2>
            <label htmlFor="trainingDays" className="mb-2 block text-sm font-semibold text-brand">
              How many days per week will you train?
            </label>
            <select
              id="trainingDays"
              value={form.trainingDaysPerWeek}
              onChange={(e) => onTrainingDaysChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-base"
            >
              <option value="">Select training days</option>
              <option value="3">3 days</option>
              <option value="4">4 days</option>
              <option value="5">5 days</option>
              <option value="6">6 days</option>
            </select>
          </section>
        )
      )}

      {currentStep >= 5 && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full rounded-lg bg-brand px-8 py-4 text-base font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Generate Training Plan
        </button>
      )}
    </div>
  );
};

window.RunningPlan.StepWizard = StepWizard;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { StepWizard };
}
