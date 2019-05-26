const https  = require('https')
const http   = require('http')
const config = require('./config')
const Joi    = require('joi')

/**
 * Validate data to be saved
 * @param   {Object}  data  Data to be saved
 * @return  {Boolean}       returns `true` if is valid and returns `false` if not
 */
function validate(data) {
  Joi.objectId = () => { return Joi.string().regex(/^[0-9a-fA-F]{24}$/) }
  const schema = Joi.object({
    objectId: Joi.objectId().required(),
    objectType: Joi.string().required(),
    data: Joi.object().required(),
    response: Joi.object().required()
  })
  return Joi.validate(data, schema)
}

/**
 * Request Function - Save log in DB
 * @param   {String}  protocol  Protocol (http / https)
 * @param   {Object}  bodyData  Data object that will be saved as in MS-Log
 * @return  {Promise}           returns result of saving log
 */
function request(protocol, bodyData) {
  // Create Log Options
  const opt = {
    host: config.host,
    port: config.port,
    path: '/v1/logs',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyData) }
  }
  const Protocol = (protocol === 'https') ? https : http
  return new Promise((resolve, reject) => {
    const request = Protocol.request(opt, (response) => {
      response.setEncoding('utf8')
      let body = ''
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => { resolve(JSON.parse(body)) })
    })
    request.on('error', (err) => {
      console.log('Error Save Log in MS-Logs: ', err)
      reject(err)
    })
    request.write(bodyData)
    request.end()
  })
}


/**
 * Save endpoint request & response in MS-Logs
 * @param   {Object}  err  Endpoint Error Object
 * @param   {Object}  req  Endpoint Request Object
 * @param   {Object}  res  Endpoint Response Object
 * @return  {Promise}      returns a result of saving log in MS-Logs
 */
function send(objectId, objectType, req, res) {
  
  validate({ objectId: objectId, objectType: objectType, data: req, response: res })
    .then(() => {
      const bodyData = JSON.stringify({
        objectId: objectId,
        objectType: objectType,
        method: req.method,
        data: {
          headers: req.headers,
          params: req.params,
          query: req.query,
          body: req.body,
          route: req.route,
          cookies: req.cookies,
          protocol: req.protocol,
          baseUrl: req.baseUrl,
          originalUrl: req.originalUrl,
          ip: req.ip,
          ips: req.ips,
          secure: req.secure,
          subdomains: req.subdomains
        },
        response: {
          statusCode: res.statusCode || 200,
          success: (typeof res.result != 'string'),
          result: res.result
        }
      })

        // Save log in DB
      request(config.protocol, bodyData)
        .catch(err => console.log('Error Save Log in MS-Logs: ', err) )       
    })
    .catch(err => { console.log('Error on Validation: ', err) })

}

module.exports = { send }
