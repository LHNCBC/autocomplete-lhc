// Tests related to the use of the "tokens" option.
var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('Prefetch list with tokens', function() {
  var field = po.prefetchCWETokens;
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
  });


  describe('arrow selection', function() {
    it('should allow down arrow to affect part of the field', function() {
      po.openTestPage();
      field.click();
      field.sendKeys('as');
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
      field.sendKeys('am');
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('American Indian or Alaska Native');
      field.sendKeys(protractor.Key.ARROW_DOWN);
      expect(field.getAttribute('value')).toBe('Black or African-American');
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
