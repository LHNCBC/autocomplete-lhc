var helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;
var po = require('../autocompPage.js');

describe('autocomp', function() {
  var searchResults = $('#searchResults');
  var raceField = po.prefetchCNE;
  var searchCNE =  po.searchCNE;
  var suggestionMode0CWE = $('#fe_search0_cwe');
  var suggestionMode1CWE = po.searchCWE;
  var suggestionMode2CWE = $('#fe_search2_cwe');

  it('should respond to the suggestion mode setting',
     function() {
    po.openTestPage();
    suggestionMode0CWE.click();
    suggestionMode0CWE.sendKeys('arm');
    po.waitForSearchResults();
    expect(searchResults.isDisplayed()).toBeTruthy();
    // In suggestion mode 0, the first element should be what is alphabetically
    // first.
    expect(po.firstSearchRes.getInnerHtml()).toEqual('Arm painzzzzz');
    // Backspace to erase the field, or the non-match suggestions dialog will
    // appear (for the other kind of suggestion).
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);

    suggestionMode1CWE.click();
    suggestionMode1CWE.sendKeys('arm');
    po.waitForSearchResults();
    // In suggesion mode 1, the first element should be the shortest item
    // starting with the input text.
    expect(po.firstSearchRes.getInnerHtml()).toEqual('Arm z');
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);

    suggestionMode2CWE.click();
    suggestionMode2CWE.sendKeys('arm');
    po.waitForSearchResults();

    // In suggestion mode 2, the first element should be the first returned in
    // the AJAX call.
    expect(po.firstSearchRes.getInnerHtml()).toEqual('Coronary artery disease (CAD)');
    suggestionMode2CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode2CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode2CWE.sendKeys(protractor.Key.BACK_SPACE);

    // Confirm that the default is mode 1.
    // "Asian" is the short match and should be offered as a default
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('a');
    po.waitForSearchResults();
    po.firstSearchRes.click();
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Asian');

    // The suggestion should not be offered if the user clicks in the field to
    // see the full list.  (A suggestion should be made only when the user is
    // typing.)
    po.nonField.click();
    po.prefetchCNE.click();
    po.firstSearchRes.click();
    expect(po.prefetchCNE.getAttribute('value')).toEqual(
      'American Indian or Alaska Native');
  });


  it('should not show the list in response to a shift or control key being held down',
     function() {
    po.openTestPage();
    var inputElem = raceField;
    inputElem.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
    inputElem.sendKeys(protractor.Key.ESCAPE);
    expect(searchResults.isDisplayed()).toBeFalsy();
    // Now, if we send control or shift, the list should not redisplay
    inputElem.sendKeys(protractor.Key.CONTROL);
    expect(searchResults.isDisplayed()).toBeFalsy();
    inputElem.sendKeys(protractor.Key.SHIFT);
    expect(searchResults.isDisplayed()).toBeFalsy();
    // But if we type an backspace, the list should display
    inputElem.sendKeys(protractor.Key.BACK_SPACE);
    expect(searchResults.isDisplayed()).toBeTruthy();
  });


  it('should not shift the selected item when the control key is down',
     function() {
    po.openTestPage();
    raceField.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
    raceField.sendKeys(protractor.Key.ARROW_DOWN); // first item
    raceField.sendKeys(protractor.Key.ARROW_DOWN); // second item
    expect(raceField.getAttribute('value')).toBe('Asian');
    raceField.sendKeys(protractor.Key.CONTROL, protractor.Key.ARROW_DOWN);
    // second item should still be selected
    expect(raceField.getAttribute('value')).toBe('Asian');

    // Now try a search list
    searchCNE.click();
    searchCNE.sendKeys('ar');
    expect(searchResults.isDisplayed()).toBeTruthy();
    searchCNE.sendKeys(protractor.Key.ARROW_DOWN); // first item
    expect(searchCNE.getAttribute('value')).toBe('Arachnoiditis');
    searchCNE.sendKeys(protractor.Key.CONTROL, protractor.Key.ARROW_DOWN);
    // First item should still be selected
    expect(searchCNE.getAttribute('value')).toBe('Arachnoiditis');
  });


  it('single select lists should store correct codes for non-list entries',
      function() {
    // Here we are testing two cases.  First, we test changing a list entry to a
    // non-list entry.  Second, we test clearing a non-list entry.
    po.openTestPage();
    // Check initial stored values of prefetchCWE
    var selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([[], []]); // no codes or values
    // Select an item from the list
    po.prefetchCWE.click();
    po.firstSearchRes.click();
    selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([["LA44-3"], ["Spanish"]]);
    // Change the value to a non-list item
    po.prefetchCWE.sendKeys('zzz');
    po.nonField.click(); // to remove focus from prefetchCWE
    selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([[null], ["Spanishzzz"]]);
    // Select an item again.
    po.prefetchCWE.click();
    po.firstSearchRes.click();
    selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([["LA44-3"], ["Spanish"]]);
    // For completeness, pick another coded item, this time by typing
    var b = protractor.Key.BACK_SPACE;
    po.nonField.click();
    po.prefetchCWE.click();
    po.prefetchCWE.sendKeys(b, b, b, b, b, b, b); // erase previous entry
    po.prefetchCWE.sendKeys('French');
    po.nonField.click();
    selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([["LA45-0"], ["French"]]);
    // Now clear the field
    po.prefetchCWE.clear();
    selectedData = po.getSelected(po.prefetchCWEID);
    expect(selectedData).toEqual([[], []]);
  });


  it('should send expected keys with list selection events', function() {
    // It was noted that the documented keys on the list selection event data
    // object was out of date with respect to the actual code.  Hopefully a test
    // here will help stabilize that.
    po.openTestPage();
    browser.driver.executeScript(
      'window.prefetchCWEEventData = null;'+
      'Def.Autocompleter.Event.observeListSelections("'+po.prefetchCWEID+'",'+
        'function(eventData) {'+
          'window.prefetchCWEEventData = eventData;'+
        '}'+
      ');'
    );
    po.prefetchCWE.click();
    po.firstSearchRes.click();
    var eventData = browser.driver.executeScript('return window.prefetchCWEEventData');
    // If you updated the keys in this hash, please make sure the documentation
    // in autoCompEvents.js (observeListSelections) is also up to date.
    expect(eventData).toEqual({val_typed_in: '', final_val: 'Spanish',
      used_list: true, input_method: 'clicked', on_list: true,
      item_code: 'LA44-3', removed: false,
      list: ['Spanish', 'French', 'Other', 'escape<test>&'],
      field_id: po.prefetchCWEID});
  });


  it('should handle left/right arrows for two-column lists', function() {
    po.openTestPage();
    po.multiHeadingCWE.click();
    // Move to first item past heading (second item)
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_DOWN);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(true);
    expect(po.multiHeadingCWE.getAttribute('value')).toBe('Chocolate');
    // Move to second non-heading item (third item)
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_DOWN);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(false);
    expect(hasClass(po.thirdSearchRes, 'selected')).toBe(true);
    expect(po.multiHeadingCWE.getAttribute('value')).toBe('Crab');
    // Move to the other column (11th item)
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_RIGHT);
    expect(hasClass(po.thirdSearchRes, 'selected')).toBe(false);
    expect(hasClass(po.searchResult(11), 'selected')).toBe(true);
    expect(po.multiHeadingCWE.getAttribute('value')).toBe('Aminoglycosides');
    // Move up (10th item)
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_UP);
    expect(hasClass(po.searchResult(11), 'selected')).toBe(false);
    expect(hasClass(po.searchResult(10), 'selected')).toBe(true);
    expect(po.multiHeadingCWE.getAttribute('value')).toBe('ACE Inhibitors');
    // Move left (back to second item)
    po.multiHeadingCWE.sendKeys(protractor.Key.ARROW_LEFT);
    expect(hasClass(po.searchResult(10), 'selected')).toBe(false);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(true);
    expect(po.multiHeadingCWE.getAttribute('value')).toBe('Chocolate');
  });


  it('should support the twoColumnFlow option', function() {
    po.openTestPage();
    po.headings1ColCWE.click();
    // Move to first item past heading (second item)
    po.headings1ColCWE.sendKeys(protractor.Key.ARROW_DOWN);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(true);
    expect(po.headings1ColCWE.getAttribute('value')).toBe('Chocolate');
    // In a two column list, the right arrow key would move to a different item.
    // Confirm that it does not.
    po.headings1ColCWE.sendKeys(protractor.Key.ARROW_RIGHT);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(true);
    expect(po.headings1ColCWE.getAttribute('value')).toBe('Chocolate');
  });


  it('should not require a name attribute', function() {
    // Here we are testing that two search fields will not use each other's
    // ajax cache when both are lacking the name attribute.
    po.openTestPage();
    // Preconditions -- need two search fields which do not have a name
    // attribute.
    expect(po.multiSearchCWE.getAttribute('name')).toBe('');
    expect(po.searchCNE.getAttribute('name')).toBe('');
    po.multiSearchCWE.click();
    po.multiSearchCWE.sendKeys('ar');
    po.waitForSearchResults();
    // A list should appear
    // This list is using statitics, so it pulls CAD to the top.  The second
    // result is what we can compare with the first result in the other list.
    expect(po.secondSearchRes.getInnerHtml()).toBe("Arm pain");
    // Now go to another field, which like multiSearchCWE has no name field.
    po.searchCNE.click();
    po.searchCNE.sendKeys('ar');
    po.waitForSearchResults();
    // The search result list should be different (even though the name
    // attribute is the same/missing for both).
    expect(po.firstSearchRes.getInnerHtml()).not.toBe("Arm pain");
    expect(po.firstSearchRes.getInnerHtml()).toBe("Arachnoiditis");
  });


  it('should not use twoColumnFlow for a tableFormat list', function() {
    // Re-open the page so the multiFieldSearch field is not scrolled up.
    po.openTestPage();
    // Resize the window so the two-column layout would be in effect for a
    // non-tableFormat list.
    browser.manage().window().setSize(1100, 473);
    po.multiFieldSearch.click();
    po.multiFieldSearch.sendKeys("ar");
    // Arrow down to first item
    po.multiFieldSearch.sendKeys(protractor.Key.ARROW_DOWN);
    expect(po.multiFieldSearch.getAttribute('value')).toBe(
      'pain in arm');
    // In a two column list, the right arrow key would move to a different item.
    // Confirm that it does not.
    po.multiFieldSearch.sendKeys(protractor.Key.ARROW_RIGHT);
    expect(po.multiFieldSearch.getAttribute('value')).toBe(
      'pain in arm');
  });


  it('should respond to page up and down keys', function() {
    po.openTestPage();
    po.headings1ColCWE.click();
    po.expandLink.click();
    // Current scroll position of the list should be zero
    expect(po.listScrollPos()).toBe(0);
    po.headings1ColCWE.sendKeys(protractor.Key.PAGE_DOWN);
    // Now it should be something more than zero.
    expect(po.listScrollPos()).toBeGreaterThan(0);
    po.headings1ColCWE.sendKeys(protractor.Key.PAGE_UP);
    // Now it should be back at the top (zero) again
    expect(po.listScrollPos()).toBe(0);
  });
});
