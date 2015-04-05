module.exports = (app,router,requestdata) ->

  # initializing default request settings
  if !requestdata
    if !process.env.REQUEST
      process.env.REQUEST = "{}"
      console.log "using 'request' npm lib without any basic http authentication or auth-tokens"
      console.log "HINT: set env variable 'REQUEST='{headers: {x-api-token: \"234678k2jk3\"} }' to pass custom requestdata to the request object"
    requestdata = JSON.parse(process.env.REQUEST)
      
  if !process.env.WEBHOOK_URL
    process.env.WEBHOOK_URL = "http://localhost:9991/account"
    console.warn 'environment variable \'WEBHOOK_URL\' not set, default to value "'+process.env.WEBHOOK_URL+'"'
  console.log 'using webhook url: '+process.env.WEBHOOK_URL
  console.log 'warning: use webhooks only in an secure (https) intranet environment, you have been warned :)'

  request = require("request")
  
  callWebhook = (method, url, data) ->
    delete data["pass"] if data.pass
    payload = requestdata
    payload.url = process.env.WEBHOOK_URL+url
    payload.body = data
    payload.json = true
    request[method] payload, (err,response,body) ->
      console.log "triggering webhook: "+method+" "+payload.url

  router.AM.event.on 'addNewAccount', (data) ->
    callWebhook "post", "/add", data
  
  router.AM.event.on 'updateAccount', (data) ->
    callWebhook "post", "/update", data

  router.AM.event.on 'updatePassword', (data) ->
    callWebhook "post", "/update/pass", data
  
  router.AM.event.on 'login', (data) ->
    callWebhook "post", "/login", data

  router.EM.event.on 'resetPasswordLink', (data) -> 
    callWebhook "post", "/reset/pass", data
