# BDD for K2

[![NPM version](http://img.shields.io/npm/v/bdd-4k2.svg)](https://www.npmjs.com/package/bdd-4k2)
[![Downloads](https://img.shields.io/npm/dm/bdd-4k2.svg)](https://www.npmjs.com/package/bdd-4k2)

Brings a BDD approach to requirements gathering, testing and reports for [K2]. This project is a wrapper around [chimp] with a step definition file specifically for [K2], a [cucumber html reporter], express webserver to host the report, and soon to be scheduler for running regular tests. 

## Usage

### Installation

If you already have node/npm installed, you can install using [npm](https://www.npmjs.com/package/bdd-4k2).

```
npm install -g bdd-4k2
```

Or if you are on Windows and need the one-click installer (including choco/nodejs/chrome/bdd-4k2) then you can use the powershell script.

```
Run powershell as administrator
.\install-bdd-4k2-and-dependencies.ps1
```

### Overview

Once installed, create a new project folder

```
md myproject
cd myproject
bdd-4k2
```

Success means you should see chimp run with 0 scenarios and 0 steps (as the sample /myproject/features/yourfeature.feature file is blank).

Update the /myproject/features folder with your scenarios/tests and run either bdd-4k2 (or chimp --watch etc if you are developing your feature files).

### Reporting

When you run bdd-4k2 chimp is run and also a html cucumber reporter using express to serve that report. This is run via a windows service so its always availble (e.g. for emails in K2 workflows) to install

```
bdd-4k2 install-service
```

to uninstall

```
bdd-4k2 uninstall-service
```

to access

```
http://localhost:3000/report.html
```

### Scheduling

Coming soon

[![NPM](https://nodei.co/npm/bdd-4k2.png?downloads=true)](https://nodei.co/npm/bdd-4k2/)

[K2]: https://www.k2.com/
[HTML report generation]: https://github.com/gkushang/cucumber-html-reporter
[chimp]: https://github.com/xolvio/chimp