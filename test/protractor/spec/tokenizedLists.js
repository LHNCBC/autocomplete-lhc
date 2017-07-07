// Tests related to the use of the "tokens" option.
var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('Prefetch list with tokens', function() {
  let field = po.prefetchCWETokens;
  describe('mouse selection', function() {
    it('should be able to autocomplete after a token character', function() {
      po.openTestPage();
      field.click();
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe(
        'American Indian or Alaska Native');
      field.sendKeys(',wh');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe(
        'American Indian or Alaska Native,White');
    });

    it('should be able to autocomplete before a token character', function() {
      po.openTestPage();
      field.click();
      field.sendKeys('As');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe('Asian');
      field.sendKeys(',wh');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe('Asian,White');
      // Arrow back to the first value, and edit it to bring up the list
      for (var i=0; i<6; ++i)
        field.sendKeys(protractor.Key.ARROW_LEFT);
      for (var i=0; i<5; ++i)
        field.sendKeys(protractor.Key.BACK_SPACE);
      field.sendKeys('U');
      // List should now say "Unknown"
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe('Unknown,White');
    });


    it('should be able to change the value', function() {
      // Testing for a bug related to token bounds not being reset properly.
      // First choose a short item to get the token bounds range set to
      // something small.
      po.openTestPage();
      field.click();
      po.waitForSearchResults();
      po.secondSearchRes.click();
      expect(field.getAttribute('value')).toBe('Asian');
      // Now click to get the full list and pick a longer item
      field.click();
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(field.getAttribute('value')).toBe('American Indian or Alaska Native');
      // Now click and pick the short value again
      field.click();
      po.waitForSearchResults();
      po.secondSearchRes.click();
      expect(field.getAttribute('value')).toBe('Asian');
    });
  });


  describe('arrow selection', function() {
    it('should allow down arrow to affect part of the field', function() {
      po.openTestPage();
      field.click();
      po.sendKeys(field, 'as');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian');
      // After a down arrow, the field's text is selected, so hit right arrow
      // before typing more text.
      field.sendKeys(protractor.Key.ARROW_RIGHT);
      field.sendKeys(',wh');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian,White');
    });

    it('should work for the second item', function() {
      po.openTestPage();
      field.click();
      po.sendKeys(field, 'am');
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('American Indian or Alaska Native');
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Black or African-American');
    });

    it('should allow the first value of the field to be changed', function() {
      // When there are two values in the field, and the first is edited, arrow
      // selection should work on that value.
      po.openTestPage();
      field.click();
      po.sendKeys(field, 'as');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian');
      field.sendKeys(protractor.Key.ARROW_RIGHT); // deselect to the right
      field.sendKeys(',wh');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian,White');
      // Checking here that only the 'White' was selected text
      expect(field.getAttribute('selectionStart')).toBe('6'); // after "Asian,"
      field.sendKeys(protractor.Key.ARROW_LEFT); // deselect to the left
      field.sendKeys(protractor.Key.ARROW_LEFT); // move before comma
      for (var i=0; i<4; ++i)
        field.sendKeys(protractor.Key.BACK_SPACE); // "A,White"
      expect(field.getAttribute('value')).toBe('A,White');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian,White');
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe(
        'American Indian or Alaska Native,White');
    });

    it('should notice which field value the user clicks on', function() {
      // This is difficult to test, because protractor does not let you specify
      // a caret position.  However, a click on the element should put the caret
      // in the middle of the visible field.  So, to test this, we'll put a long
      // value as the first value in the field, and then click and see if the
      // list affects that value.
      po.openTestPage();
      field.click();
      po.sendKeys(field, 'na');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe(
        'Native Hawaiian or Pacific Islander');
      field.sendKeys(protractor.Key.ARROW_RIGHT); // deselect to the right
      field.sendKeys(',wh');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe(
        'Native Hawaiian or Pacific Islander,White');
      field.sendKeys(protractor.Key.ARROW_RIGHT); // deselect to the right
      // Now click to bring the list full up and hopefully change the first
      // value.
      field.click();
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe(
        'American Indian or Alaska Native,White');
      // Check that just the first value is selected
      expect(field.getAttribute('selectionStart')).toBe('0');
      expect(field.getAttribute('selectionEnd')).toEqual(''+
        'American Indian or Alaska Native'.length);
    });

    it('should show the full list after token character', function() {
      po.openTestPage();
      field.click();
      field.sendKeys('as');
      po.waitForSearchResults();
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian');
      field.sendKeys(protractor.Key.ARROW_RIGHT);
      field.sendKeys(',');
      // Wait for the list to update, and check the result count
      browser.wait(function() {
        return po.shownItemCount().then(function(n) { return n === 7 });
      });
      expect(po.shownItemCount()).toBe(7);
      // Also check that the first item is still the normal first item
      // and not a suggestion
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Asian,Asian');
    });
  })
});


describe('Search list with tokens', function() {
  afterEach(function() {
    // Print out the browser's console messages (for debugging tests).
    // based on http://stackoverflow.com/a/24417431/360782
    browser.manage().logs().get('browser').then(function(browserLogs) {
      // browserLogs is an array of objects with level and message fields
      browserLogs.forEach(function(log){
         console.log(log.message);
      });
    });
  });

  let field = po.searchCNETokens;
  it('should close the list if there are no matches for the second term',
      function() {
    po.openTestPage();
    field.click();
    field.sendKeys('ar');
    po.waitForSearchResults();
    field.sendKeys(protractor.Key.ARROW_DOWN);
    expect(field.getAttribute('value')).toBe('Arachnoiditis');
    field.sendKeys(protractor.Key.ARROW_RIGHT);
    field.sendKeys(',qq'); // no matches
    po.waitForNoSearchResults();
    expect(po.shownItemCount()).toBe(0);
  });


  it('should show results for a second term after a token', function() {
    po.openTestPage();
    field.click();
    field.sendKeys('ar');
    po.waitForSearchResults();
    field.sendKeys(protractor.Key.ARROW_DOWN);
    expect(field.getAttribute('value')).toBe('Arachnoiditis');
    field.sendKeys(protractor.Key.ARROW_RIGHT);
    field.sendKeys(',ar');
    po.waitForSearchResults();
    field.sendKeys(protractor.Key.ARROW_DOWN);
    expect(field.getAttribute('value')).toBe('Arachnoiditis,Arachnoiditis');
  });
});
