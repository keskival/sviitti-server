
const express = require('express');
const app = express();
const nano = require('nano')('http://localhost:5984');
const passport = require('passport');

const FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_APP_ID = '1678939655686347';
const keys = require('./keys.json');
// Remember to set this to correct value. Don't put it in GitHub.
const FACEBOOK_APP_SECRET = keys.FACEBOOK_APP_SECRET;
// For local testing, set sviitti in hosts file to point to 127.0.0.1
// This is needed for Facebook redirect authentication.
// For mobile clients we can't use this DNS name, we should have a stable server on the net.
// This address must be specifically allowed in the Facebook app settings:
// https://developers.facebook.com/apps/1678939655686347/settings/
const SERVER_ADDRESS = 'http://sviitti.td.local:8080';

const sviitti_db = nano.db.use('sviitti');

const PORT = process.env.PORT || 8080;

app.use(express.static('www'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
  
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: SERVER_ADDRESS + '/auth/facebook/callback',
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Sviitti server listening at http://%s:%s', host, port);
});
