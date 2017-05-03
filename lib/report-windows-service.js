const Service = require('node-windows').Service,
  path = require('path')

module.exports = {
  installService: function () {
    // Create a new service object 
    var svc = new Service({
      name: 'BDD Reporting Web Server',
      description: 'Web server for accessing BDD reports via a URL',
      //script: path.resolve('./lib/report-run-webserver.js')
      script: path.join(__dirname, 'report-run-webserver.js')
    })

    // Listen for the "install" event, which indicates the 
    // process is available as a service. 
    svc.on('install', function () {
      svc.start()
      console.log('Install complete. The service exists: ', svc.exists)
    });

    svc.install()
  },

  uninstallService: function () {
    // Create a new service object
    var svc = new Service({
      name: 'BDD Reporting Web Server',
      //script: path.resolve('./lib/report-run-webserver.js')
      script: path.join(__dirname, 'report-run-webserver.js')
    });

    // Listen for the "uninstall" event so we know when it's done.
    svc.on('uninstall', function () {
      console.log('Uninstall complete. The service exists: ', svc.exists);
    });

    // Uninstall the service.
    svc.uninstall();

  }
}