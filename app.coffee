###*
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
  *
###

express = require('express')
http = require('http')

require("coffee-script/register")
usermanagement = require('./index.coffee')

app         = express()
port        = process.env.PORT or 3010 
webhookport = process.env.WEBHOOK_HOST or port
webhookhost = process.env.WEBHOOK_HOST or 'http://127.0.0.1'
  
cfg=
  webhook:
    url: 'http://' + webhookhost + ':' + webhookport
    requestdata: headers: 'x-some-token': 'l1kj2k323'
  mongo:
    host: 'localhost'
    port: 27017
    name: 'foo'
  layout:
    #theme: __dirname + '/app/public.basic'  # copy this dir to customize your own theme
    theme: __dirname + '/app/public.account' 
    title:
      brand: 'Projectname'
      welcome: 'Please login to your account'
    menu:
      'Apidoc':
        target: '_blank'
        url: '/api/v1/doc'
      '---': '---'
      'Contact':
        target: '_blank'
        url: 'mailto:support@foo.com'
    formurl: '/js/form.json'

console.dir cfg
app.set 'port', port 
app.use usermanagement app,express, cfg

http.createServer(app).listen app.get('port'), ->
  console.log 'Express server listening on port ' + app.get('port')
  return
