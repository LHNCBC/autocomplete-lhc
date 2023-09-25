// Page objects for the standard (i.e. non-directive) autocompleter test page
import { BasePage } from './basePage';
import { TestPages } from '../support/testPages.js';

var AutocompPage = function() {
  BasePage.call(this);

  this.nonField = '#main_title';
  this.prefetchCNEFieldName = 'race_or_ethnicity';
  this.prefetchCNE = '#'+this.prefetchCNEFieldName;

  this.longOddCNEID = 'long_odd_cne';
  this.longOddCNECSS = '#'+this.longOddCNEID;
  this.longOddCNE = this.longOddCNECSS;
  this.longOddCNENoScrollID = 'long_odd_cne_no_scroll';
  this.longOddCNENoScrollCSS = '#'+this.longOddCNENoScrollID;
  this.prefetchCWEID = 'prefetch_cwe';  // single-select
  this.prefetchCWE = '#'+this.prefetchCWEID;  // single-select
  this.prefetchCWETokens = '#prefetch_cwe_tokens';
  this.prefetchWithDefault = '#prefetch_default_cne';
  this.searchCNEID = 'fe_search_cne';
  this.searchCNESel = '#'+this.searchCNEID;
  this.searchCNETokens = "#search_cne_tokens";
  this.searchCWEID = 'fe_search_cwe';
  this.searchCWESel = '#' + this.searchCWEID;
  this.itemNumMatchFieldID = 'item_num_match_test';
  this.itemNumMatchField = '#'+this.itemNumMatchFieldID;
  this.alleleSearch = '#allele_search';
  this.csMatchSearch = '#cs_match_search';
  this.csMatchPrefetch = '#cs_match_prefetch';
  this.csMatchPrefetch_caseSenstiveSelection = '#cs_match_prefetch_caseSenstiveSelection';

  // Multi-select CNE prefetch list
  this.multiPrefetchCNEID = 'fe_multi_sel_cne';
  this.multiPrefetchCNE = '#'+this.multiPrefetchCNEID;

  // Multi-select CWE prefetch list
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection';
  this.multiPrefetchCWEID = 'multi_sel_cwe';
  this.multiPrefetchCWE = '#'+this.multiPrefetchCWEID;
  this.multiPrefetchCWEFirstSelected =
    multiPrefetchCWESectionCSS + ' li:first-child button';
  this.multiPrefetchCWESelected =
    multiPrefetchCWESectionCSS + ' button';

  // Multi-select CWE search list
  var multiSearchCWESectionCSS = '#multiSearchCWESection';
  this.multiSearchCWEID = 'multi_sel_search_cwe';
  this.multiSearchCWE = '#'+this.multiSearchCWEID;
  this.multiSearchCWEFirstSelected =
    multiSearchCWESectionCSS + ' li:first-child button';
  this.multiSearchCWESelected =
    multiSearchCWESectionCSS + ' button';

  // Multi-select CWE prefetch list with headings
  var multiHeadingCWESectionCSS = '#multi_headings_cwe_section';
  this.multiHeadingCWEID = 'multi_headings_cwe';
  this.multiHeadingCWE = '#'+this.multiHeadingCWEID;
  this.multiHeadingCWESelected =
    multiHeadingCWESectionCSS + ' button';

  // CWE prefetch list with headings without two-column flow
  this.headings1ColCWEID = 'headings_1col_cwe';
  this.headings1ColCWE = '#'+this.headings1ColCWEID;

  // Multi-field lists
  this.multiFieldPrefetch = '#multi_field_cwe';
  this.multiFieldPrefetchCol2 = '#multi_field_cwe2'; // 2nd column
  this.multiFieldSearchID = 'multi_field_search_cwe';
  this.multiFieldSearch = '#'+this.multiFieldSearchID;
  this.multiFieldSearch1Col = '#multi_field_search_cwe2';
  this.multiSelectTableSearchID = 'table_format_multi_sel_search_cwe';
  this.multiSelectTableSearch = '#'+this.multiSelectTableSearchID;
  this.multiFieldSearchHeaders = '#multi_field_search_headers';

  this.openTestPage = function() {
    // For some reason, reopening the same page leaves the window's scroll
    // position intact.  (This didn't used to happen, and is probably a bug, but
    // whether it is a bug with protractor, or webdriver-manager, I don't know.)
    // Get a blank page first, and then get the test page.
    //cy.visit('about:blank'); // maybe not necessary with Cypress?
    cy.visit(TestPages.autocomp_atr);
  }

  // Returns the scroll position of the window
  this.windowScrollTop = function() {
    return cy.window().its('scrollY');
  }

};

export default new AutocompPage();
