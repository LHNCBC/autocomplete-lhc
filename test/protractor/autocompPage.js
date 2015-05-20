// Page objects for the standard (i.e. non-directive) autocompleter test page
var BasePage = require('./basePage').BasePage;
var config = require('../config');

var AutocompPage = function() {
  BasePage.call(this);

  this.nonField = $('#content');

  this.longOddCNE = $('#long_odd_cne');
  this.longOddCNENoScrollCSS = '#long_odd_cne_no_scroll';
  this.longOddCNENoScroll = $(this.longOddCNENoScrollCSS);
  this.prefetchCWEID = 'prefetch_cwe';  // single-select
  this.prefetchCWE = $('#'+this.prefetchCWEID);  // single-select

  // Multi-select CWE prefetch list
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection';
  this.multiPrefetchCWEID = 'multi_sel_cwe';
  this.multiPrefetchCWE = $('#'+this.multiPrefetchCWEID);
  this.multiPrefetchCWEFirstSelected =
    element(by.css(multiPrefetchCWESectionCSS + ' li:first-child button'));
  this.multiPrefetchCWESelected =
    element.all(by.css(multiPrefetchCWESectionCSS + ' button'));

  // Multi-select CWE search list
  var multiSearchCWESectionCSS = '#multiSearchCWESection';
  this.multiSearchCWEID = 'multi_sel_search_cwe';
  this.multiSearchCWE = $('#'+this.multiSearchCWEID);
  this.multiSearchCWEFirstSelected =
    element(by.css(multiSearchCWESectionCSS + ' li:first-child button'));
  this.multiSearchCWESelected =
    element.all(by.css(multiSearchCWESectionCSS + ' button'));

  // Multi-select CWE prefetch list with headings
  var multiHeadingCWESectionCSS = '#multi_headings_cwe_section';
  this.multiHeadingCWEID = 'multi_headings_cwe';
  this.multiHeadingCWE = $('#'+this.multiHeadingCWEID);
  this.multiHeadingCWESelected =
    element.all(by.css(multiHeadingCWESectionCSS + ' button'));

  this.openTestPage = function() {
    browser.get('http://localhost:'+config.port+
      '/test/protractor/autocomp_atr.html');
  }

  // Returns the scroll position of the window
  this.windowScrollTop = function() {
    return browser.driver.executeScript('return jQuery(window).scrollTop()');
  }

};

module.exports = new AutocompPage();
