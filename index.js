'use strict'
const http = require('http')
const util = require('util')
const appDir = require('app-root-path')
const fs = require('fs')

const hostname = '127.0.0.1'

const killer = (secret = 'secret', port = 3000, callback = null) => {
  let config = {
    secret: secret,
    port: port
  }
  let server
  const startIt = (cb) => {
    server = http.createServer((req, res) => {
      if (req.url === util.format('/%s', config.secret)) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('Stopping')
        let err = new Error('Killing process!')
        // Even if the callback is not defined, this will now throw
        cb(err)
        throw err
      }
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/plain')
      res.end()
    })

    server.listen(config.port, hostname, cb)
  }
  return {
    autoStart: (callback) => {
      fs.readFile(appDir + '/.kill-switch.json', (err, res) => {
        if (err) {
          return callback(err)
        }
        try {
          config = JSON.parse(res.toString('utf8'))
          config.callback = callback
          startIt(callback)
        } catch (err) {
          return callback(err)
        }
      })
    },
    start: startIt.bind(null, callback),
    stop: () => {
      server.close()
    }
  }
}

module.exports = killer
