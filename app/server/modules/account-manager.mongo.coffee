crypto = require('crypto')
mongo = require('mongodb')
MongoClient = mongo.MongoClient
moment = require('moment')
EventEmitter = require('events').EventEmitter
event = exports.event = new EventEmitter

### establish the database connection ###

db = {}
accounts = {}

exports.init = (cfg) ->
  dbPort = (cfg.port || 27017)
  dbHost = (cfg.host || 'localhost')
  dbName = (cfg.name || 'express-api-user-management-signup' )
  url = "mongodb://";
  url += cfg.username+":"+cfg.password+"@" if cfg.username && cfg.password
  url += dbHost+":"+dbPort+"/"+dbName

  MongoClient.connect url, (err,dbhandle) ->
    db = dbhandle
    status = 'connected to database'
    if !err
      accounts = db.collection('accounts')
    else
      status = "not "+status+" "+url+" :("
    console.log status

### login validation methods ###

exports.autoLogin = (user, pass, callback) ->
  accounts.findOne { user: user }, (e, o) ->
    if o
      if o.pass == pass then callback(o) else callback(null)
    else
      callback null
    event.emit 'login',
      pass: pass
      user: user
    return
  return

exports.manualLogin = (user, pass, callback) ->
  accounts.findOne { user: user }, (e, o) ->
    console.dir o
    if o == null
      callback 'user-not-found'
      event.emit 'login',
        reason: "user not found"
        succes: false
        pass: pass
        user: user
    else
      validatePassword pass, o.pass, (err, res) ->
        if res
          callback null, o
          event.emit 'login',
            reason: ""
            succes: true
            pass: pass
            user: user
        else
          callback 'invalid-password'
          event.emit 'login',
            reason: "invalid password entered"
            succes: false
            pass: pass
            user: user
        return
    return
  return

### record insertion, update & deletion methods ###

exports.addNewAccount = (newData, callback) ->
  accounts.findOne { user: newData.user }, (e, o) ->
    if o
      callback 'username-taken'
    else
      accounts.findOne { email: newData.email }, (e, o) ->
        if o
          callback 'email-taken'
        else
          saltAndHash newData.pass, (hash) ->
            newData.pass = hash
            generateApiKey hash, (apikey) ->
              newData.apikey = apikey 
              # append date stamp when record was created //
              newData.date = moment().format('MMMM Do YYYY, h:mm:ss a')
              newData.inactive = false 
              newData.log = [ newData.date+" added account: "+JSON.stringify(newData) ]
              accounts.insert newData, { safe: true }, callback
            event.emit 'addNewAccount', newData
            return
        return
    return
  return

exports.updateAccount = (newData, callback) ->
  accounts.findOne { user: newData.user }, (e, o) ->
    o.name = newData.name
    o.email = newData.email
    o.country = newData.country
    o.meta = newData.meta if newData.meta
    o.log = [] if o.log is undefined # backwards compatible with older versions
    if newData.pass == ''
      o.log.push moment().format('MMMM Do YYYY, h:mm:ss a')+" updated account with: "+JSON.stringify(newData) 
      accounts.save o, { safe: true }, (err) ->
        if err
          callback err
        else
          callback null, o
        return
    else
      saltAndHash newData.pass, (hash) ->
        o.pass = hash
        o.log.push moment().format('MMMM Do YYYY, h:mm:ss a')+" updated account + password"+JSON.stringify(newData) 
        accounts.save o, { safe: true}, (err) ->
          if err
            callback err
          else
            callback null, o
          event.emit 'updateAccount', o
          return
        return
    return
  return

exports.updateApiKey = (user, newApiKey, callback) ->
  accounts.findOne { user: user }, (e, o) ->
    if e
      callback e, null
    else
      o.apikey = newApiKey 
      console.dir o
      o.log.push moment().format('MMMM Do YYYY, h:mm:ss a')+" apikey updated to "+o.apikey
      accounts.save o, { safe: true }, callback 
      event.emit 'updateApikey', o
      callback e, o
    return
  return

exports.updatePassword = (email, newPass, callback) ->
  accounts.findOne { email: email }, (e, o) ->
    if e
      callback e, null
    else
      saltAndHash newPass, (hash) ->
        o.pass = hash
        accounts.save o, { safe: true }, callback
        event.emit 'updatePassword', o
        return
    return
  return

### account lookup methods ###

# don't delete because of 'oh I accidentally deleted our account'-requests
exports.deleteAccount = (id, callback) ->
  accounts.save { _id: getObjectId(id), inactive:true }, callback
  return

exports.purgeAccount = (id, callback) ->
  accounts.remove { _id: getObjectId(id) }, callback
  return

exports.getAccountByEmail = (email, callback) ->
  accounts.findOne { email: email }, (e, o) ->
    callback o
    return
  return

exports.validateResetLink = (email, passHash, callback) ->
  accounts.find { $and: [ {
    email: email
    pass: passHash
  } ] }, (e, o) ->
    callback if o then 'ok' else null
    return
  return

exports.getAllRecords = (callback) ->
  accounts.find().toArray (e, res) ->
    if e
      callback e
    else
      callback null, res
    return
  return

exports.delAllRecords = (callback) ->
  accounts.remove {}, callback
  # reset accounts collection for testing //
  return

### private encryption & validation methods ###

generateSalt = ->
  set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ'
  salt = ''
  i = 0
  while i < 10
    p = Math.floor(Math.random() * set.length)
    salt += set[p]
    i++
  salt

md5 = (str) ->
  crypto.createHash('md5').update(str).digest 'hex'

saltAndHash = (pass, callback) ->
  salt = generateSalt()
  callback salt + md5(pass + salt)
  return

validatePassword = (plainPass, hashedPass, callback) ->
  salt = String(hashedPass).substr(0, 10)
  validHash = salt + md5(plainPass + salt)
  callback null, hashedPass == validHash
  return

### auxiliary methods ###

getObjectId = (id) ->
  accounts.db.bson_serializer.ObjectID.createFromHexString id

findById = (id, callback) ->
  accounts.findOne { _id: getObjectId(id) }, (e, res) ->
    if e
      callback e
    else
      callback null, res
    return
  return

findByMultipleFields = (a, callback) ->
  # this takes an array of name/val pairs to search against {fieldName : 'value'} //
  accounts.find($or: a).toArray (e, results) ->
    if e
      callback e
    else
      callback null, results
    return
  return

generateApiKey = exports.generateApiKey = (hash,cb) ->
  saltAndHash hash, (apikey) ->
    cb( apikey.substr(0,24) )

# ---
# generated by js2coffee 2.0.3
