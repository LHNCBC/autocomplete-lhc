var helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;
var firstSearchRes = $('#searchResults li:first-child');
var po = require('../autocompPage.js');

describe('autocomp', function() {
  var searchResults = $('#searchResults');
  var raceField = po.prefetchCNE;
  var searchCNE = $('#fe_search_cne');
  var suggestionMode0CWE = $('#fe_search0_cwe');
  var suggestionMode1CWE = $('#fe_search_cwe');
  var suggestionMode2CWE = $('#fe_search2_cwe');

  it('should respond to the suggestion mode setting',
     function() {
    po.openTestPage();
    suggestionMode0CWE.click();
    suggestionMode0CWE.sendKeys('arm');
    expect(searchResults.isDisplayed()).toBeTruthy();
    // In suggestion mode 0, the first element should be what is alphabetically
    // first.
    expect(firstSearchRes.getInnerHtml()).toEqual('Arm painzzzzz');
    // Backspace to erase the field, or the non-match suggestions dialog will
    // appear (for the other kind of suggestion).
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode0CWE.sendKeys(protractor.Key.BACK_SPACE);

    suggestionMode1CWE.click();
    suggestionMode1CWE.sendKeys('arm');
    // In suggesion mode 1, the first element should be the shortest item
    // starting with the input text.
    expect(firstSearchRes.getInnerHtml()).toEqual('Arm z');
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);
    suggestionMode1CWE.sendKeys(protractor.Key.BACK_SPACE);

    suggestionMode2CWE.click();
    suggestionMode2CWE.sendKeys('arm');
    // In suggestion mode 2, the first element should be the first returned in
    // the AJAX call.
    expect(firstSearchRes.getInnerHtml()).toEqual('Coronary artery disease (CAD)');
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
      item_code: 'LA44-3', removed: false, list: ['Spanish', 'French', 'Other'],
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
    // Confirmat that it does not.
    po.headings1ColCWE.sendKeys(protractor.Key.ARROW_RIGHT);
    expect(hasClass(po.secondSearchRes, 'selected')).toBe(true);
    expect(po.headings1ColCWE.getAttribute('value')).toBe('Chocolate');
  });

});
