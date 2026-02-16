window.RunningPlan = window.RunningPlan || {};

window.RunningPlan.DISTANCE_OPTIONS = [
  { value: "10k", label: "10km", km: 10, minDays: 28 },
  { value: "half", label: "Half marathon", km: 21.1, minDays: 42 },
  { value: "full", label: "Full marathon", km: 42.2, minDays: 90 },
];

window.RunningPlan.STRENGTH_EXERCISES = [
  "Squats",
  "Walking lunges",
  "Step-ups",
  "Single-leg RDL",
  "Calf raises",
  "Hip thrusts",
  "Glute bridges",
  "Wall sits",
  "Bulgarian split squats",
  "Box jumps",
];

window.RunningPlan.DISCLAIMER_TITLE = "Important health and safety disclaimer";
window.RunningPlan.DISCLAIMER_LINES = [
  "This tool is for general informational and educational perusal only. It is not medical advice, diagnosis, treatment, physiotherapy guidance, or coaching instruction.",
  "This planner may be more useful for people who are already active and very fit, but it can still be inappropriate or unsafe for your personal context.",
  "You must consult a licensed physician and a qualified physiotherapist or certified trainer before starting, changing, or intensifying training.",
  "By proceeding, you acknowledge that any use is fully at your own risk. The site owner, author, and contributors disclaim all liability for injuries, health events, losses, or damages of any kind resulting from use or misuse of this tool.",
];

window.RunningPlan.RISK_ACCEPTED_BANNER = "You accepted to use this at your own risk.";
window.RunningPlan.TIME_TRAVEL_MSG = "Good luck time travelling :) ";
window.RunningPlan.AMBITIOUS_PLAN_MSG = "we can't generate that ambitious a plan :) ";

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DISTANCE_OPTIONS: window.RunningPlan.DISTANCE_OPTIONS,
    STRENGTH_EXERCISES: window.RunningPlan.STRENGTH_EXERCISES,
    DISCLAIMER_TITLE: window.RunningPlan.DISCLAIMER_TITLE,
    DISCLAIMER_LINES: window.RunningPlan.DISCLAIMER_LINES,
    RISK_ACCEPTED_BANNER: window.RunningPlan.RISK_ACCEPTED_BANNER,
    TIME_TRAVEL_MSG: window.RunningPlan.TIME_TRAVEL_MSG,
    AMBITIOUS_PLAN_MSG: window.RunningPlan.AMBITIOUS_PLAN_MSG,
  };
}
