// Tests for the documentation pages
var po = require('./pages.po');
browser.ignoreSynchronization = true;

describe('search autocompletion lists', function() {
  it('should function', function() {
    // Test for the correct placeholder, and that some list appears when
    // typing.
    po.openMainPage();
    var fields = po.searchDemoFields;
    for (var i=0, len=fields.length; i<len; ++i) {
      var field = fields[i];
      var fieldIndex = 'field '+i;
      field.click();
      expect(po.searchResults.isDisplayed()).toBe(false, fieldIndex);
      field.sendKeys('ar');
      browser.driver.wait(function () {
        return po.searchResults.isDisplayed();
      }, 10000, fieldIndex);
      // Close the list before moving clicking in the next field
      field.sendKeys(protractor.Key.ESCAPE);
    }
  });
});
