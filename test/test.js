/* global it, describe */
'use strict'
const proxyquire = require('proxyquire')
require('should')
const port = 3000
const secret = 'secret'
const request = require('supertest')('http://localhost:' + port)

let fsStub = {
  readFile: (filename, callback) => {
    callback(null, "{bad json'")
  }
}

let arStub = {
  toString: () => {
    return '/etc/non-existing'
  }
}

describe('All the things', () => {
  it('Should start a server and return something on a wrong secret', (done) => {
    var ks = require('..')(secret, port, () => {
      request.get('/')
        .expect(403)
        .end((err, res) => {
          ks.stop()
          done(err)
        })
    })
    ks.start()
  })

  it('Should throw when using correct secret', (done) => {
    var ks
    ks = require('..')(secret, port, (err) => {
      if (err) {
        ks.stop()
        err.message.should.equal('Killing process!')
        done()
      }
      request.get('/' + secret)
        .expect(200)
        .end(() => {
        })
    })
    ks.start()
  })

  it('Should throw on an empty try of autostart', (done) => {
    const ks = proxyquire('..', {
      'app-root-path': arStub
    })
    ks().autoStart((err) => {
      err.message.should.equal("ENOENT: no such file or directory, open '/etc/non-existing/.kill-switch.json'")
      done()
    })
  })

  it('Should throw on a crappy json try of autostart', (done) => {
    const ks = proxyquire('..', {
      fs: fsStub
    })
    let killer = ks()
    killer.autoStart((err) => {
      err.message.should.match(/JSON/)
      done()
    })
  })

  it('Should autostart OK if all is good', (done) => {
    fsStub.readFile = (filename, callback) => {
      callback(null, `{"port": ${port}, "secret": "${secret}"}`)
    }
    const ks = proxyquire('..', {
      fs: fsStub
    })
    let killer = ks()
    killer.autoStart((err) => {
      if (err) {
        if (err.message !== 'Killing process!') {
          return done(err)
        }
        killer.stop()
        return done()
      }
      request.get('/' + secret)
      .expect(200)
      .end(() => {
      })
    })
  })
})
