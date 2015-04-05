###*
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
  *
###

express = require('express')
http = require('http')
bodyParser = require('body-parser')
app = express()
app.configure ->
  app.set 'port', 8080
  app.set 'views', __dirname + '/app/server/views'
  app.set 'view engine', 'jade'
  app.locals.pretty = true
  #	app.use(express.favicon());
  #	app.use(express.logger('dev'));
  app.use bodyParser
  app.use express.cookieParser()
  app.use express.session(secret: 'super-duper-secret-secret')
  app.use express.methodOverride()
  app.use require('stylus').middleware(src: __dirname + '/app/public.account')
  app.use express.static(__dirname + '/app/public.account')
  return
app.configure 'development', ->
  app.use express.errorHandler()
  return
router = require('./app/server/router') app
require('./app/server/webhook') app, router
http.createServer(app).listen app.get('port'), ->
  console.log 'Express server listening on port ' + app.get('port')
  return
