'use strict'
const appDir = require('app-root-path')
const config = require(appDir + '/.kill-switch.json')
const ks = require('../index')
const killer = ks(config.secret, config.port, () => {})
killer.start()
