window.RunningPlan = window.RunningPlan || {};

const { useMemo, useState } = React;

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

  const editableSessions = useMemo(
    () =>
      plan.flatMap((week, weekIndex) =>
        week.map((session, dayIndex) => ({
          key: `${weekIndex}-${dayIndex}`,
          weekIndex,
          dayIndex,
          label: `Week ${weekIndex + 1} - ${session.day || `Day ${dayIndex + 1}`}`,
        }))
      ),
    [plan]
  );

  const activeEditorIndex = useMemo(() => {
    if (!activeEditorKey) return -1;
    return editableSessions.findIndex((session) => session.key === activeEditorKey);
  }, [editableSessions, activeEditorKey]);

  const activeEditor = activeEditorIndex >= 0 ? editableSessions[activeEditorIndex] : null;
  const activeSession =
    activeEditor && plan[activeEditor.weekIndex]
      ? plan[activeEditor.weekIndex][activeEditor.dayIndex]
      : null;

  const toggleEditing = () => {
    setIsEditing((prev) => {
      const next = !prev;
      if (!next) setActiveEditorKey(null);
      return next;
    });
  };

  const openEditor = (weekIndex, dayIndex) => {
    setActiveEditorKey(`${weekIndex}-${dayIndex}`);
  };

  const closeEditor = () => {
    setActiveEditorKey(null);
  };

  const navigateEditorBy = (offset) => {
    if (activeEditorIndex < 0) return;

    const nextIndex = activeEditorIndex + offset;
    if (nextIndex < 0 || nextIndex >= editableSessions.length) return;

    setActiveEditorKey(editableSessions[nextIndex].key);
  };

  const parseExercises = (value) =>
    value
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : null;

  const renderReadOnlySession = (session) => (
    <>
      <div className="mb-1 text-sm font-semibold text-ink">
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
        <label htmlFor="planName" className="mb-2 block text-sm font-semibold text-ink">
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
            Pick one card to edit. Use Previous/Next inside the editor panel.
          </span>
        ) : null}
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 print:hidden">
        <div className="mb-2 text-sm font-semibold text-ink">Share this plan</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Share URL"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
          />
          <button
            type="button"
            onClick={onCopyShareUrl}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark"
          >
            {copyStatus === "copied" ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>

      <h2 className="mb-1 text-3xl font-bold text-ink">
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
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
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
                const isSelected = activeEditorKey === sessionKey;

                return (
                  <div
                    key={dayIndex}
                    className={
                      session.type === "EVENT DAY"
                        ? `rounded-md border-l-[3px] border-amber-500 bg-amber-50 p-4 ${
                            isSelected ? "ring-2 ring-amber-400" : ""
                          }`
                        : `rounded-md border-l-[3px] border-brand bg-[#fff8e3] p-4 ${
                            isSelected ? "ring-2 ring-brand" : ""
                          }`
                    }
                  >
                    {renderReadOnlySession(session)}
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => openEditor(weekIndex, dayIndex)}
                        className="mt-3 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                        aria-label={`Edit ${session.day || `day ${dayIndex + 1}`}`}
                      >
                        {isSelected ? "Editing" : "Edit day"}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isEditing && activeSession ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-0 print:hidden sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-ink">Edit training day</h3>
                <p className="m-0 text-sm text-gray-600">
                  {activeEditor.label} ({activeEditorIndex + 1} of {editableSessions.length})
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Close editor
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => navigateEditorBy(-1)}
                disabled={activeEditorIndex <= 0}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous day
              </button>
              <button
                type="button"
                onClick={() => navigateEditorBy(1)}
                disabled={activeEditorIndex >= editableSessions.length - 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next day
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="editor-day" className="mb-1 block text-sm font-semibold text-ink">
                    Day
                  </label>
                  <input
                    id="editor-day"
                    type="text"
                    value={activeSession.day || ""}
                    onChange={(e) =>
                      onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                        day: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-200 p-2 text-sm"
                    placeholder="Day"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editor-date"
                    className="mb-1 block text-sm font-semibold text-ink"
                  >
                    Date
                  </label>
                  <input
                    id="editor-date"
                    type="text"
                    value={activeSession.dateLabel || ""}
                    onChange={(e) =>
                      onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                        dateLabel: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-200 p-2 text-sm"
                    placeholder="Date"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="editor-session-type"
                  className="mb-1 block text-sm font-semibold text-ink"
                >
                  Session type
                </label>
                <input
                  id="editor-session-type"
                  type="text"
                  value={activeSession.type || ""}
                  onChange={(e) =>
                    onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded border border-gray-200 p-2 text-sm"
                  placeholder="Session type"
                />
              </div>

              <div>
                <label
                  htmlFor="editor-duration"
                  className="mb-1 block text-sm font-semibold text-ink"
                >
                  Duration (minutes)
                </label>
                <input
                  id="editor-duration"
                  type="text"
                  value={activeSession.duration ?? ""}
                  onChange={(e) =>
                    onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                      duration: e.target.value,
                    })
                  }
                  className="w-full rounded border border-gray-200 p-2 text-sm"
                  placeholder="Duration (minutes)"
                />
              </div>

              <div>
                <label
                  htmlFor="editor-description"
                  className="mb-1 block text-sm font-semibold text-ink"
                >
                  Description / notes
                </label>
                <textarea
                  id="editor-description"
                  value={activeSession.description || ""}
                  onChange={(e) =>
                    onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded border border-gray-200 p-2 text-sm"
                  rows="3"
                  placeholder="Description / notes"
                />
              </div>

              <div>
                <label
                  htmlFor="editor-exercises"
                  className="mb-1 block text-sm font-semibold text-ink"
                >
                  Exercises (comma-separated)
                </label>
                <input
                  id="editor-exercises"
                  type="text"
                  value={
                    Array.isArray(activeSession.exercises) ? activeSession.exercises.join(", ") : ""
                  }
                  onChange={(e) =>
                    onUpdateSession(activeEditor.weekIndex, activeEditor.dayIndex, {
                      exercises: parseExercises(e.target.value),
                    })
                  }
                  className="w-full rounded border border-gray-200 p-2 text-sm"
                  placeholder="Exercises (comma-separated)"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
        className="mt-4 w-full rounded-lg bg-brand px-8 py-4 text-base font-semibold text-ink transition hover:bg-brand-dark print:hidden"
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
