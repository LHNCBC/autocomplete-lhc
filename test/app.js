// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http');

connect()
    .use(connect.static('.'))
    .use(connect.directory('.'))
    .listen(3000);
