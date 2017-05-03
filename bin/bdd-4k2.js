#! /usr/bin/env node
const myLibrary = require('../lib/index.js'),
    minimist = require('minimist')(process.argv.slice(2)),
    reportsvc = require('../lib/report-windows-service')

var run = true;

minimist._.forEach(function (val, index, array) {
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
        default:
            //do nothing
    }
})

if (run) myLibrary.run()