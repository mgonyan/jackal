'use strict'

const parseContract = require('../../../lib/parse-contract')
const isUnsupported = require('../../../lib/is-unsupported')

const validateUnsupportedContract = (req, res, next) => {
  const contracts = req.body

  const parsedContracts = contracts.map(parseContract)
  const unsupportedContract = parsedContracts.find(findUnsupported)

  if (unsupportedContract) {
    res.status(400).send(unsupportedContract.response.body)
  } else {
    next()
  }
}

module.exports = validateUnsupportedContract

const findUnsupported = (contract) => isUnsupported(contract.response.body)
