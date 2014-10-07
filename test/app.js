// Based on http://stackoverflow.com/a/12019645/360782
var connect = require('connect'),
    http = require('http');

connect()
    .use(connect.static('public'))
    .use(connect.directory('public'))
    .listen(3000);
