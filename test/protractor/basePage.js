// Page objects common to the autocompleter test pages.
function BasePage() {
  var searchResID = 'searchResults';
  var searchResCSS = '#'+searchResID;
  var searchResults = this.searchResults = $(searchResCSS);
  this.searchResCSS = searchResCSS;
  this.allSearchRes = element.all(by.css(searchResCSS + ' li'));
  this.expandLink = $('#moreResults');
  this.firstSugLink = element.all(by.css('.ui-dialog a')).first(); // first suggestion
  this.suggestionDialog = element(by.css('.ui-dialog'));
  this.suggestionDialogClose = element(by.css('.ui-dialog button'));
  this.completionOptionsCSS = '#completionOptions';
  this.completionOptionsScrollerCSS = '#completionOptionsScroller';
  this.completionOptionsScroller = $(this.completionOptionsScrollerCSS);

  /**
   *  Returns the list item in the search results list at the given position
   *  number (starting at 1).  The returned item might be a heading.
   * @param pos the item position number (starting at 1).
   */
  this.searchResult = function(pos) {
    return $(searchResCSS + ' li:nth-child('+pos+')');
  };

  /**
   *  Returns the item in the search results list at the given position
   *  number (starting at 1), assuming the table format is being used.  (This is
   *  the same thing as "searchResult" but for the table format.)  The returned
   *  item might be a heading.
   * @param pos the item position number (starting at 1).
   */
  this.tableSearchResult = function(pos) {
    return $(searchResCSS + ' tr:nth-child('+pos+')');
  };

  this.firstSearchRes = this.searchResult(1);
  this.secondSearchRes = this.searchResult(2);
  this.thirdSearchRes = this.searchResult(3);
  this.fourthSearchRes = this.searchResult(4);
  this.fifthSearchRes = this.searchResult(5);
  this.tenthSearchRes = this.searchResult(10);

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
      'var ac = jQuery("#'+fieldID+'")[0].autocomp;'+
      'return [ac.getSelectedCodes(), ac.getSelectedItems()];'
    );
  };


  /**
   *  Returns the results of getSelectedItems for the
   *  autocompleter on the given field ID.
   * @param fieldID the field for the autocompleter.
   */
  this.getSelectedItems = function(fieldID) {
    // Use a string rather than a function object so fieldID can be passed to
    // the browser.
    return browser.driver.executeScript(
      'var ac = jQuery("#'+fieldID+'")[0].autocomp;'+
      'return ac.getSelectedItems();'
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
      'return jQuery("#'+searchResID+'")[0].style.visibility === "visible"'
    );
  };

  /**
   *  Returns the number of items shown in the list.
   */
  this.shownItemCount = function() {
    return browser.driver.executeScript(
      'return Def.Autocompleter.listItemElements().length;'
    );
  };


  /**
   *  Erases the value in the given field.  Leaves the focus in the field
   *  afterward.
   */
  this.clearField = function(field) {
    field.click();
    field.sendKeys(protractor.Key.CONTROL, 'a'); // select all
    field.sendKeys(protractor.Key.BACK_SPACE); // clear the field
  };


  /**
   *  Returns the scroll position of the list's scrollbar.
   */
  this.listScrollPos = function() {
    return browser.driver.executeScript(
      'return jQuery("'+this.completionOptionsScrollerCSS+'")[0].scrollTop;'
    );
  };

  /**
   * Wait for the autocomplete results to be shown
   */
  this.waitForSearchResults = function() {
    browser.wait(function() {
      return searchResults.isDisplayed();
    }, 5000);
  };

};

module.exports = {BasePage: BasePage};
