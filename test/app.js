// A simple web server to serve the test files.
// Start with:  node app.js
// and browse to port 3000 from localhost.
//
// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http');

// Set the document root to the package directory, which is the
// parent of the directory containing this script.
var docRoot = __dirname + '/..';

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
    .use(connect.static(docRoot))
    .use(connect.directory(docRoot))
    .listen(3000);
