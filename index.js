'use strict'
const http = require('http')
const util = require('util')

const hostname = '127.0.0.1'

const killer = (secret, port = 3000, callback = null) => {
  let server
  return {
    start: () => {
      server = http.createServer((req, res) => {
        if (req.url === util.format('/%s', secret)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('Stopping')
          let err = new Error('Killing process!')
          // Even if the callback is not defined, this will now throw
          callback(err)
          throw err
        }
        res.statusCode = 403
        res.setHeader('Content-Type', 'text/plain')
        res.end()
      })

      server.listen(port, hostname, callback)
    },
    stop: () => {
      server.close()
    }
  }
}

module.exports = killer
