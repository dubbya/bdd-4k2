// ./lib/index.js

const path = require('path'), 
    fs = require('fs'),
    Chimp = require('chimp'),
    reporter = require('cucumber-html-reporter'),
    async = require('async'),
    options = require('./config/runtime.options')

var run = function() {
    async.series([
    //empty screenshots dir
    function (callback) {
        const directory = options.screenshotsPath;
        fs.readdir(directory, (err, files) => {
            //if (err) throw error;
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    //if (err) throw error;
                });
            }
            callback()
        });
    },
    //run chimp tests
    function (callback) {
        const chimpDefaultOptions = require(path.resolve(process.cwd() + '/node_modules/chimp/dist/bin/default.js'))
        options._ = []
        const chimpOptions = Object.assign({}, chimpDefaultOptions, options)
        const chimp = new Chimp(chimpOptions)

        chimp.init(function (err, results) {
            if (err == "Cucumber steps failed") err = null      //stops async crashing out on failed tests, still want the report and cleanup
            return callback(err, results);
        })
    },
    //generate HTML report
    function (callback) {
        reporter.generate(options)
        callback()                                              //callback would be better but true is returned - e.g. callback ? callback() : true
    }],
    //kill chimp's grip  
    function (err, results) {
        // optional callback
        //console.log('err: ' + err + ' results: ' + results)
        //console.log('finished')
        process.exit()                                              //chimp not exiting properly
		return
    })
};

// Allows us to call this function from outside of the library file.
// Without this, the function would be private to this file.
exports.run = run;