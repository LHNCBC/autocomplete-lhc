import { TestPages } from './testPages.js';
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
  this.multiField = '#'+multiFieldID;
  this.multiPrefetchCNE = this.multiField; // alias
  var multiPrefetchCNESectionCSS = '#multiPrefetchCNESection'
  this.multiFieldSelectedItems = multiPrefetchCNESectionCSS + ' .autocomp_selected li';
  this.multiFieldFirstSelected = multiPrefetchCNESectionCSS+' li:first-child button';
  this.multiFieldFirstSelectedSpan = this.multiFieldFirstSelected + ' span';

  // CNE list
  // For now the CNE list test is using the multi-select CNE list field
  this.cneListID = multiFieldID;
  this.cneListSel = this.multiField;

  // Multi-select CWE prefetch list
  this.multiPrefetchCWE = '#multiPrefetchCWE';
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection'
  this.multiPrefetchCWEFirstSelected =
    multiPrefetchCWESectionCSS + ' li:first-child button';
  this.multiPrefetchCWESelected =
    multiPrefetchCWESectionCSS + ' button';

  // Multi-select CWE search list
  this.multiSearchCWE = '#multiSearchCWE';
  var multiSearchCWESectionCSS = '#multiSearchCWESection'
  this.multiSearchCWEFirstSelected =
    multiSearchCWESectionCSS + ' li:first-child button';
  this.multiSearchCWESelected =
    multiSearchCWESectionCSS + ' button';
  this.multiSearchCWEModel = 'multiSearchCWEVal';


  // Multi-select CWE search list with pre-populated model value
  this.multiSearchCWEPrePopID = 'multiSearchCWEPrePop';

  this.openDirectiveTestPage = function() {
    cy.visit(TestPages.directiveTest);
  }
}

export default new DirectivePage();
