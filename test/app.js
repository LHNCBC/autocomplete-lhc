// A simple web server to serve the test files.
//
// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http');

connect()
    .use(function(req, resp, next) {
        var remoteIP = req.connection.remoteAddress;
        if(remoteIP !== '127.0.0.1' && remoteIP !== '::1') {
          resp.statusCode = 403; // forbidden
          resp.end('403 Forbidden');
        }
        else {
          next();
        }
      })
    .use(connect.static('.'))
    .use(connect.directory('.'))
    .listen(3000);
