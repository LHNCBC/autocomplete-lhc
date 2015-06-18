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
  it('should show the full list when clicked even after typing', function() {
    po.openTestPage();
    po.prefetchCWE.click();
    po.prefetchCWE.sendKeys('Span');
    expect(po.shownItemCount()).toBe(1);
    // Now click in the field.  The full list should show.
    po.prefetchCWE.click();
    expect(po.shownItemCount()).toBe(3);
    // The list should not have a default selection, either.  The first item
    // should still be the first item.
    expect(po.firstSearchRes.getText()).toEqual('1:  Spanish');
    // Try again but with a non-matching value
    po.prefetchCWE.sendKeys('z');
    po.prefetchCWE.click();
    expect(po.shownItemCount()).toBe(3);
    expect(po.firstSearchRes.getText()).toEqual('1:  Spanish');
  });

  it('should allow selection by number', function() {
    po.openTestPage();
    po.prefetchCWE.click();
    po.prefetchCWE.sendKeys('2');
    expect(po.shownItemCount()).toBe(1);
    expect(po.firstSearchRes.getText()).toEqual('2:  French');
  });
});

