# BDD for K2

[![NPM version](http://img.shields.io/npm/v/bdd-4k2.svg)](https://www.npmjs.com/package/bdd-4k2)
[![Downloads](https://img.shields.io/npm/dm/bdd-4k2.svg)](https://www.npmjs.com/package/bdd-4k2)

[![NPM](https://nodei.co/npm/bdd-4k2.png?downloads=true)](https://nodei.co/npm/bdd-4k2/)

Brings a BDD approach to requirements gathering, testing and reports for [K2]

## Usage

### Installation

You can install using [npm](https://www.npmjs.com/package/bdd-4k2).

```
npm install -g bdd-4k2
```

### Overview

Once installed, create a new project folder

```
md myproject
cd myproject
bdd-4k2
```

You should see chimp run with no scenarios.

Update the /myproject/features folder with your scenarios and run either bdd-4k2 or chimp --watch etc.

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

[K2]: https://www.k2.com/