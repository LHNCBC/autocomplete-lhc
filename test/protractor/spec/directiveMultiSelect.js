// Tests for directive-generated multi-select lists
var dp = require('../directivePage.js'); // dp = DirectivePage instance
helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;

describe('directive', function() {
  describe(': multi-select lists', function() {
    it('should have an empty selection area initially (without a default setting)',
       function() {
      dp.openDirectiveTestPage();
      expect(dp.multiField.isPresent()).toBe(true);
      var list = dp.multiField.element(by.xpath('../ul'));
      expect(list.isPresent()).toBe(true);
      var listItems = list.element(by.xpath('li'));
      expect(listItems.isPresent()).toBe(false);
    });

    it('should be blank (without a default setting)', function() {
      expect(dp.multiField.getAttribute('value')).toEqual('');
    });

    it ('should leave the field empty after a selection', function() {
      dp.multiField.click();
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
      dp.firstSearchRes.click();
      expect(dp.multiField.getAttribute('value')).toEqual('');
    });

    it('should store mutiple values on the data model', function() {
      dp.openDirectiveTestPage();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(null);
      dp.multiField.click();
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
      dp.firstSearchRes.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual([{text: 'Green', code: 'G'}]);
      // Now add a second item.
      dp.firstSearchRes.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Green', code: 'G'}, {text: 'Blue', code: 'B'}]);
      // Now remove the first item
      var button = dp.multiFieldFirstSelected.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Blue', code: 'B'}]);
      // Add an invalid value.  The existing value should not get lost if we
      // then add a second valid value.  (Note: dp.multiField is CNE).
      dp.multiField.sendKeys('zzz');
      dp.multiField.sendKeys(protractor.Key.TAB); // attempt to leave field
      expect(hasClass(dp.multiField, 'no_match')).toBe(true);
      expect(hasClass(dp.multiField, 'invalid')).toBe(true);
      dp.multiField.sendKeys(protractor.Key.TAB); // shift focus from field (clearing it)
      expect(dp.multiField.getAttribute('value')).toEqual('');
      // Add a valid item and check the model.
      dp.multiField.click();
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
      dp.firstSearchRes.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Blue', code: 'B'},{text: 'Green', code: 'G'}]);
      // Remove the first item again, to make sure that the new "span" element
      // within the button can receive clicks and still handle the event
      // correctly.
      dp.multiFieldFirstSelectedSpan.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Green', code: 'G'}]);
      // There should also just be one selected item on the page.
      expect(dp.multiFieldSelectedItems.count()).toEqual(1);
    });

    it('should not show matches for selected items', function() {
      dp.openDirectiveTestPage();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual(null);
      dp.multiField.click();
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
      dp.firstSearchRes.click();
      expect(dp.multiField.evaluate('listFieldVal2')).toEqual([{text: 'Green', code: 'G'}]);
      dp.multiField.sendKeys('Gr');
      // There should be no matches
      expect(dp.firstSearchRes.isPresent()).toBeFalsy();
    });

    it('should allow non-matching values for prefetch CWE lists', function () {
      // Add a non-list value
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(null);
      dp.multiPrefetchCWE.click();
      dp.multiPrefetchCWE.sendKeys('non-list val 1');
      dp.codeField.click(); // shift focus from field
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(
        [{text: 'non-list val 1'}]);
      expect(dp.multiPrefetchCWESelected.count()).toEqual(1);
      expect(dp.multiPrefetchCWE.getAttribute('value')).toEqual('');
      // Add a list value
      dp.multiPrefetchCWE.click();
      dp.firstSearchRes.click();
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(
        [{text: 'non-list val 1'}, {text: 'Green', code: 'G'}]);
      expect(dp.multiPrefetchCWESelected.count()).toEqual(2);
      // Add another non-list value
      dp.multiPrefetchCWE.click();
      dp.multiPrefetchCWE.sendKeys('non-list val 2');
      dp.codeField.click(); // shift focus from field
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(
        [{text: 'non-list val 1'}, {text: 'Green', code: 'G'},
         {text: 'non-list val 2'}]);
      expect(dp.multiPrefetchCWESelected.count()).toEqual(3);
      expect(dp.multiPrefetchCWE.getAttribute('value')).toEqual('');
      // Remove the first non-list value
      dp.multiPrefetchCWE.click();
      expect(dp.allSearchRes.count()).toBe(2);
      dp.multiPrefetchCWEFirstSelected.click();
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(
        [{text: 'Green', code: 'G'}, {text: 'non-list val 2'}]);
      expect(dp.multiPrefetchCWESelected.count()).toEqual(2);
      // A non-list item should not be added into the list when removed
      dp.multiPrefetchCWE.click();
      expect(dp.allSearchRes.count()).toBe(2);
      // Remove a list value
      dp.multiPrefetchCWEFirstSelected.click();
      expect(dp.multiPrefetchCWE.evaluate('multiPrefetchCWEVal')).toEqual(
        [{text: 'non-list val 2'}]);
      expect(dp.multiPrefetchCWESelected.count()).toEqual(1);
      dp.multiPrefetchCWE.click();
      expect(dp.allSearchRes.count()).toBe(3);
    });

    it('should allow non-matching values for search CWE lists', function () {
      dp.openDirectiveTestPage();
      // Add a non-list value
      expect(dp.multiSearchCWE.evaluate(dp.multiSearchCWEModel)).toEqual(null);
      dp.multiSearchCWE.click();
      dp.multiSearchCWE.sendKeys('non-list val 1');
      dp.codeField.click(); // shift focus from field
      expect(dp.multiSearchCWE.evaluate(dp.multiSearchCWEModel)).toEqual(
        [{text: 'non-list val 1'}]);
      expect(dp.multiSearchCWESelected.count()).toEqual(1);
      expect(dp.multiSearchCWE.getAttribute('value')).toEqual('');

      // Add a list value
      dp.multiSearchCWE.click();
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      dp.firstSearchRes.click();
      expect(dp.searchList.getAttribute('value')).toEqual('');
      expect(dp.multiSearchCWE.evaluate(dp.multiSearchCWEModel)).toEqual(
        [{text: 'non-list val 1'},
         {text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          term_icd9_code: '518.82'}]);
      expect(dp.multiSearchCWESelected.count()).toEqual(2);

      // Reload the page and add a list value first
      dp.openDirectiveTestPage();
      dp.multiSearchCWE.click();
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      dp.firstSearchRes.click();
      expect(dp.multiSearchCWESelected.count()).toEqual(1);
      expect(dp.multiSearchCWE.evaluate(dp.multiSearchCWEModel)).toEqual(
        [{text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          term_icd9_code: '518.82'}]);
      // Now add a non-list value
      dp.multiSearchCWE.sendKeys('non-list val 1');
      dp.codeField.click(); // shift focus from field
      expect(dp.multiSearchCWE.evaluate(dp.multiSearchCWEModel)).toEqual(
        [{text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          term_icd9_code: '518.82'}, {text: 'non-list val 1'}]);
      expect(dp.multiSearchCWESelected.count()).toEqual(2);
    });

    it('should not allow non-matching values in a CNE', function() {
      // Testing one particular case that is currently failing.
      dp.openDirectiveTestPage();
      // Add a non-list value
      expect(dp.multiPrefetchCNE.evaluate(dp.multiSearchCWEModel)).toEqual(null);
      dp.multiPrefetchCNE.click();
      dp.multiPrefetchCNE.sendKeys('non-list val 1');
      // Hit the enter key
      dp.multiPrefetchCNE.sendKeys(protractor.Key.ENTER);
      // Click outside the field
      dp.inputElem.click();
      // At this point the field should be cleared from its value (because there
      // were two attempts to leave the field without the field changing
      // inbetween.)
      expect(dp.multiPrefetchCNE.getAttribute('value')).toEqual('');
    });
  });

  it('should handle pre-populated model values', function () {
    expect(dp.checkSelected(dp.multiSearchCWEPrePopID, {'item1': 'a', 'item2': 'b'}));
  });
});


