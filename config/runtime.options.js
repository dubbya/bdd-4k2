var outputFolder = 'bdd_output'

module.exports = {
  // - - - - CHIMP SETTINGS - - - -
  showXolvioMessages: false,
  timeout: 5000,
  port: 4455,

  // - - - - CUCUMBER SETTINGS - - - -
  jsonOutput: './' + outputFolder + '/report.json',
  screenshotsOnError: true,
  screenshotsPath: '/' + outputFolder + '/screenshots',
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: true,

  // - - - - REPORTER SETTINGS - - - -
  reportPath: outputFolder + '/report',
  theme: 'bootstrap',
  jsonFile: outputFolder + '/report.json',
  output: outputFolder + '/report/report.html',
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "App Version": "0.4.0",
    "Browser": "Chrome"
  }
}

module.exports.outputFolder = outputFolder