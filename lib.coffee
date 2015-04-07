module.exports = (app,express,cfg) ->
  app.set 'views', __dirname + '/app/server/views'
  app.locals.pretty = true
  app.use express.cookieParser()
  #app.use express.bodyParser()
  app.use express.urlencoded()
  app.use express.json()
  app.use express.session(secret: 'super-duper-secret-secret')
  app.use require('stylus').middleware(src: __dirname + '/app/public.account')
  app.use express.static(__dirname + '/app/public.account')
  process.env.WEBHOOK_URL = cfg.webhook.url 
  process.env.WEBHOOK_URL = "http://127.0.0.1" if !process.env.WEBHOOK_URL
  router = require('./app/server/router') app, cfg.layout, cfg.mongo
  require('./app/server/webhook') app, router, cfg.webhook.requestdata
