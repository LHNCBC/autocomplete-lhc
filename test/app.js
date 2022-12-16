// A simple web server to serve the test files.
// Start with:  node app.js
// and browse to the port specified in config.js.
//
// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http'),
    path = require('path');
var config = require('./config');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');

// Set the document root to the package directory, which is the
// parent of the directory containing this script.
var docRoot = __dirname + '/..';

connect()
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
    .use(function(req, resp, next) {
       // Add a fake search response for testing
       var p = req.url;
       if (p.indexOf('/search') === 0) {
         resp.statusCode = 200;
         resp.setHeader('Content-Type', 'application/json');
         resp.end('[218,["2315","3982","2208","2179","7939","11192","4591"],'+
           'null,[["Back pain"],["Abdominal pain"],["Chest pain"],["Headache"],'+
           '["Poliomyelitis"],["Lower back pain"],["Cut (laceration)"]]]');
       }
       else if (p.indexOf('/form/test/autocompleter_test') === 0) {
         resp.statusCode = 200;
         resp.setHeader('Content-Type', 'text/html');
         resp.end('Form data posted');
       }
       else
         next();
     })
    .use(serveIndex(docRoot))
    .use(serveStatic(docRoot))
    .listen(config.port);
