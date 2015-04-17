var helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;
var po = require('../autocompPage.js');

describe('Prefetch lists', function() {
  it('should show the list when clicked even if focused', function() {
    po.openTestPage();
    po.prefetchCWE.click();
    expect(po.listIsVisible()).toBeTruthy();
    po.firstSearchRes.click();
    expect(po.listIsVisible()).toBeFalsy();
    // Now click in the field.  The list should appear
    po.prefetchCWE.click();
    expect(po.listIsVisible()).toBeTruthy();
  });
});

