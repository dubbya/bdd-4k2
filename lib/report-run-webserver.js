const express = require('express'),
    options = require('../config/runtime.options')

var app = express()
app.use('/', express.static(process.cwd() + '/' + options.reportPath))
app.listen(3000, function () {
    console.log('listening on 3000')
})