import { default as po } from '../support/autocompPage.js';

describe('autocomp', function() {
  var raceField = po.prefetchCNE;
  var searchCNE =  po.searchCNESel;
  var suggestionMode0CWE = '#fe_search0_cwe';
  var suggestionMode1CWE = po.searchCWESel;
  var suggestionMode2CWE = '#fe_search2_cwe';

  it('should respond to the suggestion mode setting',
     function() {
    po.openTestPage();
    po.click(suggestionMode0CWE);
    po.type(suggestionMode0CWE, 'arm');
    po.waitForSearchResults();
    // In suggestion mode 0, the first element should be what is alphabetically
    // first.
    po.assertSearchResVal(1, 'Arm painzzzzz');
    // Backspace to erase the field, or the non-match suggestions dialog will
    // appear (for the other kind of suggestion).
    po.backspace(suggestionMode0CWE);
    po.backspace(suggestionMode0CWE);
    po.backspace(suggestionMode0CWE);

    po.click(suggestionMode1CWE);
    po.type(suggestionMode1CWE, 'arm');
    po.waitForSearchResults();
    // In suggesion mode 1, the first element should be the shortest item
    // starting with the input text.
    po.assertSearchResVal(1, 'Arm z');
    po.backspace(suggestionMode1CWE);
    po.backspace(suggestionMode1CWE);
    po.backspace(suggestionMode1CWE);

    po.click(suggestionMode2CWE);
    po.type(suggestionMode2CWE, 'arm');
    po.waitForSearchResults();

    // In suggestion mode 2, the first element should be the first returned in
    // the AJAX call.
    po.assertSearchResVal(1, 'Coronary artery disease (CAD)');
    po.backspace(suggestionMode2CWE);
    po.backspace(suggestionMode2CWE);
    po.backspace(suggestionMode2CWE);

    // Confirm that the default is mode 1.
    // "Asian" is the short match and should be offered as a default
    po.click(raceField);
    po.type(raceField, 'a');
    po.waitForSearchResults();
    po.click(po.searchResult(1));
    po.assertFieldVal(po.prefetchCNE, 'Asian');

    // The suggestion should not be offered if the user clicks in the field to
    // see the full list.  (A suggestion should be made only when the user is
    // typing.)
    po.click(po.nonField);
    po.click(po.prefetchCNE);
    po.click(po.searchResult(1));
    po.assertFieldVal(po.prefetchCNE, 'American Indian or Alaska Native');
  });


  it('should not show the list in response to a shift or control key being held down',
     function() {
    po.openTestPage();
    var inputElem = raceField;
    po.click(inputElem);
    po.waitForSearchResults();
    po.escapeKey(inputElem);
    po.waitForNoSearchResults();
    // Now, if we send control or shift, the list should not redisplay
    po.controlKey(inputElem);
    po.waitForNoSearchResults();
    po.shiftKey(inputElem);
    po.waitForNoSearchResults();
    // But if we type an backspace, the list should display
    po.backspace(inputElem);
    po.waitForSearchResults();
  });


  it('should not shift the selected item when the control key is down',
     function() {
    po.openTestPage();
    po.click(raceField);
    po.waitForSearchResults();
    po.downArrow(raceField); // first item
    po.downArrow(raceField); // second item
    po.assertFieldVal(raceField, 'Asian');
    po.downArrow(raceField, [po.KeyModifiers.CONTROL]);
    // second item should still be selected
    po.assertFieldVal(raceField, 'Asian');
    po.escapeKey(raceField); // Close the list

    // Now try a search list
    po.click(searchCNE);
    po.type(searchCNE, 'ar');
    po.waitForSearchResults();
    po.downArrow(searchCNE); // first item
    po.assertFieldVal(searchCNE, 'Arachnoiditis');
    po.downArrow(searchCNE, [po.KeyModifiers.CONTROL]);
    // First item should still be selected
    po.assertFieldVal(searchCNE, 'Arachnoiditis');
  });


  it('single select lists should store correct codes for non-list entries',
      function() {
    // Here we are testing two cases.  First, we test changing a list entry to a
    // non-list entry.  Second, we test clearing a non-list entry.
    po.openTestPage();
    // Check initial stored values of prefetchCWE
    po.checkSelected(po.prefetchCWEID, {});
    // Select an item from the list
    po.click(po.prefetchCWE);
    po.click(po.searchResult(1));
    po.checkSelected(po.prefetchCWEID, {"Spanish": "LA44-3"});
    // Change the value to a non-list item
    po.type(po.prefetchCWE, 'zzz');
    po.click(po.nonField); // to remove focus from prefetchCWE
    po.checkSelected(po.prefetchCWEID, {"Spanishzzz": undefined});
    // Select an item again.
    po.click(po.prefetchCWE);
    po.click(po.searchResult(1));
    po.checkSelected(po.prefetchCWEID, {"Spanish": "LA44-3"});
    // For completeness, pick another coded item, this time by typing
    po.click(po.nonField);
    po.click(po.prefetchCWE);
    for (let i=0; i < 7; ++i)
      po.backspace(po.prefetchCWE); // erase previous entry
    po.type(po.prefetchCWE, 'French');
    po.click(po.nonField);
    po.checkSelected(po.prefetchCWEID, {"French": "LA45-0"});
    // Now clear the field
    po.clear(po.prefetchCWE).then(()=>console.log("%%% calling final checkSelected"));
    po.click(po.nonField); // trigger change event on prefetchCWE
    po.checkSelected(po.prefetchCWEID, {});
  });


  it('should send expected keys with list selection events', function() {
    // It was noted that the documented keys on the list selection event data
    // object was out of date with respect to the actual code.  Hopefully a test
    // here will help stabilize that.
    po.openTestPage();
    po.executeScript(
      'window.prefetchCWEEventData = null;'+
      'window.Def.Autocompleter.Event.observeListSelections("'+po.prefetchCWEID+'",'+
        'function(eventData) {'+
          'window.prefetchCWEEventData = eventData;'+
        '}'+
      ');'
    );
    po.click(po.prefetchCWE);
    po.click(po.searchResult(1));
    var eventData = po.executeScript('return window.prefetchCWEEventData');
    // If you updated the keys in this hash, please make sure the documentation
    // in autoCompEvents.js (observeListSelections) is also up to date.
    po.assertPromiseVal(eventData, {val_typed_in: '', final_val: 'Spanish',
      used_list: true, input_method: 'clicked', on_list: true,
      item_code: 'LA44-3', removed: false,
      list: ['Spanish', 'French', 'Other', 'escape<test>&'],
      field_id: po.prefetchCWEID});
  });


  it('should handle left/right arrows for two-column lists', function() {
    po.openTestPage();
    // Position the field at the bottom of the window so the two-column layout
    // should be in effect.
    po.putElementAtBottomOfWindow(po.multiHeadingCWEID);
    //cy.get(po.multiHeadingCWE).click({scrollBehavior: false});
    po.click(po.multiHeadingCWE, {scrollBehavior: false});
    // Move to first item past heading (second item)
    po.downArrow(po.multiHeadingCWE);
    po.assertCSSClass(po.searchResult(2), 'selected');
    po.assertFieldVal(po.multiHeadingCWE, 'Chocolate');
    // Move to second non-heading item (third item)
    po.downArrow(po.multiHeadingCWE);
    po.assertNotCSSClass(po.searchResult(2), 'selected');
    po.assertCSSClass(po.searchResult(3), 'selected');
    po.assertFieldVal(po.multiHeadingCWE, 'Crab');
    // Move to the other column (11th item)
    po.rightArrow(po.multiHeadingCWE);
    po.assertNotCSSClass(po.searchResult(3), 'selected');
    po.assertCSSClass(po.searchResult(11), 'selected');
    po.assertFieldVal(po.multiHeadingCWE, 'Aminoglycosides');
    // Move up (10th item)
    po.upArrow(po.multiHeadingCWE);
    po.assertNotCSSClass(po.searchResult(11), 'selected');
    po.assertCSSClass(po.searchResult(10), 'selected');
    po.assertFieldVal(po.multiHeadingCWE, 'ACE Inhibitors');
    // Move left (back to second item)
    po.leftArrow(po.multiHeadingCWE);
    po.assertNotCSSClass(po.searchResult(10), 'selected');
    po.assertCSSClass(po.searchResult(2), 'selected');
    po.assertFieldVal(po.multiHeadingCWE, 'Chocolate');
  });


  it('should support the twoColumnFlow option', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.headings1ColCWEID);
    po.click(po.headings1ColCWE, {scrollBehavior: false});
    // Move to first item past heading (second item)
    po.downArrow(po.headings1ColCWE);
    po.assertCSSClass(po.searchResult(2), 'selected');
    po.assertFieldVal(po.headings1ColCWE, 'Chocolate');
    // In a two column list, the right arrow key would move to a different item.
    // Confirm that it does not.
    po.rightArrow(po.headings1ColCWE);
    po.assertCSSClass(po.searchResult(2), 'selected');
    po.assertFieldVal(po.headings1ColCWE, 'Chocolate');
  });


  it('should not require a name attribute', function() {
    // Here we are testing that two search fields will not use each other's
    // ajax cache when both are lacking the name attribute.
    po.openTestPage();
    // Preconditions -- need two search fields which do not have a name
    // attribute.
    po.assertAttrVal(po.multiSearchCWE, 'name', null);
    po.assertAttrVal(searchCNE, 'name', null);
    po.click(po.multiSearchCWE);
    po.type(po.multiSearchCWE, 'ar');
    po.waitForSearchResults();
    // A list should appear
    // This list is using statitics, so it pulls CAD to the top.  The second
    // result is what we can compare with the first result in the other list.
    po.assertSearchResVal(2, "Arm pain");
    // Now go to another field, which like multiSearchCWE has no name field.
    po.click(searchCNE);
    po.type(searchCNE, 'ar');
    po.waitForSearchResults();
    // The search result list should be different (even though the name
    // attribute is the same/missing for both).
    po.assertSearchResVal(2, "Adult respiratory distress syndrome (ARDS)");
    po.assertSearchResVal(1, "Arachnoiditis");
  });


  it('should not use twoColumnFlow for a tableFormat list', function() {
    // Re-open the page so the multiFieldSearch field is not scrolled up.
    po.openTestPage();
    // Move the field to the bottom of the window so the two-column layout would
    // be in effect for a non-tableFormat list.
    po.putElementAtBottomOfWindow(po.multiFieldSearchID);
    po.click(po.multiFieldSearch, {scrollBehavior: false});
    po.type(po.multiFieldSearch, "ar");
    // Arrow down to first item
    po.downArrow(po.multiFieldSearch);
    po.assertFieldVal(po.multiFieldSearch, 'pain in arm');
    // In a two column list, the right arrow key would move to a different item.
    // Confirm that it does not.
    po.rightArrow(po.multiFieldSearch);
    po.assertFieldVal(po.multiFieldSearch, 'pain in arm');
  });


  it('should respond to page up and down keys', function() {
    po.openTestPage();
    po.click(po.headings1ColCWE);
    po.waitForScrollToStop(po.headings1ColCWEID);
    po.click(po.expandLink);
    // Current scroll position of the list should be zero
    po.assertPromiseVal(po.listScrollPos(), 0);
    po.pageDown(po.headings1ColCWE);
    // Now it should be something more than zero.
    po.assertPromiseValGT(po.listScrollPos(), 0);
    po.pageUp(po.headings1ColCWE);
    // Now it should be back at the top (zero) again
    po.assertPromiseVal(po.listScrollPos(), 0);
  });
});
