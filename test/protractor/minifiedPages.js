// Page objects for the pages that test minified versions of files
var BasePage = require('./basePage').BasePage;
var config = require('../config');

var MinifiedPage = function() {
  BasePage.call(this);

  this.prefetchList = $('#field1');

  this.openMinTest1 = function() {
    setAngularSite(false);
    browser.driver.get('http://localhost:'+config.port+
      '/test/protractor/minificationTest1.html');
  };

  this.openMinTest2 = function() {
    setAngularSite(false);
    browser.get('http://localhost:'+config.port+
      '/test/protractor/minificationTest2.html');
  };

  this.openMinTest3 = function() {
    setAngularSite(false);
    browser.get('http://localhost:'+config.port+
      '/test/protractor/minificationTest3.html');
  };
};

module.exports = new MinifiedPage();
