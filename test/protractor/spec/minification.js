// Tests minified versions of files.
var po = require('../minifiedPages.js');

describe('minified files', function() {
  it('should work with just the autocomplete-lhc files minified', function() {
    browser.ignoreSynchronization = true;
    po.openMinTest1();
    po.prefetchList.click();
    expect(po.searchResults.isDisplayed()).toBe(true);
    browser.ignoreSynchronization = false;
  });

  it('should work with the autocomplete-lhc files minified with the jQuery UI '+
     'files', function() {
    browser.ignoreSynchronization = true;
    po.openMinTest2();
    po.prefetchList.click();
    expect(po.searchResults.isDisplayed()).toBe(true);
    browser.ignoreSynchronization = false;
  });

  it('should work with the autocomplete-lhc files minified with the jQuery '+
     'and jQuery UI files', function() {
    browser.ignoreSynchronization = true;
    po.openMinTest3();
    po.prefetchList.click();
    expect(po.searchResults.isDisplayed()).toBe(true);
    browser.ignoreSynchronization = false;
  });

});
