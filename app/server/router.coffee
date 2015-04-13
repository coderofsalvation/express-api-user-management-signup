
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
      res.render 'login.jade', {title: layout.title.welcome, brand: layout.title.brand }
    else
      # attempt automatic login //
      AM.autoLogin req.cookies.user, req.cookies.pass, (o) ->
        if o != null
          req.session.user = o
          res.redirect '/home'
        else
          res.render 'login.jade', { brand: layout.title.brand, title: layout.title.welcome }
        return
    return

  app.post '/', (req, res) ->
    AM.manualLogin req.param('user'), req.param('pass'), (e, o) ->
      if !o
        res.send e, 400
      else
        req.session.user = o
        if req.param('remember-me') == 'true'
          updateCookieAge o, res
        res.send o, 200
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
    return

  app.post '/home', (req, res) ->
    if req.param('user') != undefined
      data = {
        user: req.param('user')
        name: req.param('name')
        email: req.param('email')
        country: req.param('country')
        pass: req.param('pass')
      }
      data.meta = JSON.parse( req.param('meta') ) if req.param('meta')
      console.dir data
      AM.updateAccount data, (e, o) ->
        if e
          res.send 'error-updating-account', 400
        else
          req.session.user = o
          # update the user's login cookies if they exists //
          if req.cookies.user != undefined and req.cookies.pass != undefined
            updateCookieAge o, res
          res.send 'ok', 200
        return
    else if req.param('logout') == 'true'
      res.clearCookie 'user'
      res.clearCookie 'pass'
      req.session.destroy (e) ->
        res.send 'ok', 200
        return
    return

  # creating new accounts //
  app.get '/signup', (req, res) ->
    res.render 'signup.jade',
      brand: layout.title.brand
      title: 'Signup'
      countries: CT
    return

  app.post '/signup', (req, res) ->
    AM.addNewAccount {
      name: req.param('name')
      email: req.param('email')
      user: req.param('user')
      pass: req.param('pass')
      country: req.param('country')
      meta: {}
    }, (e) ->
      if e
        res.send e, 400
      else
        res.send 'ok', 200
      return
    return

  # password reset //
  app.post '/lost-password', (req, res) ->
    # look up the user's account via their email //
    AM.getAccountByEmail req.param('email'), (o) ->
      if o
        res.send 'ok', 200
        EM.dispatchResetPasswordLink o, (e, m) ->
          # this callback takes a moment to return //
          # should add an ajax loader to give user feedback //
          if !e
            #	res.send('ok', 200);
          else
            res.send 'email-server-error', 400
            for k of e
              console.log 'error : ', k, e[k]
          return
      else
        res.send 'email-not-found', 400
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
        res.render 'reset.jade', { title: 'Reset Password', brand: layout.title.brand }
      return
    return

  app.post '/reset-password', (req, res) ->
    nPass = req.param('pass')
    # retrieve the user's email from the session to lookup their account and reset password //
    email = req.session.reset.email
    # destory the session immediately after retrieving the stored email //
    req.session.destroy()
    AM.updatePassword email, nPass, (e, o) ->
      if o
        res.send 'ok', 200
      else
        res.send 'unable to update password', 400
      return
    return

  # view & delete accounts //
  app.get '/print', (req, res) ->
    AM.getAllRecords (e, accounts) ->
      res.render.jade 'print',
        brand: layout.title.brand
        title: 'Account List'
        accts: accounts
      return
    return

  app.post '/delete', (req, res) ->
    AM.deleteAccount req.body.id, (e, obj) ->
      if !e
        res.clearCookie 'user'
        res.clearCookie 'pass'
        req.session.destroy (e) ->
          res.send 'ok', 200
          return
      else
        res.send 'record not found', 400
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
