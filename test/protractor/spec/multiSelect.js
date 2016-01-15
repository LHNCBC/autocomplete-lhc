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
    // hash, so they could change;  However, whatever the order, the order
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
    po.waitForSearchResults();
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
    // selecting it.  Note that we cannot normally move to that item, unless
    // there is another bug, so we have to force the index there.
    browser.driver.executeScript('return jQuery("#'+po.multiHeadingCWEID+
                                 '")[0].autocomp.index = 3');
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

  it('should not allow left/right arrows to pick headings', function() {
    po.openTestPage();
    // Pick the first non-item item in the multi-select heading CWE field
    po.multiHeadingCWE.click();
    po.secondSearchRes.click();
    // Now the list still has a heading as the first item, but the list is
    // displaying as two columns, and next the first heading in the right column
    // is a list item that we can get to with the arrow keys.
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_RIGHT);
    // Confirm that this is a two column list by checking the selected item
    expect(hasClass(po.tenthSearchRes, 'selected')).toBe(true);
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_UP);
    expect(hasClass(po.searchResult(9), 'selected')).toBe(true);
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_LEFT);
    expect(hasClass(po.firstSearchRes, 'selected')).toBe(false);
    expect(hasClass(po.searchResult(9), 'selected')).toBe(true);
  });

  it('should not prevent shift-tab from leaving the field even when an item is '+
     'selected', function() {
    po.openTestPage();
    po.multiPrefetchCWE.click();
    // Select first item
    po.multiPrefetchCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiPrefetchCWE.sendKeys(protractor.Key.SHIFT, protractor.Key.TAB);
    // Focus should be on the button for the selected item now
    expect(browser.driver.switchTo().activeElement().getAttribute('id')).
      not.toEqual(po.multiPrefetchCWEID);
  });

  it('should not select an item when the tab key is pressed if there is nothing' +
     ' in the field', function() {
    // Note that an item might be highlighted from a return-key
    // selection, but if the field is empty we will ignore that
    // because the user might just be trying to leave the field.
    po.openTestPage();
    po.multiPrefetchCWE.click();
    po.multiPrefetchCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiPrefetchCWE.sendKeys(protractor.Key.ENTER);
    expect(po.multiPrefetchCWESelected.count()).toBe(1);
    po.multiPrefetchCWE.sendKeys(protractor.Key.TAB);
    expect(po.multiPrefetchCWESelected.count()).toBe(1);
  });

  it('should not show "see more" in a search list after a click on an item',
    function() {
    // This is because in this case, unless the user previously arrowed down
    // into the list, preFieldFillVal_ won't be set, and the link won't show any
    // results (but will still show the hit count field).  There is no reason
    // why this couldn't be fixed, so that we could show "see more" in this
    // case, but until we need it, I am leaving this test here and these
    // comments to make sure the link doesn't start appearing without a fix
    // being in place.
    po.openTestPage();
    po.multiSearchCWE.click();
    po.multiSearchCWE.sendKeys('ar');
    po.waitForSearchResults();
    po.firstSearchRes.click();
    expect(po.expandLink.isDisplayed()).toBe(false); // i.e. not visible
  });

  it('should expand list when "see more" is clicked after an item is selected',
    function() {
    // Per the comments in the test above, currently the only way to have a "see
    // more" link after selecting an item is to select it with the keyboard.
    po.openTestPage();
    po.multiSearchCWE.click();
    po.multiSearchCWE.sendKeys('ar');
    po.multiSearchCWE.sendKeys(protractor.Key.ARROW_DOWN);
    po.multiSearchCWE.sendKeys(protractor.Key.ENTER);
    po.expandLink.click();
    expect(po.allSearchRes.count()).toBeGreaterThan(14);
  });
});

