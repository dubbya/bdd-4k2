#! /usr/bin/env node
const bdd4k2 = require('../lib/index.js'),
    minimist = require('minimist')(process.argv.slice(2)),
    reportsvc = require('../lib/report-windows-service')

var run = true;

minimist._.forEach(function (val, index, array) {
    // loop through unspecififed args e.g. 'bdd-4k2 --blah 24' wont be here but 'bdd-4k2 blah' will be
    switch (val) {
        case 'install-service':
            console.log('install-service')
            reportsvc.installService()
            run = !run
            break
        case 'uninstall-service':
            console.log('uninstall-service')
            reportsvc.uninstallService()
            run = !run
            break
        case 'create-schedule':
            //console.log('create-schedule')
            //test for --hour 14 or --minute 30
            if ('hour' in minimist && 'minute' in minimist) {
                console.log('hour and minute specified')
                //TODO expand the reporting windows web service to run everything if a schedule has been set
                //write the last used config to runtime.options.js file so when the service starts again the job is set
                //e.g. bdd-4k2 set-schedule --hour 14 --minute 30, will bdd4k2.run() everyday at 2:30pm
                //e.g. bdd-4k2 set-schedule --hour 14 --minute 30 --dayOfWeek 0, will bdd4k2.run() every Sunday at 2:30pm
            }
            run = !run
            break
        case 'remove-schedule': 
            console.log('remove-schedule')
            run = !run
            break         
        default:
        //do nothing
    }
})

if (run) bdd4k2.run()