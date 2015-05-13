// Tests for multi-select lists
// See also:  directiveMultiSelect.js
var po = require('../autocompPage.js');

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
    po.firstSearchRes.click(); // firstSearchRes should now point to the second
    // Try keys
    po.multiSearchCWE.sendKeys(protractor.DOWN);
    po.multiSearchCWE.sendKeys(protractor.ENTER);
    po.multiSearchCWE.sendKeys(protractor.DOWN);
    po.multiSearchCWE.sendKeys(protractor.ENTER);

    expect(po.multiSearchCWESelected.count()).toEqual(4);
    expect(po.getSelected('multi_sel_search_cwe')).toEqual(
      [["2189", "2212", "2319", "2958"],
       ["Coronary artery disease (CAD)", "Arm pain", "Eye pain",
        "Joint pain (arthralgia)"] ])
  });
});

