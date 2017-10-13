/* global it, describe */
'use strict'
require('should')
const port = 3000
const secret = 'secret'
const request = require('supertest')('http://localhost:' + port)

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
})
