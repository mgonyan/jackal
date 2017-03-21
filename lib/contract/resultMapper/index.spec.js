'use strict'

const tap = require('tap')
const test = tap.test

const mapResult = require('.')

test('mapResult', t => {
  t.plan(2)

  const base = { name: 'name', consumer: 'consumer' }
  const input = { contract: base }

  const failed = Object.assign({}, input, { err: 'Error' })
  t.same(mapResult(failed), Object.assign({}, base, { status: 'Fail' }))

  const passed = Object.assign({}, input, { err: null })
  t.same(mapResult(passed), Object.assign({}, base, { status: 'Pass' }))
})