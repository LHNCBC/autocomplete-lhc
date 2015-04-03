var fs = require('fs');
var path = require('path');
var escape = require('escape-html');
var async = require('async');
var demoDir = 'demos';

// Processes the SSI template
function processSSI() {
  var ssi = require("ssi");

  var inputDirectory = "ssi_templates";
  var outputDirectory = ".";
  var matcher = "/**/*.html";

  var includes = new ssi(inputDirectory, outputDirectory, matcher);
  includes.compile();
}

function addSourceBlockToDemo(demoSource) {
  return '<div class="demo">'+demoSource+'</div>'+
         '<div>'+
         '  <a class="showSource">[Show source]</a>'+
         '  <pre style="display:none" class="prettyprint lang-html"'+
         '   >'+escape(demoSource)+
         '  </pre>'+
         '</div>';
}

// Update escaped copies of demos
fs.readdir(demoDir, function(err, files) {
  if (err)
    console.log(err);
  else {
    var htmlPattern = '.*\\.html$';
    async.each(files, function(f, callback) {
      if (f.match(htmlPattern)) {
        var fPath = path.join(demoDir, f);
        fs.readFile(fPath, function(err, data) {
          if (err) {
            console.log(err);
            callback(err);
          }
          else {
            var demoPlusSource = addSourceBlockToDemo(data);
            fs.writeFile(fPath+'-plusSource', demoPlusSource, function(err) {
              if (err)
                console.log(err);
              callback(err);
            });
          }
        });
      }
      else
        callback();
    },
    function (err) {
      // All demo files have been processed at this point
      if (err)
        console.log(err)
      else
        processSSI();
    });
  }
});



