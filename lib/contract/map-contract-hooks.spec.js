'use strict'

const mockery = require('mockery')

const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

describe('mapContractHooks', function () {
  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })
  })

  after(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('should map hooks to request functions successfully', function () {
    const beforeHooks = [
      { baseUrl: 'URL', method: 'PUT', timeout: 20000 },
      { baseUrl: 'URL1', method: 'POST', timeout: 20001, body: '{"string": "body"}' },
      { baseUrl: 'URL1', method: 'POST', timeout: 20001, body: {"json": "body"} },
      { baseUrl: 'URL2', method: 'GET', timeout: 20004, headers: { 'header': 'value' } }
    ]

    const afterHooks = [
      { baseUrl: 'URL1', method: 'POST', timeout: 20001, body: '{"json": "body"}' }
    ]

    const requestMock = sinon.stub()
    mockery.registerMock('request', requestMock)
    mockery.registerAllowable('.')
    let mapContractHooks = require('./map-contract-hooks')

    const contract = { before: beforeHooks, after: afterHooks }

    const beforeHookFunction = mapContractHooks(contract).before
    beforeHookFunction(function () {})
    const afterHookFunction = mapContractHooks(contract).after
    afterHookFunction(function () {})

    expect(requestMock.callCount).to.be.equal(beforeHooks.length + afterHooks.length)

    beforeHooks.concat(afterHooks).forEach(function (hook, index) {
      const callArgs = requestMock.getCall(index).args[0]
      expect(hook.url).to.be.equal(callArgs.uri)
      expect(hook.method).to.be.equal(callArgs.method)
      expect(hook.timeout).to.be.equal(callArgs.timeout)
    })
  })
})