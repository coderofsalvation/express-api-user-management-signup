
console.log "registered user signup routings"

module.exports = (app,layout,mongocfg) ->
  CT = @CT = require('./modules/country-list')
  AM = @AM = {}
  EM = @EM = require('./modules/email-dispatcher')
  AM = @AM = require('./modules/account-manager.mongo')
  AM.init mongocfg
  @layout = layout

  updateCookieAge = (o,res) ->
    res.cookie 'user', o.user, maxAge: 900000
    res.cookie 'pass', o.pass, maxAge: 900000

  # main login page //
  app.get '/', (req, res) ->
    # check if the user's credentials are saved in a cookie //
    if req.cookies.user == undefined or req.cookies.pass == undefined
      res.render 'login.jade', {
        title: layout.title.welcome 
        brand: layout.title.brand 
        googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
      }
    else
      # attempt automatic login //
      AM.autoLogin req.cookies.user, req.cookies.pass, (o) ->
        if o != null
          req.session.user = o
          res.redirect '/home'
        else
          res.render 'login.jade', { 
            brand: layout.title.brand
            title: layout.title.welcome 
            googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
          }
        return
    return

  app.post '/', (req, res) ->
    AM.manualLogin req.body.user, req.body.pass, (e, o) ->
      if !o
        res.status(400).send(e)
      else
        req.session.user = o
        if req.body['remember-me'] == 'true'
          updateCookieAge o, res
        res.status(200).send o
      return
    return

  # update apikey 
  app.post '/update/apikey', (req, res) ->
    # check if the user's credentials are saved in a cookie //
    data = {}
    response = {msg:"could not update apikey"}
    if req.cookies.user == undefined or req.cookies.pass == undefined
      response.msg = "session expired, please re-login"
      res.end JSON.stringify(response)
    else
      # attempt automatic login //
      AM.autoLogin req.cookies.user, req.cookies.pass, (o) ->
        if o == null
          response.msg = "could not load user, please re-login"
          res.end JSON.stringify(response)
        else
          req.session.user = o
          if req.cookies.user != undefined and req.cookies.pass != undefined
            updateCookieAge o, res
          d = new Date()
          AM.generateApiKey d.getMilliseconds()+d, (apikey) ->
            AM.updateApiKey o.user, apikey, (e, o) ->
              if e
                response.msg = "could not regenerate apikey for user "+o.user +", please try again later"
              else
                response.msg = "your new apikey is "+apikey
                response.apikey = apikey
                # update the user's login cookies if they exists //
              res.end JSON.stringify(response)
            return
        return

  # logged-in user homepage //
  app.get '/home', (req, res) ->
    if req.session.user == null
      # if user is not logged-in redirect back to login page //
      res.redirect '/'
    else
      res.render 'home.jade',
        metaformurl: layout.formurl
        menu: layout.menu
        brand: layout.title.brand
        countries: CT
        udata: req.session.user
        googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
    return

  app.post '/home', (req, res) ->
    if req.body.user != undefined
      data = {
        user: req.body.user
        name: req.body.name
        email: req.body.email
        country: req.body.country
        pass: req.body.pass
      }
      data.meta = JSON.parse( req.body['meta'] ) if req.params['meta']
      console.dir data
      AM.updateAccount data, (e, o) ->
        if e
          res.status(400).send 'error-updating-account'
        else
          req.session.user = o
          # update the user's login cookies if they exists //
          if req.cookies.user != undefined and req.cookies.pass != undefined
            updateCookieAge o, res
          res.status(200).send 'ok'
        return
    else if req.body['logout'] == 'true'
      res.clearCookie 'user'
      res.clearCookie 'pass'
      req.session.destroy (e) ->
        res.status(200).send 'ok'
        return
    return

  # creating new accounts //
  app.get '/signup', (req, res) ->
    res.render 'signup.jade',
      metaformurl: layout.formurl
      brand: layout.title.brand
      title: 'Signup'
      countries: CT
      googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
    return

  app.post '/signup', (req, res) ->
    console.dir req
    AM.addNewAccount {
      name: req.body['name']
      email: req.body['email']
      user: req.body['user']
      pass: req.body['pass']
      country: req.body['country']
      meta: {}
    }, (e) ->
      if e
        res.status(400).send e
      else
        res.status(200).send 'ok'
      return
    return

  # password reset //
  app.post '/lost-password', (req, res) ->
    # look up the user's account via their email //
    AM.getAccountByEmail req.body['email'], (o) ->
      if o
        res.status(200).send 'ok'
        EM.dispatchResetPasswordLink o, (e, m) ->
          # this callback takes a moment to return //
          # should add an ajax loader to give user feedback //
          if !e
            #	res.send('ok', 200);
          else
            res.status(400).send 'email-server-error'
            for k of e
              console.log 'error : ', k, e[k]
          return
      else
        res.status(400).send 'email-not-found'
      return
    return

  app.get '/reset-password', (req, res) ->
    email = req.query['e']
    passH = req.query['p']
    AM.validateResetLink email, passH, (e) ->
      if e != 'ok'
        res.redirect '/'
      else
        # save the user's email in a session instead of sending to the client //
        req.session.reset =
          email: email
          passHash: passH
        res.render 'reset.jade', { 
          title: 'Reset Password', brand: layout.title.brand 
          googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
        }
      return
    return

  app.post '/reset-password', (req, res) ->
    nPass = req.body['pass']
    # retrieve the user's email from the session to lookup their account and reset password //
    email = req.session.reset.email
    # destory the session immediately after retrieving the stored email //
    req.session.destroy()
    AM.updatePassword email, nPass, (e, o) ->
      if o
        res.status(200).send 'ok'
      else
        res.status(400).send 'unable to update password'
      return
    return

  # view & delete accounts (disabled because of security) //
  ###
  app.get '/print', (req, res) ->
    AM.getAllRecords (e, accounts) ->
      res.render.jade 'print',
        brand: layout.title.brand
        title: 'Account List'
        accts: accounts
        googleanalytics: process.env.GOOGLE_ANALYTICS_TOKEN
      return
    return
  ### 

  app.post '/delete', (req, res) ->
    AM.deleteAccount req.body.id, (e, obj) ->
      if !e
        res.clearCookie 'user'
        res.clearCookie 'pass'
        req.session.destroy (e) ->
          res.status(200).send 'ok'
          return
      else
        res.status(400).send 'record not found'
      return
    return

  app.get '/reset', (req, res) ->
    AM.delAllRecords ->
      res.redirect '/print'
      return
    return

  #app.get('*', function(req, res) { res.render('404.jade', { title: 'Page Not Found'}); });
  this

# ---
# generated by js2coffee 2.0.3
