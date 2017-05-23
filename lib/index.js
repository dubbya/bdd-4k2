// ./lib/index.js

const path = require('path'),
    fs = require('fs'),
    Chimp = require('chimp'),
    reporter = require('cucumber-html-reporter'),
    async = require('async'),
    options = require('../config/runtime.options'),
    fse = require('fs-extra'),
    chimpDefaultOptions = require('chimp/dist/bin/default.js'),
    defaultfeaturesdir = path.resolve(__dirname, '../features'),
    ouputdir = path.resolve(process.cwd() + '/' + options.outputFolder),
    reportdir = path.resolve(process.cwd() + '/' + options.reportPath),
    ssdir = path.resolve(process.cwd() + '/' + options.screenshotsPath),
    featuredir = path.resolve(process.cwd() + '/features')

// Make babel plugins available to Cucumber and Mocha child processes - copied from chimp.js
process.env.NODE_PATH += path.delimiter + path.resolve(__dirname, '../node_modules') + path.delimiter

//create or clean folders
var setupFolders = function (callback) {
    // main output folder
    if (!fs.existsSync(ouputdir)) fs.mkdirSync(ouputdir)

    //report folder
    if (!fs.existsSync(reportdir)) fs.mkdirSync(reportdir)

    //features folder 
    if (!fs.existsSync(featuredir)) {
        fse.copySync(defaultfeaturesdir, featuredir)
    } else {
        //make sure the project folder step defs is the latest, version if needed
        if (fs.existsSync(path.resolve(featuredir + '/support'))) {
            if (fs.existsSync(path.resolve(featuredir + '/support/step_defs.js'))) {
                var bddstats = fs.statSync(path.resolve(defaultfeaturesdir + '/support/step_defs.js'))
                var projstats = fs.statSync(path.resolve(featuredir + '/support/step_defs.js'))
                if (bddstats.mtime != projstats.mtime) {
                    var renamedate = new Date().toString()
                    fs.renameSync(path.resolve(featuredir + '/support/step_defs.js'), path.resolve(featuredir + '/support/step_defs_' + renamedate + '.js.txt'))
                    fse.copySync(path.resolve(defaultfeaturesdir + '/support/step_defs.js'), featuredir)
                }
            }
        }
    }

    //screenshots folder
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
    if (fs.existsSync(options.jsonFile)) reporter.generate(options)
    else console.log('No json report found so skipping HTML generation')
    callback()                                              //callback from reporter would be better but true is returned - i.e. callback ? callback() : true
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