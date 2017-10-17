'use strict'
const http = require('http')
const util = require('util')
const appDir = require('app-root-path')
const fs = require('fs')

const hostname = '127.0.0.1'

const start = (config) => {
  let callback = config.callback
  let server = http.createServer((req, res) => {
    if (req.url === util.format('/%s', config.secret)) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('Stopping')
      let err = new Error('Killing process!')
      // Even if the callback is not defined, this will now throw
      server.emit('killed', err)
      throw err
    }
    res.statusCode = 403
    res.setHeader('Content-Type', 'text/plain')
    res.end()
  })

  server.listen(config.port, hostname, (err) => {
    callback(err, server)
  })
}

const createConfig = (secret = 'secret', port = 3000, callback = () => {}) => {
  return {
    secret: secret,
    port: port,
    callback: callback
  }
}

const init = (secret = 'secret', port = 3000, callback = null) => {
  let config = createConfig(secret, port, callback)
  return {
    start: start.bind(null, config),
    config: config
  }
}

const autoStart = (callback) => {
  fs.readFile(appDir + '/.kill-switch.json', (err, res) => {
    if (err) {
      return callback(err)
    }
    try {
      let configJson = JSON.parse(res.toString('utf8'))
      let config = createConfig(configJson.secret, configJson.port, callback)
      start(config)
    } catch (err) {
      return callback(err)
    }
  })
}

module.exports = {
  autoStart: autoStart,
  init
}
