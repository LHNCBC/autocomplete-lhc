// Page objects common to the autocompleter test pages.
function BasePage() {
  var searchResID = 'searchResults';
  var searchResCSS = '#'+searchResID;
  this.searchResults = $(searchResCSS);
  this.firstSearchRes = $(searchResCSS + ' li:first-child');
  this.secondSearchRes = $(searchResCSS + ' li:nth-child(2)');
  this.tenthSearchRes = $(searchResCSS + ' li:nth-child(10)');
  this.allSearchRes = element.all(by.css(searchResCSS + ' li'));
  this.expandLink = $('#moreResults');
  this.firstSugLink = element.all(by.css('.ui-dialog a')).first(); // first suggestion
  this.suggestionDialog = element(by.css('.ui-dialog'));

  /**
   *  Returns the results of getSelectedCodes and getSelectedItems for the
   *  autocompleter on the given field ID.  The two are returned as elements of
   *  an array.
   * @param fieldID the field for the autocompleter.
   */
  this.getSelected = function(fieldID) {
    // Use a string rather than a function object so fieldID can be passed to
    // the browser.
    return browser.driver.executeScript(
      'var ac = $("'+fieldID+'").autocomp;'+
      'return [ac.getSelectedCodes(), ac.getSelectedItems()];'
    );
  };

  /**
   *  Returns true if the selection list is currently visible, and false if not.
   */
  this.listIsVisible = function() {
    return browser.driver.executeScript(
      'return $("'+searchResID+'").style.visibility === "visible"'
    );
  };
};

module.exports = {BasePage: BasePage};
