// Page objects for the pages that test minified versions of files
var BasePage = require('./basePage').BasePage;
var config = require('../config');

var MinifiedPage = function() {
  BasePage.call(this);

  this.prefetchList = $('#field1');
  this.searchList = $('#field2');

  this.openMinTest = function() {
    setAngularSite(false);
    browser.get('http://localhost:'+config.port+
      '/test/protractor/minificationTest.html');
  };

  this.openMinTestAngular = function() {
    setAngularSite(false);
    browser.get('http://localhost:'+config.port+
      '/test/protractor/minificationTestAngular.html');
  };
};

module.exports = new MinifiedPage();
