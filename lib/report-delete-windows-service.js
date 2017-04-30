const Service = require('node-windows').Service,
  path = require('path')

// Create a new service object
var svc = new Service({
  name: 'BDD Reporting Web Server',  
  //script: path.resolve('./lib/report-run-webserver.js')
  script: path.join(__dirname,'report-run-webserver.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
  console.log('Uninstall complete. The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();