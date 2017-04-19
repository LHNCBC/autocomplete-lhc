// Page objects for the standard (i.e. non-directive) autocompleter test page
var BasePage = require('./basePage').BasePage;
var config = require('../config');

var AutocompPage = function() {
  BasePage.call(this);

  this.nonField = $('#main_title');
  this.prefetchCNEFieldName = 'race_or_ethnicity';
  this.prefetchCNE = $('#'+this.prefetchCNEFieldName);

  this.longOddCNECSS = '#long_odd_cne';
  this.longOddCNE = $(this.longOddCNECSS);
  this.longOddCNENoScrollCSS = '#long_odd_cne_no_scroll';
  this.longOddCNENoScroll = $(this.longOddCNENoScrollCSS);
  this.prefetchCWEID = 'prefetch_cwe';  // single-select
  this.prefetchCWE = $('#'+this.prefetchCWEID);  // single-select
  this.prefetchCWETokens = $('#prefetch_cwe_tokens');
  this.prefetchWithDefault = $('#prefetch_default_cne');
  this.searchCNECSS = '#fe_search_cne';
  this.searchCNE = $(this.searchCNECSS);
  this.searchCNETokens = $("#search_cne_tokens");
  this.searchCWEID = 'fe_search_cwe';
  this.searchCWE = $('#'+this.searchCWEID);
  this.itemNumMatchFieldID = 'item_num_match_test';
  this.itemNumMatchField = $('#'+this.itemNumMatchFieldID);
  this.alleleSearch = $('#allele_search');

  // Multi-select CNE prefetch list
  this.multiPrefetchCNEID = 'multi_sel_cne';

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

  // CWE prefetch list with headings without two-column flow
  this.headings1ColCWEID = 'headings_1col_cwe';
  this.headings1ColCWE = $('#'+this.headings1ColCWEID);

  // Multi-field lists
  this.multiFieldPrefetch = $('#multi_field_cwe');
  this.multiFieldPrefetchCol2 = $('#multi_field_cwe2'); // 2nd column
  this.multiFieldSearch = $('#multi_field_search_cwe');
  this.multiFieldSearch1Col = $('#multi_field_search_cwe2');
  this.multiSelectTableSearchID = 'table_format_multi_sel_search_cwe';
  this.multiSelectTableSearch = $('#'+this.multiSelectTableSearchID);
  this.multiFieldSearchHeaders = $('#multi_field_search_headers');

  this.testPageURL = 'http://localhost:'+config.port+
    '/test/protractor/autocomp_atr.html';

  this.openTestPage = function() {
    setAngularSite(false);
    // For some reason, reopening the same page leaves the window's scroll
    // position intact.  (This didn't used to happen, and is probably a bug, but
    // whether it is a bug with protractor, or webdriver-manager, I don't know.)
    // Get a blank page first, and then get the test page.
    browser.get('about:blank');
    browser.get(this.testPageURL);
  }

  // Returns the scroll position of the window
  this.windowScrollTop = function() {
    return browser.driver.executeScript('return jQuery(window).scrollTop()');
  }

};

module.exports = new AutocompPage();
