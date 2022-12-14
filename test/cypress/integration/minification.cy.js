// Tests minified versions of files.
var po = require('../minifiedPages.js');
var EC = protractor.ExpectedConditions;

describe('minified files', function() {
  it('should produce working prefetch lists', function() {
    browser.ignoreSynchronization = true;
    po.openMinTest();
    po.prefetchList.click();
    expect(po.searchResults.isDisplayed()).toBe(true);
    browser.ignoreSynchronization = false;
  });

  it('should produce working search lists', function() {
    browser.ignoreSynchronization = true;
    po.openMinTest();
    po.searchList.click();
    po.searchList.sendKeys('a');
    expect(po.searchResults.isDisplayed()).toBe(true);
    browser.ignoreSynchronization = false;
  });

  describe('directive', function() {
    it('should produce working prefetch lists', function() {
      po.openMinTestAngular();
      po.prefetchList.click();
      expect(po.searchResults.isDisplayed()).toBe(true);
    });

    it('should produce working search lists', function() {
      po.openMinTestAngular();
      po.searchList.click();
      po.searchList.sendKeys('a');
      browser.wait(EC.visibilityOf(po.searchResults), 2000);
    });
  });
});
