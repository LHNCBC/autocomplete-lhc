// Page objects for the standard (i.e. non-directive) autocompleter test page
var BasePage = require('./basePage').BasePage;

var AutocompPage = function() {
  BasePage.call(this);

  this.nonField = $('#content');

  // Multi-select CWE prefetch list
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection';
  this.multiPrefetchCWE = $('#multi_sel_cwe');
  this.multiPrefetchCWEFirstSelected =
    element(by.css(multiPrefetchCWESectionCSS + ' button:first-child'));
  this.multiPrefetchCWESelected =
    element.all(by.css(multiPrefetchCWESectionCSS + ' button'));

  this.openTestPage = function() {
    browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
  }

};

module.exports = new AutocompPage();
