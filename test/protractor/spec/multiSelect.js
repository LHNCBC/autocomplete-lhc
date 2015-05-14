// Tests for multi-select lists
// See also:  directiveMultiSelect.js
var po = require('../autocompPage.js');
var hasClass = require('../test_helpers').hasClass;

describe('multi-select lists', function() {
  it('should allow non-matching values for prefetch CWE lists', function () {
    po.openTestPage();
    // Add a non-list value
    po.multiPrefetchCWE.click();
    po.multiPrefetchCWE.sendKeys('non-list val 1');
    po.nonField.click(); // shift focus from field
    expect(po.multiPrefetchCWESelected.count()).toEqual(1);
    expect(po.multiPrefetchCWE.getAttribute('value')).toEqual('');
    // Add a list value
    po.multiPrefetchCWE.click();
    po.firstSearchRes.click();
    expect(po.multiPrefetchCWESelected.count()).toEqual(2);
    // Add another non-list value
    po.multiPrefetchCWE.click();
    po.multiPrefetchCWE.sendKeys('non-list val 2');
    po.nonField.click(); // shift focus from field
    expect(po.multiPrefetchCWESelected.count()).toEqual(3);
    expect(po.multiPrefetchCWE.getAttribute('value')).toEqual('');
    // Remove the first non-list value
    po.multiPrefetchCWE.click();
    expect(po.allSearchRes.count()).toBe(2);
    po.multiPrefetchCWEFirstSelected.click();
    expect(po.multiPrefetchCWESelected.count()).toEqual(2);
    // A non-list item should not be added into the list when removed
    po.multiPrefetchCWE.click();
    expect(po.allSearchRes.count()).toBe(2);
    // Remove a list value
    po.multiPrefetchCWEFirstSelected.click();
    expect(po.multiPrefetchCWESelected.count()).toEqual(1);
    po.multiPrefetchCWE.click();
    expect(po.allSearchRes.count()).toBe(3);
  });
  it('should allow multiple items to be clicked without closing the list',
      function() {
    po.openTestPage();
    po.multiSearchCWE.click();
    po.multiSearchCWE.sendKeys('ar');
    po.firstSearchRes.click();
    // That element should be removed, and the new first element should now have
    // the "selected" class.
    expect(hasClass(po.firstSearchRes, 'selected')).toBe(true);
    po.firstSearchRes.click(); // firstSearchRes should now point to the second
    // Try keys.  The first item should still be selected.
    po.multiSearchCWE.sendKeys(protractor.Key.ENTER);
    // Confirm that the new firstSearchRes has the "selected" class
    expect(hasClass(po.firstSearchRes, 'selected')).toBe(true);
    po.multiSearchCWE.sendKeys(protractor.Key.ARROW_DOWN);
    // Now we should be on the second item
    po.multiSearchCWE.sendKeys(protractor.Key.ENTER);

    expect(po.multiSearchCWESelected.count()).toEqual(4);
    expect(po.getSelected('multi_sel_search_cwe')).toEqual(
      [["2212","2958","2189","11458"],
       ["Coronary artery disease (CAD)", "Arm pain", "Eye pain",
        "Kidney failure (short-term renal failure)"]]);
  });
});

