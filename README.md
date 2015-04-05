express-api-user-management-signup
==================================

Boilerplate for quickly building login systems on top of apis. This module adds a user backend with login / registration on top of that. Good startingpoint for DIY api management. Built in Node.js with the following features :

# Install: standalone

    sudo npm install coffee-script -g
    npm install express-api-user-management-signup
    coffee app.coffee
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

    ...
    var webhookurl  = "http://" + host + ":" + port              /* webhooks endpoint                 */
    var requestdata = { headers: { "x-some-token":"l1kj2k323"} } /* optional: custom webhook requests */
    var mongocfg    = { dbName: "localhost", dbPort: 27017, dbName: "foo"}
    require("coffee-script/register")
    require('express-api-proxy-user-signup-frontend/lib')(app,express,webhookurl,requestdata,mongocfg)
    ...

    app.listen(....)

# Features:

* coffeescript yay!
* New User Account Creation
* Secure Password Reset via Email
* Ability to Update / Delete Account
* Session Tracking for Logged-In Users
* Local Cookie Storage for Returning Users
* Blowfish-based Scheme Password Encryption
* extra REST webhooks for flexibilitystorage
* works standalone and as express drop-in lib (the latter needs improvement eg. app.use)

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
