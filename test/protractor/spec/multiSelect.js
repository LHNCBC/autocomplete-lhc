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

  it('should return display strings and codes in the same order', function() {
    po.openTestPage();
    // Test both list items and non-list items.
    po.multiPrefetchCWE.click();
    po.firstSearchRes.click();
    po.multiPrefetchCWE.sendKeys('zzz');
    po.nonField.click(); // shift focus from field
    po.multiPrefetchCWE.click();
    po.firstSearchRes.click();
    // Note:  The orders of the following arrays depends on their storage in a
    // hash, so they could change;  However, the whatever the order, the order
    // of the code and display strings should correspond to each other.
    t2c =  {"Spanish": "LA44-3","French": "LA45-0", "zzz": null}
    po.checkSelected(po.multiPrefetchCWEID, t2c);
    // Delete the first two items and confirm the codes are correct.
    po.multiPrefetchCWEFirstSelected.click();
    delete t2c['Spanish'];
    po.checkSelected(po.multiPrefetchCWEID, t2c);
    po.multiPrefetchCWEFirstSelected.click();
    delete t2c['zzz'];
    po.checkSelected(po.multiPrefetchCWEID, t2c);
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
    var expected = {"Coronary artery disease (CAD)": "2212",
      "Arm pain": "2958", "Eye pain": "2189",
        "Kidney failure (short-term renal failure)": "11458"};
    po.checkSelected(po.multiSearchCWEID, expected);
  });

  it('should not allow the user to select a heading', function() {
    po.openTestPage();
    po.multiHeadingCWE.click();
    // The first item is a heading; we should not be able to click on it
    po.firstSearchRes.click();
    // Even though we clicked on the heading, the list should stay open
    expect(po.searchResults.isDisplayed()).toBeTruthy();
    // Try moving the first non-heading item and selecting that
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiHeadingCWE.sendKeys(protractor.Key.ENTER);
    expect(po.multiHeadingCWESelected.count()).toEqual(1);
    // In this list, after picking that one, there are two more items
    // in that section and then another heading.  Try moving to that heading and
    // selecting it.
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiHeadingCWE.sendKeys(protractor.Key.ENTER);
    // It should not have been added to the selction area.
    expect(po.multiHeadingCWESelected.count()).toEqual(1);
    // Also try clicking on that item
    po.fourthSearchRes.click();
    expect(po.multiHeadingCWESelected.count()).toEqual(1);
    // Select the item immediately after the heading.  It should be selectable.
    po.fifthSearchRes.click();
    expect(po.multiHeadingCWESelected.count()).toEqual(2);
    // The first list item should have lost its "selected" (highlighted)  state.
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(false);
    // Select the item immediately before the heading.
    po.thirdSearchRes.click();
    expect(po.multiHeadingCWESelected.count()).toEqual(3);
    // The heading should not be in a "selected" (highlighted) state
    // That heading is now result 3.  (Two before it were removed).
    expect(hasClass(po.thirdSearchRes, 'selected')).toBe(false);
    // The item after the heading should now have the "selected" state.
    expect(hasClass(po.fourthSearchRes, 'selected')).toBe(true);
    // Confirm the selected items are as expected.
    t2c = {"Chocolate": "FOOD-2","Cat": "OTHR-18","Egg": "FOOD-4"};
    po.checkSelected(po.multiHeadingCWEID, t2c);
  });


  it('should not have a weird problem with picking items from list with headings',
     function() {
    // There is currently an odd problem in which if you pick the first three
    // list items from po.multiHeadingCWE, and then refocus the field, you can't
    // pick the new first item, and the list closes.  No exception occurs.
    // It is probably due to other current bugs with the list headings.
    po.openTestPage();
    po.multiHeadingCWE.click();
    expect(po.searchResults.isDisplayed()).toBeTruthy();
    // Pick the first three items.  (Note:  firstSearchRes is a heading.)
    po.secondSearchRes.click();
    po.secondSearchRes.click();
    po.secondSearchRes.click();
    po.nonField.click(); // shift focus from field
    po.multiHeadingCWE.click();
    po.secondSearchRes.click();
    expect(po.multiHeadingCWESelected.count()).toEqual(4);
    expect(po.searchResults.isDisplayed()).toBeTruthy();
  });
});

