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
    expect(po.shownItemCount()).toBe(4);
    // The list should not have a default selection, either.  The first item
    // should still be the first item.
    expect(po.firstSearchRes.getText()).toEqual('1:  Spanish');
    // Try again but with a non-matching value
    po.prefetchCWE.sendKeys('z');
    po.prefetchCWE.click();
    expect(po.shownItemCount()).toBe(4);
    expect(po.firstSearchRes.getText()).toEqual('1:  Spanish');
  });

  it('should allow selection by number', function() {
    po.openTestPage();
    po.prefetchCWE.click();
    po.prefetchCWE.sendKeys('2');
    expect(po.shownItemCount()).toBe(1);
    expect(po.firstSearchRes.getText()).toEqual('2:  French');
  });

  it('should still show the list when there is a default', function() {
    // If the user tabs to a field with a default value, the list should be
    // open.
    po.openTestPage();
    // Start at the field prior to the field with the default.
    po.prefetchCWE.click();
    // Check that the field with the default is blank
    expect(po.prefetchWithDefault.getAttribute('value')).toBe('');

    // Tab into it
    po.prefetchCWE.sendKeys(protractor.Key.TAB);
    expect(po.prefetchWithDefault.getAttribute('value')).toBe('French');
    // Check that the list is showing by trying to get the text of the first
    // search result.  Protractor won't let us see the first result if the list
    // is hidden.
    expect(po.firstSearchRes.getText()).toEqual('1:  Spanish');
  });

  it('should escape HTML markup characters in list items', function() {
    po.prefetchCWE.click();
    expect(po.fourthSearchRes.getText()).toEqual('4:  escape<test>&');
    po.fourthSearchRes.click();
    expect(po.prefetchCWE.getAttribute('value')).toBe('escape<test>&');
    po.clearField(po.prefetchCWE);
    expect(po.prefetchCWE.getAttribute('value')).toBe('');
    po.prefetchCWE.sendKeys('e');
    expect(po.firstSearchRes.getText()).toEqual('4:  escape<test>&');
    po.firstSearchRes.click();
    expect(po.prefetchCWE.getAttribute('value')).toBe('escape<test>&');
  });
});

