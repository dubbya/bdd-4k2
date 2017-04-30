const Service = require('node-windows').Service,
  path = require('path')

// Create a new service object 
var svc = new Service({
  name: 'BDD Reporting Web Server',
  description: 'Web server for accessing BDD reports via a URL',
  //script: path.resolve('./lib/report-run-webserver.js')
  script: path.join(__dirname,'report-run-webserver.js')
});

// Listen for the "install" event, which indicates the 
// process is available as a service. 
svc.on('install', function () {
  svc.start();
  console.log('Install complete. The service exists: ', svc.exists);
});

svc.install();