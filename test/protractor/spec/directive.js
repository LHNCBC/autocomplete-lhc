var helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;
describe('directive', function() {
  var dp = require('../directivePage.js'); // dp = DirectivePage instance

  it('should create an area on the page for the list', function() {
    dp.openDirectiveTestPage();
    expect(dp.searchResults).not.toBeNull();
  });
  it('should assign an ID to the autocompleting field', function() {
    expect(dp.inputElem).not.toBeNull();
  });
  it('should show the list when the field is clicked', function() {
    expect(dp.searchResults.isDisplayed()).toBeFalsy();
    dp.inputElem.click();
    expect(dp.searchResults.isDisplayed()).toBeTruthy();
  });
  it('should load the default item code and value', function() {
    expect(dp.inputElem.getAttribute("value")).toEqual('Blue');
    expect(dp.codeField.getAttribute("value")).toEqual('B');
  });
  it('should not load the default item code and value when the model is already populated', function() {
    expect(dp.prePopElem.getAttribute("value")).toEqual('a pre-populated model value');
  });
  it('should populate the model when an item is selected', function() {
    dp.inputElem.click();
    expect(dp.searchResults.isDisplayed()).toBeTruthy();
    dp.firstSearchRes.click();
    // Change focus to send change event
    dp.codeField.click();
    expect(dp.inputElem.getAttribute("value")).toEqual('Green');
    expect(dp.codeField.getAttribute("value")).toEqual('G');
  });

  it('should assign ng-invalid-parse only for CNE', function() {
    // Try a CWE
    expect(hasClass(dp.prefetchCWEBlank, 'ng-invalid-parse')).toBe(false);
    dp.prefetchCWEBlank.click();
    dp.prefetchCWEBlank.sendKeys('zzz');
    // Change focus to send change event
    dp.codeField.click();
    expect(hasClass(dp.prefetchCWEBlank, 'ng-invalid-parse')).toBe(false);

    // The parser no longer returns the invalid signal (undefined) so
    // ng-invalid-parse never gets set.  See comments in the test below,
    // 'should allow undefined model values even for CNE'.
    // // Try a CNE
    // expect(hasClass(dp.prefetchCNEBlank, 'ng-invalid-parse')).toBe(false);
    // dp.prefetchCNEBlank.click();
    // dp.prefetchCNEBlank.sendKeys('zzz');
    // // Change focus to send change event
    // dp.codeField.click();
    // expect(hasClass(dp.prefetchCNEBlank, 'ng-invalid-parse')).toBe(true);
  });

  it('should allow undefined model values even for CNE', function() {
    // In LForms, if you use the keyboard to select a list value in a CNE, there
    // was an issue where it would register as an invalid value.
    // This was traced to the parser code which went ahead and returned the
    // model value (undefined) for CNE fields, but switched to null for CWE
    // fields (which doesn't trigger the invalid status).
    browser.driver.executeScript('angular.element("'+dp.prefetchCNEBlankSel+
      '").isolateScope().modelData = undefined;');
    dp.prefetchCNEBlank.click();
    dp.prefetchCNEBlank.sendKeys(protractor.Key.ARROW_DOWN);
    dp.prefetchCNEBlank.sendKeys(protractor.Key.TAB);
    expect(hasClass(dp.prefetchCNEBlank, 'ng-invalid-parse')).toBe(false);
  });


  describe(': CNE lists', function() {
    it('should warn user about invalid values', function() {
      dp.openDirectiveTestPage();
      expect(hasClass(dp.cneList, 'no_match')).toBe(false);
      expect(hasClass(dp.cneList, 'invalid')).toBe(false);

      dp.cneList.click();
      dp.cneList.sendKeys('zzz');
      dp.cneList.sendKeys(protractor.Key.TAB); // shift focus from field
      expect(hasClass(dp.cneList, 'no_match')).toBe(true);
      expect(hasClass(dp.cneList, 'invalid')).toBe(true);
      // Focus should be back in the field
      expect(browser.driver.switchTo().activeElement().getAttribute('id')).toEqual(dp.cneListID);
    });
  });

});

