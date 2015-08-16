bodyParser = require('body-parser')

module.exports = (app,express,cfg) ->
  app.set 'view engine', 'jade'
  app.set 'views', cfg.layout.theme + '/views'
  app.locals.pretty = true
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.json({limit: '50mb'})
  app.use express.urlencoded({limit: '50mb',extended:true})
  app.use express.session(secret: 'super-duper-secret-secret')
  app.use require('stylus').middleware(src: cfg.layout.theme )
  app.use express.methodOverride()
  app.use express.static cfg.layout.theme
  app.configure 'development', ->
    app.use express.errorHandler()
    return
  process.env.WEBHOOK_URL = cfg.webhook.url 
  process.env.WEBHOOK_URL = "http://127.0.0.1" if !process.env.WEBHOOK_URL
  router = require('./app/server/router') app, cfg.layout, cfg.mongo
  require('./app/server/webhook') app, router, cfg.webhook.requestdata
  return (req,res,next) ->
    next()
