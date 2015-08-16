bodyParser = require('body-parser')
cookieParser = require('cookie-parser')
expressSession = require('express-session')

module.exports = (app,express,cfg) ->
  app.set 'view engine', 'jade'
  app.set 'views', cfg.layout.theme + '/views'
  app.locals.pretty = true
  app.use bodyParser.json({limit: '50mb'})
  app.use bodyParser.urlencoded({limit: '50mb',extended:true})
  app.use cookieParser()
  app.use expressSession({secret:'somesecrettokenhere',resave:true,saveUninitialized:true})
  #sessionStore = new express.session.MemoryStore
  #app.use express.session secret: 'super-duper-secret-secret', store: sessionStore
  app.use require('stylus').middleware(src: cfg.layout.theme )
#  app.use express.methodOverride()
  app.use express.static cfg.layout.theme
  process.env.WEBHOOK_URL = cfg.webhook.url 
  process.env.WEBHOOK_URL = "http://127.0.0.1" if !process.env.WEBHOOK_URL
  router = require('./app/server/router') app, cfg.layout, cfg.mongo
  require('./app/server/webhook') app, router, cfg.webhook.requestdata
  return (req,res,next) ->
    next()
