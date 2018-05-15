/* global it, describe */
'use strict'
const proxyquire = require('proxyquire')
const should = require('should')
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

let etStub = () => {}

describe('All the things', () => {
  it('Should start a server and return something on a wrong secret', (done) => {
    let ks = require('..').init(secret, port, (err, server) => {
      should(err).equal(undefined)
      request.get('/')
        .expect(403)
        .end((err, res) => {
          server.close()
          done(err)
        })
    })
    ks.start()
  })

  it('Should throw when using correct secret', (done) => {
    let ks = proxyquire('..', {
      './errorThrower': etStub
    }).init(secret, port, (err, server) => {
      should(err).equal(undefined)
      server.on('killed', () => {
        server.close(done)
      })
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
    ks.autoStart((err) => {
      err.message.should.equal("ENOENT: no such file or directory, open '/etc/non-existing/.kill-switch.json'")
      done()
    })
  })

  it('Should throw on a crappy json try of autostart', (done) => {
    const ks = proxyquire('..', {
      fs: fsStub
    })
    ks.autoStart((err) => {
      err.message.should.match(/JSON/)
      done()
    })
  })

  it('Should autostart OK if all is good', (done) => {
    fsStub.readFile = (filename, callback) => {
      callback(null, `{"port": ${port}, "secret": "${secret}"}`)
    }
    const ks = proxyquire('..', {
      fs: fsStub,
      './errorThrower': etStub
    })
    ks.autoStart((err, server) => {
      should(err).equal(undefined)
      server.on('killed', () => {
        server.close(done)
      })
      request.get('/' + secret)
        .expect(200)
        .end(() => {
        })
    })
  })
  it('Should throw an error when we ask it to', () => {
    var et = require('../errorThrower')
    ;(function () {
      et(new Error('TEST ERROR'))
    }).should.throw('TEST ERROR')
  })
})
