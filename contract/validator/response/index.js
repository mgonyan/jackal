'use strict'

const Joi = require('joi')
const buildError = require('../utils')

const httpStatusCodes = [
  100, 101, 102, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302,
  303, 304, 305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409,
  410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 426, 428, 429,
  431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511
]

const responseSchema = Joi.object().keys({
  statusCode: Joi.number().integer().valid(httpStatusCodes).required(),
  headers: Joi.object().optional(),
  body: Joi.alternatives([Joi.string().optional(), Joi.object().optional()])
})

const validateResponse = response => {
  const res = Joi.validate(response, responseSchema)

  return {
    valid: res.error === null,
    error: res.error === null ? null : buildError(res.error)
  }
}

module.exports = validateResponse
