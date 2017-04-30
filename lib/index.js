// ./lib/index.js

const path = require('path'),
    fs = require('fs'),
    Chimp = require('chimp'),
    reporter = require('cucumber-html-reporter'),
    async = require('async'),
    options = require('../config/runtime.options'),
    ncp = require('ncp').ncp,
    chimpDefaultOptions = require('../node_modules/chimp/dist/bin/default.js')

//create or clean folders
var setupFolders = function (callback) {
    // main output folder
    const ouputdir = path.resolve(process.cwd() + '/' + options.outputFolder)
    if (!fs.existsSync(ouputdir)) fs.mkdirSync(ouputdir)

    //report folder
    const reportdir = path.resolve(process.cwd() + '/' + options.reportPath)
    if (!fs.existsSync(reportdir)) fs.mkdirSync(reportdir)

    //features folder 
    const featuredir = path.resolve(process.cwd() + '/features')
    if (!fs.existsSync(featuredir)) {
        //copy the standard features folder from bdd-4k2
        ncp(process.cwd() + '/node_modules/bdd-4k2/features', featuredir, function (err) {
            if (err) {
                return console.error(err);
            }
        })
    }

    //screenshots folder
    const ssdir = path.resolve(process.cwd() + '/' + options.screenshotsPath)
    if (!fs.existsSync(ssdir)) {
        fs.mkdirSync(ssdir)
    } else {
        //empty screenshots dir
        fs.readdir(ssdir, (err, files) => {
            //if (err) throw error;
            for (const file of files) {
                fs.unlink(path.join(ssdir, file), err => {
                    //if (err) throw error;
                });
            }
        });
    }
    callback()
}

//run chimp tests
var dotests = function (callback) {
    options._ = []
    const chimpOptions = Object.assign({}, chimpDefaultOptions, options)
    const chimp = new Chimp(chimpOptions)

    chimp.init(function (err, results) {
        if (err == "Cucumber steps failed") err = null      //stops async crashing out on failed tests, still want the report and cleanup if tests fail
        return callback(err, results);
    })
}

//generate HTML report
var createreport = function (callback) {
    reporter.generate(options)
    callback()                                              //callback would be better but true is returned - e.g. callback ? callback() : true
}

var run = function () {
    async.series([
        setupFolders,
        dotests,
        createreport
    ],
        //finally kill chimp's grip, chimp not exiting properly
        function (err, results) {
            process.exit()
            return
        })
};

exports.run = run;