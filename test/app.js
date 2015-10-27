// A simple web server to serve the test files.
// Start with:  node app.js
// and browse to port 3000 from localhost.
//
// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http'),
    path = require('path');
var config = require('./config');

// Set the document root to the package directory, which is the
// parent of the directory containing this script.
var docRoot = __dirname + '/..';

connect()
/*    .use(function(req, resp, next) {
        // Restrict access to localhost
        var remoteIP = req.connection.remoteAddress;
        if(remoteIP !== '127.0.0.1' && remoteIP !== '::1') {
          resp.statusCode = 403; // forbidden
          resp.end('403 Forbidden');
        }
        else {
          next();
        }
      })*/
    .use(function(req, resp, next) {
       // block access to files and directories beginning with '.'
       var p = req.url;
       var pathOkay = true;
       while (pathOkay && p !== '/') {
         if (path.basename(p).indexOf('.') === 0) {
           resp.statusCode = 403; // forbidden
           resp.end('403 Forbidden');
           pathOkay = false;
         }
         else
           p = path.dirname(p);
       }
       if (pathOkay)
         next();
     })
    .use(connect.static(docRoot))
    .use(connect.directory(docRoot))
    .listen(config.port);
