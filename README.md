express-api-user-management-signup
==================================

Boilerplate for quickly building login systems on top of apis. This module adds a user facade-backend with login / registration on top of that. Good startingpoint for DIY api management, processable thru webhooks.

<img src=".res/login.png">
<br><br>
<img src=".res/loggedin.png">
<br><br>
<img src=".res/webhooks.png">

## WARNING: BETA, not production ready

## Install: standalone

    sudo npm install coffee-script -g
    npm install express-api-user-management-signup
    WEBHOOKURL="http://localhost:8123" node app.js 
    # or 
    WEBHOOKURL="http://localhost:8123" coffee app.coffee

## Install: as library 

Use it directly in your existing express servercode:

    cd my-express-server-root
    npm install express-api-user-management-signup
    npm install jade mongodb stylus moment emailjs coffee-script

In your existing express-app, just put this above app.listen(....) :

    require("./usermanagement.js")(app,express);

where usermanagement.js looks something like this:

    var config = {
      webhook: {
        url:  "http://" + host + ":" + port,
        requestdata: { headers: { "x-some-token":"l1kj2k323"} }
      }
      mongo:       { 
        host: "localhost", 
        port: 27017, 
        name: "foo"
        // user: "foo"
        // password: "23kj4"
      }
      layout:      {
        title:       {
          brand:     "Projectname",
          welcome:   "Please login to your account"
        },
        menu:        {
          "Apidoc":  {target:"_blank",url:"/api/v1/doc"},
          "---":     "---",
          "Contact": {target:"_blank",url:"mailto:support@foo.com"}
        },
        formurl: "/js/form.json"
      }
    }
    module.parent.require("coffee-script/register")
    module.parent.require('express-api-user-management-signup/lib')(app,express,config)

## Features:

* coffeescript yay!
* New User Account Creation
* Secure Password Reset via Email
* Ability to Update / Delete Account
* Session Tracking for Logged-In Users
* Local Cookie Storage for Returning Users
* Blowfish-based Scheme Password Encryption
* end-user webhooks
* optional internal webhooks for flexibilitystorage (to integrate with api proxy like apiaxle or emailgateway e.g.)
* logging of db actions
* apikey support + regeneration of apikey
* works standalone and as express drop-in lib (the latter needs improvement eg. app.use)
* flexible form using (optionally remote) jsonschema

## Webhooks

The following webhooks are fired whenever 

* configuredhost + /add 
    when user adds account
* configuredhost + /update 
    when user updates account
* configuredhost + /update/pass 
    when user changes password
* configuredhost + /update/apikey
    when user regenerates apikey
* configuredhost + /login
    when user logs in
* configuredhost + /reset/pass
    when user resets password

Where configuredhost is defined by you ('http://mygateway.com/foo' e.g.)
These webhooks can be reacted upon by other middle/software in order to 
 send emails or update api proxy settings e.g.

## Todo

* url validation for webhook url in jsonschema
* smaller fonts jsonform validation error tooltips (to match the layout)

## Built with

* [Node.js](http://nodejs.org/) - Application Server
* [Express.js](http://expressjs.com/) - Node.js Web Framework
* [MongoDb](http://www.mongodb.org/) - Database Storage
* [Jade](http://jade-lang.com/) - HTML Templating Engine
* [Stylus](http://learnboost.github.com/stylus/) - CSS Preprocessor
* [EmailJS](http://github.com/eleith/emailjs) - Node.js > SMTP Server Middleware
* [Moment.js](http://momentjs.com/) - Lightweight Date Library
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) - UI Component & Layout Library
* [jsonform](http://developer.joshfire.com/doc/dev/ref/jsonform)
* [underscore](http://documentcloud.github.com/underscore)
* [JSV](https://github.com/garycourt/JSV)
