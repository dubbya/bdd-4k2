module.exports = {
  // - - - - GULP CHIMP SETTINGS - - - -
  showXolvioMessages: false,
  timeout: 5000,
  port: 4455,

  // - - - - GULP CHIMP CUCUMBER - - - -
  jsonOutput: './e2e_output/cucumber.json',
  screenshotsOnError: true,
  screenshotsPath: './e2e_output/screenshots',
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: true,

  // - - - - REPORTER - - - -
  theme: 'bootstrap',
  jsonFile: 'e2e_output/cucumber.json',
  output: 'e2e_output/report/cucumber.html',
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "App Version": "0.4.0",
    "Browser": "Chrome"
  }
}