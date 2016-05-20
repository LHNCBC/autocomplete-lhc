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
    po.waitForSearchResults();
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
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(1);
    expect(po.firstSearchRes.getText()).toEqual('2:  French');
  });

  it('should default when picked by number to the item whose number is a full'+
     ' match even when that item is not the shortest matching item', function() {

    expect(po.longOddCNE.getAttribute('value')).toBe(''); // precondition
    po.longOddCNE.click();
    po.longOddCNE.sendKeys('1');
    // The shortest matching item is "11: Nutrition".  Make sure it picks #1.
    po.longOddCNE.sendKeys(protractor.Key.TAB);
    expect(po.longOddCNE.getAttribute('value')).toBe('Allergies and such');
  });

  it('should default when picked by number to the item whose number is a full'+
     ' match even when that item is found after the desired number of matches',
     function() {

    expect(po.itemNumMatchField.getAttribute('value')).toBe(''); // precondition
    po.nonField.click(); // close open list
    po.itemNumMatchField.click();
    po.itemNumMatchField.sendKeys('20');
    // All the items match "20".  Make sure it picks #20.
    po.itemNumMatchField.sendKeys(protractor.Key.TAB);
    expect(po.itemNumMatchField.getAttribute('value')).toBe('item 20 containing 20');
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
    po.waitForSearchResults();
    expect(po.firstSearchRes.getText()).toEqual('4:  escape<test>&');
    po.firstSearchRes.click();
    expect(po.prefetchCWE.getAttribute('value')).toBe('escape<test>&');
  });

  it('should allow an element to be passed to the constructor', function() {
    var p = $('#prefetch_for_el');
    expect(po.listIsVisible()).toBeFalsy();
    p.click();
    po.waitForSearchResults();
    expect(po.listIsVisible()).toBeTruthy();
    po.firstSearchRes.click();
    expect(p.getAttribute('value')).toBe('Spanish');
  });
});

