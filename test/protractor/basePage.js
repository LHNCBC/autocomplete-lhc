// Page objects common to the autocompleter test pages.
function BasePage() {
  var searchResID = 'searchResults';
  var searchResCSS = '#'+searchResID;
  this.searchResults = $(searchResCSS);
  this.firstSearchRes = $(searchResCSS + ' li:first-child');
  this.secondSearchRes = $(searchResCSS + ' li:nth-child(2)');
  this.thirdSearchRes = $(searchResCSS + ' li:nth-child(4)');
  this.fourthSearchRes = $(searchResCSS + ' li:nth-child(4)');
  this.fifthSearchRes = $(searchResCSS + ' li:nth-child(5)');
  this.tenthSearchRes = $(searchResCSS + ' li:nth-child(10)');
  this.allSearchRes = element.all(by.css(searchResCSS + ' li'));
  this.expandLink = $('#moreResults');
  this.firstSugLink = element.all(by.css('.ui-dialog a')).first(); // first suggestion
  this.suggestionDialog = element(by.css('.ui-dialog'));
  this.suggestionDialogClose = element(by.css('.ui-dialog button'));


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
   *  Checks the values of getSelectedCodes and getSelectedItems for the
   *  autocompleter on the given field ID.
   * @param fieldID the field for the autocompleter.
   * @param t2c a hash from display strings to code values.  (If there are no
   * code values, the hash still must be passed, but the values should be null.)
   */
  this.checkSelected = function(fieldID, t2c) {
    t2c = JSON.parse(JSON.stringify(t2c)); // the checks are done later, so clone
    this.getSelected(fieldID).then(function(data) {
      var codes = data[0];
      var texts = data[1];
      var expectedLength = Object.keys(t2c).length;
      expect(codes.length).toBe(expectedLength);
      expect(texts.length).toBe(expectedLength);
      var actualT2C = {};
      for (var i=0; i<expectedLength; ++i)
        actualT2C[texts[i]] = codes[i];
      expect(actualT2C).toEqual(t2c);
    });
  };


  /**
   *  Returns true if the selection list is currently visible, and false if not.
   */
  this.listIsVisible = function() {
    return browser.driver.executeScript(
      'return $("'+searchResID+'").style.visibility === "visible"'
    );
  };

  /**
   *  Returns the number of items shown in the list.
   */
  this.shownItemCount = function() {
    return browser.driver.executeScript(
      'return $("completionOptions").down().childNodes.length'
    );
  };
};

module.exports = {BasePage: BasePage};
