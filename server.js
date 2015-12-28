
const express = require('express');
const app = express();
const nano = require('nano')('http://localhost:5984');
const passport = require('passport');

const FACEBOOK_APP_ID = '1678939655686347';
const keys = require('./keys.json');
// Remember to set this to correct value. Don't put it in GitHub.
const FACEBOOK_APP_SECRET = keys.FACEBOOK_APP_SECRET;

const dbName = 'sviitti';

const PORT = process.env.PORT || 8080;

app.use(express.static('www'));

var db;

nano.db.list(function(error, databases) {
  if (error)
    return console.log('ERROR :: nano.db.list - %s', JSON.stringify(error));

  if (databases.indexOf(dbName) < 0) {
    nano.db.create(dbName, function(error, body, headers) {
      if (error)
        console.log('ERROR :: %s', JSON.stringify(error));
      console.log("Database didn't exist. Created.");
      db = nano.db.use(dbName)
    })
  } else {
    console.log("Using existing database.");
    db = nano.db.use(dbName)
  }
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

app.put('/update',
  function(req, res) {
    var user = req.body.user;
    var bestBssid = req.body.bestBssid;
    var btAddress = req.body.btAddress;
    console.log("Got user info update: " + JSON.stringify(user) + ",\nLocation: " + bestBssid + ",\nBT: " + btAddress);
    // Update user location into database: btAddress -> bestBssid.
    // Update user profile into database: btAddress -> user.
    db.get(btAddress, function(err, body) {
      if (!err) {
        body.user = user;
        body.bestBssid = bestBssid;
        console.log("Updating: " + JSON.stringify(body));
      } else {
        console.log("DB error: " + err);
        body = { _id: btAddress, user: user, bssid: bestBssid };
      }
      db.insert(body, function(err, body) {
        if (!err) {
          console.log("Saved: " + JSON.stringify(body));
          res.json(body);
        } else {
          console.log("DB error: " + err);
          res.json(err);
        }
      });
    });
  });

app.get('/bt/:btid',
  function(req, res) {
    var btAddress = req.params.btid;
    console.log("Got user info get: " + JSON.stringify(btAddress));
    db.get(btAddress, function(err, body) {
      if (!err) {
        console.log("Sending result: " + JSON.stringify(body));
        res.json(body);
      } else {
        console.log("DB error: " + err);
        res.json(err);
      }
    });
  });
  
var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Sviitti server listening at http://%s:%s', host, port);
});
