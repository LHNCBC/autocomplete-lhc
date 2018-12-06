// Tests for directive-generated search lists
var dp = require('../directivePage.js'); // dp = DirectivePage instance
helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;

fdescribe('directive', function() {
  describe(': search lists', function() {
    it('should show a result list when the user types', function() {
      dp.openDirectiveTestPage();
      dp.searchList.click();
      expect(dp.searchResults.isDisplayed()).toBeFalsy();
      dp.searchList.sendKeys('ar');
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
    });

    it('should have the extra data in the model for selected items', function() {
      // Pick the first search result from the previous test
      dp.firstSearchRes.click();
      expect(dp.searchList.getAttribute('value')).toBe(
       'Adult respiratory distress syndrome (ARDS)');
      expect(dp.searchList.evaluate(dp.searchListModel)).toEqual(
        {text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
         data: {term_icd9_code: '518.82'}});

      // Try the expanded results list
      // Clear the field first
      dp.clearField(dp.searchList);
      dp.searchList.sendKeys('ar');
      expect(dp.searchList.isDisplayed()).toBeTruthy();
      expect(dp.expandLink.isDisplayed()).toBeTruthy();
      dp.expandLink.click();
      dp.waitForSearchResults();
      browser.sleep(250); // wait for scrolling to start
      dp.waitForScrollToStop(dp.searchListID);
      dp.tenthSearchRes.click();
      expect(dp.searchList.getAttribute('value')).toBe('Arrhythmia');
      expect(dp.searchList.evaluate(dp.searchListModel)).toEqual(
        {text: 'Arrhythmia', code: '3140', data: {term_icd9_code: '427.9'}});

      // Try a case with more than one field in the extra item data hash.
      dp.clearField(dp.searchList);
      dp.searchList.sendKeys('abc');
      dp.waitForSearchResults();
      dp.secondSearchRes.click();
      expect(dp.searchList.evaluate(dp.searchListModel)).toEqual(
        {text: 'zArm pain', code: '2958',
         data: {term_icd9_code: '729.5', other_field: 'green'}});

      // Try the search list that has suggestions turned off.
      dp.searchWithoutSug.sendKeys('ar');
      // Click someplace else to leave 'ar' in the field
      dp.inputElem.click();
      expect(dp.searchWithoutSug.getAttribute('value')).toBe('ar');
      // The only entry in the model should be the text, because it is not on
      // the list.
      expect(dp.searchWithoutSug.evaluate(dp.searchWithoutSugModel)).toEqual(
        {text: 'ar', _notOnList: true});
    });

    it('should clear its cache if the URL changes', function() {
      // Confirm we get a certain result before changing the URL.  (It should be
      // different than the result that follows after changing the URL.)
      dp.clearField(dp.multiSearchCWE);
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      expect(dp.firstSearchRes.getText()).toEqual('Adult respiratory distress syndrome (ARDS)');
      // Change the URL and confirm we get different results for the new list
      browser.driver.executeScript(
        "window.multiSearchCWEOpts.originalUrl = window.multiSearchCWEOpts.url;"+
        "window.multiSearchCWEOpts.url = '/form/get_search_res_list?fd_id=2163';"+
        "angular.element('"+dp.multiSearchCWECSS+"').scope().$digest();");
      dp.clearField(dp.multiSearchCWE);
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      expect(dp.firstSearchRes.getText()).toEqual('Arm pain');
      // Restore the url
      browser.driver.executeScript(
        "window.multiSearchCWEOpts.url = window.multiSearchCWEOpts.originalUrl;"+
        "angular.element('"+dp.multiSearchCWECSS+"').scope().$digest();");
    });

    it('should allow the URL to be undefined', function() {
      dp.openDirectiveTestPage();
      dp.noURLTest.click();
      dp.noURLTest.sendKeys('ar');
      expect(dp.searchResults.isDisplayed()).toBeFalsy();
      // Set the URL to something and confirm the autocompleter starts working
      browser.driver.executeScript(
        "window.searchList9Opts.url = '/form/get_search_res_list?fd_id=2163';" +
        "angular.element('"+dp.noURLTestCSS+"').scope().$digest();");
      dp.clearField(dp.noURLTest);
      dp.noURLTest.sendKeys('ar');
      expect(dp.searchResults.isDisplayed()).toBeTruthy();
    });

    fdescribe('CWE lists', function() {
      it('should set _notOnList for off-list items, but not empty values',
          function() {
        dp.openDirectiveTestPage();
        var testField = dp.searchWithoutSug;
        testField.click();
        testField.sendKeys('zzz');
        testField.sendKeys(protractor.Key.TAB);
browser.sleep(10000);
        expect(dp.getModel(testField)).toEqual({text: 'zzz', _notOnList: true});
        // Now set it to an empty value.  The model value should be null.
        testField.click();
        dp.clearField(testField);
        testField.sendKeys(protractor.Key.TAB);
        expect(dp.getModel(testField)).toEqual(null);
      });
    });
  });
});
