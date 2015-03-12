// Page objects helpers for the directive test page
var DirectivePage = function() {
  // General properties that could be shared with other page objects if we had
  // them.
  this.searchResults = $('#searchResults');
  this.firstSearchRes = $('#searchResults li:first-child');

  this.inputElem = element(by.id('ac1'));
  this.inputElem = $('#ac1');
  this.codeField = $('#code');

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
