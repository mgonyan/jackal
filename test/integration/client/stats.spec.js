'use strict'

const fs = require('fs')
const request = require('request')
const jackal = require('../../helpers/jackal')
const Provider = require('../../helpers/provider')
const stats = require('../../../client/stats')

describe('Client.Stats Integration Test', function () {
  let port, dbPath, options, providerOne, providerTwo

  before(function (done) {
    port = 8378
    dbPath = 'test/integration/api/stats.json'
    options = {
      port: port,
      quiet: true,
      db: { path: dbPath }
    }

    jackal.start(options, done)
  })

  before(function (done) {
    providerOne = new Provider()
    providerOne.start({ port: 8379 }, done)
  })

  before(function (done) {
    providerTwo = new Provider()
    providerTwo.start({ port: 8380 }, done)
  })

  before(function (done) {
    const buf = fs.readFileSync('test/contracts/stats.json')

    const req = {
      url: `http://localhost:${port}/api/contracts`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: buf
    }

    request(req, (err, res, body) => {
      if (err) { return done(err) }
      done()
    })
  })

  it('should get the basic stats pack when not specifying the consumer or provider', function (done) {
    stats(`http://localhost:${port}`, {}, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        consumerCount: 1,
        consumers: [ 'consumer' ],
        providerCount: 2,
        providers: [ 'provider_one', 'provider_two' ],
        apiCount: 3,
        contractCount: 3
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the consumer specific stats pack when specifying a consumer', function (done) {
    stats(`http://localhost:${port}`, { consumer: 'consumer' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        consumer: 'consumer',
        providerCount: 2,
        providers: [ 'provider_one', 'provider_two' ],
        apiCount: 3,
        contractCount: 3
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the consumer specific stats pack when specifying an invalid consumer', function (done) {
    stats(`http://localhost:${port}`, { consumer: 'invalid' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        consumer: 'invalid',
        providerCount: 0,
        providers: [],
        apiCount: 0,
        contractCount: 0
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the provider specific stats pack when specifying a provider', function (done) {
    stats(`http://localhost:${port}`, { provider: 'provider_one' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        provider: 'provider_one',
        consumerCount: 1,
        consumers: [ 'consumer' ],
        apiCount: 2,
        apis: [ 'receipt_api', 'user_api' ],
        contractCount: 2
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the provider specific stats pack when specifying an invalid provider', function (done) {
    stats(`http://localhost:${port}`, { provider: 'invalid' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        provider: 'invalid',
        consumerCount: 0,
        consumers: [],
        apiCount: 0,
        apis: [],
        contractCount: 0
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the the consumer/provider specific stats pack when specifying a consumer and provider', function (done) {
    stats(`http://localhost:${port}`, { consumer: 'consumer', provider: 'provider_one' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        consumer: 'consumer',
        provider: 'provider_one',
        apiCount: 2,
        apis: [ 'receipt_api', 'user_api' ],
        contractCount: 2
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  it('should get the the consumer/provider specific stats pack when specifying an invalid consumer and invalid provider', function (done) {
    stats(`http://localhost:${port}`, { consumer: 'invalid', provider: 'invalid_too' }, (err, res, body) => {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)

      const expected = {
        consumer: 'invalid',
        provider: 'invalid_too',
        apiCount: 0,
        apis: [],
        contractCount: 0
      }

      expect(body).to.eql(expected)
      done()
    })
  })

  after(function (done) {
    fs.stat(dbPath, (err, stats) => {
      if (stats) { fs.unlink(dbPath, done) }
      else { done() }
    })
  })

  after(jackal.stop)

  after(function (done) {
    providerOne.stop(done)
  })

  after(function (done) {
    providerTwo.stop(done)
  })
})
