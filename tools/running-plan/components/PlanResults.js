window.RunningPlan = window.RunningPlan || {};

const { useState } = React;

const PlanResults = function PlanResults({
  plan,
  distanceLabel,
  expectedTime,
  daysRemaining,
  onStartOver,
  planName,
  onPlanNameChange,
  onUpdateSession,
  shareUrl,
  onCopyShareUrl,
  copyStatus,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditorKey, setActiveEditorKey] = useState(null);

  const toggleEditing = () => {
    setIsEditing((prev) => {
      const next = !prev;
      if (!next) setActiveEditorKey(null);
      return next;
    });
  };

  const renderReadOnlySession = (session) => (
    <>
      <div className="mb-1 text-sm font-semibold text-brand">
        {session.day}
        {session.dateLabel ? ` - ${session.dateLabel}` : ""}
      </div>
      <div className="mb-1 font-semibold">{session.type}</div>

      {Array.isArray(session.exercises) && session.exercises.length > 0 ? (
        <div className="mt-2 text-sm text-[#666]">
          <strong>Exercises:</strong>
          <div className="mt-1">{session.exercises.slice(0, 6).join(", ")}</div>
        </div>
      ) : null}

      {session.description ? (
        <div className="mt-2 text-sm text-[#666]">{session.description}</div>
      ) : null}

      {Number(session.duration) > 0 ? (
        <div className="mt-1 text-sm font-semibold text-[#666]">{session.duration} minutes</div>
      ) : null}
    </>
  );

  return (
    <section className="mt-10 pb-24">
      <div className="mb-6 print:hidden">
        <label htmlFor="planName" className="mb-2 block text-sm font-semibold text-brand">
          Plan name
        </label>
        <input
          id="planName"
          type="text"
          value={planName}
          onChange={(e) => onPlanNameChange(e.target.value)}
          placeholder="e.g., Spring 10k prep"
          className="w-full rounded-lg border border-gray-200 p-3 text-base"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={toggleEditing}
          className={
            isEditing
              ? "rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600"
              : "rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
          }
        >
          {isEditing ? "Done editing" : "Enable edit mode"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Print plan
        </button>
        {isEditing ? (
          <span className="text-sm text-gray-600">
            Click "Edit day" on a card to modify only that day.
          </span>
        ) : null}
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 print:hidden">
        <div className="mb-2 text-sm font-semibold text-brand">Share this plan</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
          />
          <button
            type="button"
            onClick={onCopyShareUrl}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {copyStatus === "copied" ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>

      <h2 className="mb-1 text-3xl font-bold text-brand">
        {planName || `Your ${distanceLabel} Plan`}
      </h2>
      <p className="mb-6 text-[#666]">
        Target: {expectedTime} finish time | {daysRemaining} days to race day
      </p>

      {plan.map((week, weekIndex) => {
        const hasTaperWeek = week.some(
          (session) => session.isTaperWeek && session.type !== "EVENT DAY"
        );

        return (
          <div
            key={weekIndex}
            className="mb-6 rounded-lg border border-gray-200 bg-white p-6 break-inside-avoid"
          >
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-brand">
              <span>Week {weekIndex + 1}</span>
              {hasTaperWeek && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  Taper week
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {week.map((session, dayIndex) => {
                const sessionKey = `${weekIndex}-${dayIndex}`;
                const isThisSessionEditing = isEditing && activeEditorKey === sessionKey;

                return (
                  <div
                    key={dayIndex}
                    className={
                      session.type === "EVENT DAY"
                        ? "rounded-md border-l-[3px] border-amber-500 bg-amber-50 p-4"
                        : "rounded-md border-l-[3px] border-brand bg-[#f9fdf7] p-4"
                    }
                  >
                    {isThisSessionEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="m-0 text-sm font-semibold text-brand">Editing day</p>
                          <button
                            type="button"
                            onClick={() => setActiveEditorKey(null)}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            Done with day
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={session.day || ""}
                            onChange={(e) =>
                              onUpdateSession(weekIndex, dayIndex, { day: e.target.value })
                            }
                            className="rounded border border-gray-200 p-2 text-sm"
                            placeholder="Day"
                          />
                          <input
                            type="text"
                            value={session.dateLabel || ""}
                            onChange={(e) =>
                              onUpdateSession(weekIndex, dayIndex, { dateLabel: e.target.value })
                            }
                            className="rounded border border-gray-200 p-2 text-sm"
                            placeholder="Date"
                          />
                        </div>

                        <input
                          type="text"
                          value={session.type || ""}
                          onChange={(e) =>
                            onUpdateSession(weekIndex, dayIndex, { type: e.target.value })
                          }
                          className="w-full rounded border border-gray-200 p-2 text-sm"
                          placeholder="Session type"
                        />

                        <input
                          type="text"
                          value={session.duration ?? ""}
                          onChange={(e) =>
                            onUpdateSession(weekIndex, dayIndex, { duration: e.target.value })
                          }
                          className="w-full rounded border border-gray-200 p-2 text-sm"
                          placeholder="Duration (minutes)"
                        />

                        <textarea
                          value={session.description || ""}
                          onChange={(e) =>
                            onUpdateSession(weekIndex, dayIndex, { description: e.target.value })
                          }
                          className="w-full rounded border border-gray-200 p-2 text-sm"
                          rows="2"
                          placeholder="Description / notes"
                        />

                        <input
                          type="text"
                          value={
                            Array.isArray(session.exercises) ? session.exercises.join(", ") : ""
                          }
                          onChange={(e) =>
                            onUpdateSession(weekIndex, dayIndex, {
                              exercises: e.target.value
                                ? e.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean)
                                : null,
                            })
                          }
                          className="w-full rounded border border-gray-200 p-2 text-sm"
                          placeholder="Exercises (comma-separated)"
                        />
                      </div>
                    ) : (
                      <>
                        {renderReadOnlySession(session)}
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => setActiveEditorKey(sessionKey)}
                            className="mt-3 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            Edit day
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isEditing ? (
        <div className="fixed bottom-4 right-4 z-30 print:hidden">
          <button
            type="button"
            onClick={toggleEditing}
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-amber-600"
          >
            Done editing
          </button>
        </div>
      ) : null}

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
