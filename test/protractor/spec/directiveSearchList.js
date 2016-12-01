// Tests for directive-generated search lists
var dp = require('../directivePage.js'); // dp = DirectivePage instance
helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;

describe('directive', function() {
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
         term_icd9_code: '518.82'});

      // Try the expanded results list
      // Clear the field first
      dp.clearField(dp.searchList);
      dp.searchList.sendKeys('ar');
      expect(dp.searchList.isDisplayed()).toBeTruthy();
      expect(dp.expandLink.isDisplayed()).toBeTruthy();
      dp.expandLink.click();
      dp.tenthSearchRes.click();
      expect(dp.searchList.getAttribute('value')).toBe('Arrhythmia');
      expect(dp.searchList.evaluate(dp.searchListModel)).toEqual(
        {text: 'Arrhythmia', code: '3140', term_icd9_code: '427.9'});

      // Try a case with more than one field in the extra item data hash.
      dp.clearField(dp.searchList);
      dp.searchList.sendKeys('abc');
      dp.waitForSearchResults();
      dp.secondSearchRes.click();
      expect(dp.searchList.evaluate(dp.searchListModel)).toEqual(
        {text: 'zArm pain', code: '2958',
         term_icd9_code: '729.5', other_field: 'green'});

      // Try the suggestion list
      dp.searchWithSug.sendKeys('ar');
      // Click someplace else to leave 'ar' in the field
      dp.inputElem.click();
      expect(dp.suggestionDialog.isDisplayed()).toBeTruthy();
      expect(dp.firstSugLink.isDisplayed()).toBeTruthy();
      dp.firstSugLink.click();
      expect(dp.searchWithSug.getAttribute('value')).toBe('Aortic insufficiency');
      expect(dp.searchWithSug.evaluate(dp.searchWithSugModel)).toEqual(
        {text: 'Aortic insufficiency', code: '2886', term_icd9_code: '424.1'});


      // Try the search list that has suggestions turned off.
      dp.searchWithoutSug.sendKeys('ar');
      // Click someplace else to leave 'ar' in the field
      dp.inputElem.click();
      expect(dp.suggestionDialog.isDisplayed()).toBeFalsy();
      expect(dp.searchWithoutSug.getAttribute('value')).toBe('ar');
      // The only entry in the model should be the text, because it is not on
      // the list.
      expect(dp.searchWithoutSug.evaluate(dp.searchWithoutSugModel)).toEqual(
        {text: 'ar'});
    });

    it('should clear its cache if the URL changes', function() {
      // Confirm we get a certain result before changing the URL.  (It should be
      // different than the result that follows after changing the URL.)
      dp.clearField(dp.multiSearchCWE);
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      expect(dp.firstSearchRes.getInnerHtml()).toEqual('Adult respiratory distress syndrome (ARDS)');
      // Change the URL and confirm we get different results for the new list
      browser.driver.executeScript(
        "window.multiSearchCWEOpts.originalUrl = window.multiSearchCWEOpts.url;"+
        "window.multiSearchCWEOpts.url = '/form/get_search_res_list?fd_id=2163';"+
        "angular.element('"+dp.multiSearchCWECSS+"').scope().$digest();");
      dp.clearField(dp.multiSearchCWE);
      dp.multiSearchCWE.sendKeys('ar');
      dp.waitForSearchResults();
      expect(dp.firstSearchRes.getInnerHtml()).toEqual('Arm pain');
      // Restore the url
      browser.driver.executeScript(
        "window.multiSearchCWEOpts.url = window.multiSearchCWEOpts.originalUrl;"+
        "angular.element('"+dp.multiSearchCWECSS+"').scope().$digest();");
    });

    it('should provide suggestions when no list has been brought up', function() {
      // This was added for issue LF-95.  The suggestions box failed to appear
      // if the field had not previously shown a list when the field was left
      // with a changed value.
      dp.openDirectiveTestPage();
      dp.searchWithSug.click();
      dp.searchWithSug.sendKeys('a');
      // Click someplace else to leave 'a' in the field
      dp.inputElem.click();
      expect(dp.suggestionDialog.isDisplayed()).toBeTruthy();
    });

    it('should all the URL to be undefined', function() {
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
  });
});
