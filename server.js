
var express = require('express');
var app = express();

app.use(express.static('www'));

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Sviitti server listening at http://%s:%s', host, port);
});
