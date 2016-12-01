// Page objects helpers for the directive test page
var BasePage = require('./basePage').BasePage;
var config = require('../config');

var DirectivePage = function() {
  BasePage.call(this);

  // Directive-page properties
  this.inputElem = $('#ac1');
  this.codeField = $('#code');
  this.prePopElem = $('#list1b'); // has pre-populated model
  this.searchList = $('#list3');
  this.searchListModel = 'listFieldVal3'; // model name for searchList
  this.searchWithSug = $('#list4');  // search list with suggestions
  this.searchWithSugModel = 'listFieldVal4'; // model name
  this.searchWithoutSug = $('#list4b');  // search list without suggestions
  this.searchWithoutSugModel = 'listFieldVal4b';  // search list without suggestions
  this.prefetchCWEBlank = $('#list5');
  this.prefetchCNEBlankSel = '#list6';
  this.prefetchCNEBlank = $(this.prefetchCNEBlankSel);
  this.prefetchWithCodeDefault = $('#list7');
  this.optChangeTest = $('#list8');
  this.btnOptChangeTest = $('#btnList8');
  this.noURLTestCSS = '#list9';
  this.noURLTest = $(this.noURLTestCSS);

  // Multi-select CNE prefetch list
  var multiFieldID = 'multiPrefetchCNE';
  this.multiField = $('#'+multiFieldID);
  this.multiPrefetchCNE = this.multiField; // alias
  var multiPrefetchCNESectionCSS = '#multiPrefetchCNESection'
  this.multiFieldSelectedItems = element.all(by.css(
    multiPrefetchCNESectionCSS + ' .autocomp_selected li'));
  var multiFieldFirstSelectedCSS = multiPrefetchCNESectionCSS+' li:first-child button';
  this.multiFieldFirstSelected = element.all(by.css(multiFieldFirstSelectedCSS)).first();
  this.multiFieldFirstSelectedSpan =
     element.all(by.css(multiFieldFirstSelectedCSS + ' span')).first();

  // CNE list
  // For now the CNE list test is using the multi-select CNE list field
  this.cneListID = multiFieldID;
  this.cneList = this.multiField;

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

  this.openDirectiveTestPage = function() {
    browser.get('http://localhost:'+config.port+
      '/test/protractor/directiveTest.html');
  }
}

module.exports = new DirectivePage();
