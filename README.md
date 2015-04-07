express-api-user-management-signup
==================================

Boilerplate for quickly building login systems on top of apis. This module adds a user facade-backend with login / registration on top of that. Good startingpoint for DIY api management, processable thru webhooks.

<img src=".res/login.png">
<br><br>
<img src=".res/loggedin.png">

# WARNING: BETA, not production ready

# Install: standalone

    sudo npm install coffee-script -g
    npm install express-api-user-management-signup
    WEBHOOKURL="http://localhost:8123" coffee app.coffee
    # NON-COFFEESCRIPTERS: coffee -c app.coffee will convert it to app.js 

# Install: as library 

Use it directly in your existing express servercode:

    cd my-express-server-root
    npm install express-api-user-management-signup
    npm install jade mongodb stylus moment emailjs coffee-script

Using the code below, it will add extra routes to your existing express app:

    var express = require("express");
    var port = process.env.PORT || 8111
    var host = process.env.HOST || "127.0.0.1"
    var app = express();

    //>>>>>>>>>>>>  BEGIN OF CODE
    
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
        }
      }
    }
    require("coffee-script/register")
    require('express-api-user-management-signup/lib')(app,express,webhookurl,requestdata,mongocfg)

    //<<<<<<<<<<<<  END OF CODE

    app.listen(....)

# Features:

* coffeescript yay!
* New User Account Creation
* Secure Password Reset via Email
* Ability to Update / Delete Account
* Session Tracking for Logged-In Users
* Local Cookie Storage for Returning Users
* Blowfish-based Scheme Password Encryption
* extra webhooks for flexibilitystorage (to integrate with api proxy like apiaxle e.g.)
* apikey support + regeneration of apikey
* works standalone and as express drop-in lib (the latter needs improvement eg. app.use)

#### Webhooks

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

These webhooks can be reacted upon by other middle/software in order to 
 send emails or update api proxy settings e.g.

***

####Node-Login is built on top of the following libraries :

* [Node.js](http://nodejs.org/) - Application Server
* [Express.js](http://expressjs.com/) - Node.js Web Framework
* [MongoDb](http://www.mongodb.org/) - Database Storage
* [Jade](http://jade-lang.com/) - HTML Templating Engine
* [Stylus](http://learnboost.github.com/stylus/) - CSS Preprocessor
* [EmailJS](http://github.com/eleith/emailjs) - Node.js > SMTP Server Middleware
* [Moment.js](http://momentjs.com/) - Lightweight Date Library
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) - UI Component & Layout Library

####Credits

* [braitsch](http://github.com/braitsch) for his node-login boilerplate
