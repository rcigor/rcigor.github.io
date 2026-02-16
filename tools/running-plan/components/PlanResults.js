window.RunningPlan = window.RunningPlan || {};

const PlanResults = function PlanResults({
  plan,
  distanceLabel,
  expectedTime,
  daysRemaining,
  onStartOver,
}) {
  return (
    <section className="mt-10">
      <div className="mb-6 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Print plan
        </button>
      </div>

      <h2 className="mb-2 text-3xl font-bold text-brand">Your {distanceLabel} Training Plan</h2>
      <p className="mb-6 text-[#666]">
        Target: {expectedTime} finish time | {daysRemaining} days to race day
      </p>

      {plan.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className="mb-6 rounded-lg border border-gray-200 bg-white p-6 break-inside-avoid"
        >
          <div className="mb-4 text-lg font-bold text-brand">Week {weekIndex + 1}</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {week.map((session, dayIndex) => (
              <div
                key={dayIndex}
                className="rounded-md border-l-[3px] border-brand bg-[#f9fdf7] p-4"
              >
                <div className="mb-2 font-semibold text-brand">{session.day}</div>
                <div className="mb-1 font-semibold">{session.type}</div>
                {session.type === "Strength Training" && session.exercises ? (
                  <div className="mt-2 text-sm text-[#666]">
                    <strong>Exercises:</strong>
                    <div className="mt-1">{session.exercises.slice(0, 4).join(", ")}</div>
                  </div>
                ) : session.description ? (
                  <div className="mt-2 text-sm text-[#666]">
                    <div>{session.description}</div>
                    {session.duration > 0 && (
                      <div className="mt-1 font-semibold">{session.duration} minutes</div>
                    )}
                  </div>
                ) : session.duration > 0 ? (
                  <div className="text-sm text-[#666]">{session.duration} minutes</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="mt-4 w-full rounded-lg bg-brand px-8 py-4 text-base font-semibold text-white transition hover:bg-brand-dark print:hidden"
        onClick={onStartOver}
      >
        Start Over
      </button>
    </section>
  );
};

window.RunningPlan.PlanResults = PlanResults;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PlanResults };
}
