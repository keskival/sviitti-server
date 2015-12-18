
const express = require('express');
const app = express();
const nano = require('nano')('http://localhost:5984');
const passport = require('passport');

const FACEBOOK_APP_ID = '1678939655686347';
const keys = require('./keys.json');
// Remember to set this to correct value. Don't put it in GitHub.
const FACEBOOK_APP_SECRET = keys.FACEBOOK_APP_SECRET;

const sviitti_db = nano.db.use('sviitti');

const PORT = process.env.PORT || 8080;

app.use(express.static('www'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Adding headers for allow origin.
app.use(function(req, res, next) {
  if (!res.headerSent) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE')
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.put('/auth/:mac',
  function(req, res) {
    // FIXME: Here we should put the client user info (name, fbid, btid, photo) to CouchDB indexed by MAC address.
});

app.put('/pos/:mac',
    function(req, res) {
      // FIXME: Here we should put the latest client position info (bsid) to CouchDB indexed by MAC address.
  });

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Sviitti server listening at http://%s:%s', host, port);
});
