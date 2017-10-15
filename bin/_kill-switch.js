'use strict'
const appDir = require('app-root-path')
const config = require(appDir + '/.kill-switch.json')
const util = require('util')
require('http')
.get(util.format('http://localhost:%d/%s', config.port, config.secret), (resp) => {})
