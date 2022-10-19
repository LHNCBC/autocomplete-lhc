import { TestPages } from '../support/testPages.js';
var BasePage = require('./basePage').BasePage;

var DirectivePage = function() {
  BasePage.call(this);

  // Directive-page properties
  this.inputElem = '#ac1';
  this.codeField = '#code';
  this.prePopElem = '#list1b'; // has pre-populated model
  this.searchListID = 'list3';
  this.searchList = '#'+this.searchListID;
  this.searchListModel = 'listFieldVal3'; // model name for searchList
  this.searchWithoutSug = '#list4b';  // search list without suggestions
  this.searchWithoutSugModel = 'listFieldVal4b';  // search list without suggestions
  this.prefetchCWEBlank = '#list5';
  this.prefetchCNEBlank = '#list6';
  this.prefetchWithCodeDefault = '#list7';
  this.optChangeTest = '#list8';
  this.btnOptChangeTest = '#btnList8';
  this.noURLTest = '#list9';

  // Multi-select CNE prefetch list
  var multiFieldID = 'multiPrefetchCNE';
  this.multiPrefetchCNE = this.multiField; // alias
  var multiPrefetchCNESectionCSS = '#multiPrefetchCNESection'
  this.multiFieldSelectedItemsCSS = multiPrefetchCNESectionCSS + ' .autocomp_selected li';
  this.multiFieldFirstSelectedCSS = multiPrefetchCNESectionCSS+' li:first-child button';
  this.multiFieldFirstSelectedSpan = this.multiFieldFirstSelectedCSS + ' span';

  // CNE list
  // For now the CNE list test is using the multi-select CNE list field
  this.cneListID = multiFieldID;
  this.cneListSel = '#'+this.cneListID;

if (false) {
// TBD -remove after other tests using this page are ported if there is anything
// left
  // Multi-select CWE prefetch list
  var multiPrefetchCWECSS = '#multiPrefetchCWE';
  this.multiPrefetchCWE = $(multiPrefetchCWECSS);
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection'
  this.multiPrefetchCWEFirstSelected =
    element(by.css(multiPrefetchCWESectionCSS + ' li:first-child button'));
  this.multiPrefetchCWESelected =
    element.all(by.css(multiPrefetchCWESectionCSS + ' button'));

  // Multi-select CWE search list
  this.multiSearchCWECSS = '#multiSearchCWE';
  this.multiSearchCWE = $(this.multiSearchCWECSS);
  var multiSearchCWESectionCSS = '#multiSearchCWESection'
  this.multiSearchCWEFirstSelected =
    element(by.css(multiSearchCWESectionCSS + ' li:first-child button'));
  this.multiSearchCWESelected =
    element.all(by.css(multiSearchCWESectionCSS + ' button'));
  this.multiSearchCWEModel = 'multiSearchCWEVal';


  // Multi-select CWE search list with pre-populated model value
  this.multiSearchCWEPrePopID = 'multiSearchCWEPrePop';
  this.multiSearchCWEPrePop = $('#'+this.multiSearchCWEPrePopID);
}
  this.openDirectiveTestPage = function() {
    cy.visit(TestPages.directiveTest);
  }
}

module.exports = new DirectivePage();
