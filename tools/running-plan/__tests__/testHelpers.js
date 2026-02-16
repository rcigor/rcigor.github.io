const path = require("path");

function loadRunningPlanModules() {
  jest.resetModules();

  global.window = global.window || {};
  window.RunningPlan = {};

  require(path.join(__dirname, "..", "constants.js"));
  require(path.join(__dirname, "..", "utils.js"));
  require(path.join(__dirname, "..", "components", "DisclaimerGate.js"));
  require(path.join(__dirname, "..", "components", "StepWizard.js"));
  require(path.join(__dirname, "..", "components", "PlanResults.js"));

  return require(path.join(__dirname, "..", "App.js"));
}

module.exports = { loadRunningPlanModules };
