window.RunningPlan = window.RunningPlan || {};

const DisclaimerGate = function DisclaimerGate({ onAccept, onDecline }) {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-[800px] text-left">
      <a
        href="index.html"
        className="mb-8 inline-flex items-center gap-2 text-[1.2em] text-[#444] no-underline"
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

      <header className="mb-8">
        <h1 className="mb-2 text-5xl font-bold text-brand">Event-Day Run Planner</h1>
        <p className="m-0 text-[1.2em] text-[#444]">Please read before using this tool.</p>
      </header>

      <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm leading-relaxed text-red-900">
        <h2 className="mb-4 text-xl font-bold">{window.RunningPlan.DISCLAIMER_TITLE}</h2>
        <div className="space-y-3">
          {window.RunningPlan.DISCLAIMER_LINES.map((line, idx) => (
            <p key={idx} className="m-0">
              {line}
            </p>
          ))}
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="text-sm">
            I have read and understood this disclaimer and I choose to proceed at my own risk.
          </span>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Decline
          </button>
          <button
            type="button"
            disabled={!checked}
            onClick={onAccept}
            className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Accept and continue
          </button>
        </div>
      </section>
    </div>
  );
};

window.RunningPlan.DisclaimerGate = DisclaimerGate;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DisclaimerGate };
}
