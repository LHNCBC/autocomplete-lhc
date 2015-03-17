// Page objects helpers for the directive test page
var DirectivePage = function() {
  // General properties that could be shared with other page objects if we had
  // them.
  this.searchResults = $('#searchResults');
  this.firstSearchRes = $('#searchResults li:first-child');
  this.tenthSearchRes = $('#searchResults li:nth-child(10)');
  this.expandLink = $('#moreResults');
  this.firstSugLink = element.all(by.css('.ui-dialog a')).first(); // first suggestion
  this.suggestionDialog = element(by.css('.ui-dialog'));

  // Directive-page properties
  this.inputElem = $('#ac1');
  this.codeField = $('#code');
  this.prePopElem = $('#list1b'); // has pre-populated model
  this.cneListID = 'ac2';
  this.cneList = $('#'+this.cneListID);
  this.searchList = $('#list3');
  this.searchListModel = 'listFieldVal3'; // model name for searchList
  this.searchWithSug = $('#list4');  // search list with suggestions
  this.searchWithSugModel = 'listFieldVal4'; // model name

  // Multi-select prefetch list
  var multiFieldID = 'ac2';
  this.multiField = $('#'+multiFieldID);
  this.multiFieldSelectedItems = element.all(by.css('.autocomp_selected li'));
  var multiFieldFirstSelectedCSS = 'button:first-child';
  this.multiFieldFirstSelected = element.all(by.css(multiFieldFirstSelectedCSS)).first();
  this.multiFieldFirstSelectedSpan =
     element.all(by.css(multiFieldFirstSelectedCSS + ' span')).first();

  this.openDirectiveTestPage = function() {
    browser.get('http://localhost:3000/test/protractor/directiveTest.html');
  }
}

module.exports = new DirectivePage();
