helpers = require('./test_helpers.js');
var hasClass = helpers.hasClass;
var firstSearchRes = $('#searchResults li:first-child');

describe('autocomp', function() {
  var searchResults = $('#searchResults');
  var raceField = $('#fe_race_or_ethnicity');
  var searchCNE = $('#fe_search_cne');
  var suggestionMode0CWE = $('#fe_search0_cwe');
  var suggestionMode1CWE = $('#fe_search_cwe');
  var suggestionMode2CWE = $('#fe_search2_cwe');

  it('should respond to the suggestion mode setting',
     function() {
    browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
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
    browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
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
    browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
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


  describe('CNE lists', function() {
    var cneList = $('#fe_multi_sel_cne');
    it('should warn user about invalid values', function() {
      expect(hasClass(cneList, 'no_match')).toBe(false);
      expect(hasClass(cneList, 'invalid')).toBe(false);

      cneList.click();
      cneList.sendKeys('zzz');
      cneList.sendKeys(protractor.Key.TAB); // shift focus from field
      expect(hasClass(cneList, 'no_match')).toBe(true);
      expect(hasClass(cneList, 'invalid')).toBe(true);
      // Focus should be returned to the field
      expect(browser.driver.switchTo().activeElement().getAttribute('id')).toEqual('fe_multi_sel_cne');
    });

    it('should not send a list selection event for non-matching values', function() {
      browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
      var singleCNEFieldName = 'race_or_ethnicity'
      var singleCNE = $('#fe_'+singleCNEFieldName);
      browser.driver.executeScript(function() {
        window.callCount = 0;
        Def.Autocompleter.Event.observeListSelections('race_or_ethnicity', function(eventData) {
          ++callCount;
        });
      });
      expect(browser.driver.executeScript('return window.callCount')).toBe(0);
      singleCNE.click();
      singleCNE.sendKeys('zzz');
      expect(singleCNE.getAttribute('value')).toBe('zzz');
      singleCNE.sendKeys(protractor.Key.TAB); // shift focus from field; should return
      expect(singleCNE.getAttribute('value')).toBe('zzz');
      expect(browser.driver.executeScript('return window.callCount')).toBe(0);
      singleCNE.sendKeys(protractor.Key.TAB); // shift focus from field, field should clear
      expect(singleCNE.getAttribute('value')).toBe('');
      expect(browser.driver.executeScript('return window.callCount')).toBe(0);

      // However, we do want it to send an event if the final, cleared value is
      // a change from what was originally in the field.
      // Select a valid list item, then enter something invalid and tab until
      // the field clears.  There should be a list selection event for that
      // case, to signal the field was cleared.
      singleCNE.click();
      var item = $('#searchResults li:first-child');
      item.click();
      // For that selection, there should have been one event sent.
      expect(browser.driver.executeScript('return window.callCount')).toBe(1);
      // Tab away and refocus
      singleCNE.sendKeys(protractor.Key.TAB);
      browser.driver.switchTo().activeElement().sendKeys(
        protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB));
      // Now try entering an invalid value again.
      singleCNE.sendKeys('zzz');
      expect(singleCNE.getAttribute('value')).toBe('zzz');
      singleCNE.sendKeys(protractor.Key.TAB); // shift focus from field; should return
      expect(singleCNE.getAttribute('value')).toBe('zzz');
      singleCNE.sendKeys(protractor.Key.TAB); // shift focus from field, field should clear
      expect(singleCNE.getAttribute('value')).toBe('');
      // Now we should have had another call, because the end result is that the
      // field was cleared.
      expect(browser.driver.executeScript('return window.callCount')).toBe(2);
    });
  });
});


describe('directive', function() {
  var inputElem = $('#ac1');
  var codeField = $('#code');
  var searchResults = $('#searchResults');
  var multiField = $('#ac2');
  function openDirectiveTestPage() {
    browser.get('http://localhost:3000/test/protractor/directiveTest.html');
  }

  it('should create an area on the page for the list', function() {
    openDirectiveTestPage();
    expect(searchResults).not.toBeNull();
  });
  it('should assign an ID to the autocompleting field', function() {
    var inputElem = element(by.id('ac1'));
    expect(inputElem).not.toBeNull();
  });
  it('should show the list when the field is clicked', function() {
    var searchResults = $('#searchResults');
    expect(searchResults.isDisplayed()).toBeFalsy();
    inputElem.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
  });
  it('should load the default item code and value', function() {
    expect(inputElem.getAttribute("value")).toEqual('Blue');
    expect(codeField.getAttribute("value")).toEqual('B');
  });
  it('should not load the default item code and value when the model is already populated', function() {
    var prePopElem = $('#list1b');
    expect(prePopElem.getAttribute("value")).toEqual('a pre-populated model value');
  });
  it('should populate the model when an item is selected', function() {
    inputElem.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
    var item = $('#searchResults li:first-child');
    item.click();
    // Change focus to send change event
    codeField.click();
    expect(inputElem.getAttribute("value")).toEqual('Green');
    expect(codeField.getAttribute("value")).toEqual('G');
  });

  describe(': multi-select lists', function() {
    it('should have an empty selection area initially (without a default setting)',
       function() {
      expect(multiField.isPresent()).toBe(true);
      var list = multiField.element(by.xpath('../ul'));
      expect(list.isPresent()).toBe(true);
      var listItems = list.element(by.xpath('li'));
      expect(listItems.isPresent()).toBe(false);
    });

    it('should be blank (without a default setting)', function() {
      expect(multiField.getAttribute('value')).toEqual('');
    });

    it ('should leave the field empty after a selection', function() {
      multiField.click();
      expect(searchResults.isDisplayed()).toBeTruthy();
      var item = $('#searchResults li:first-child');
      item.click();
      expect(multiField.getAttribute('value')).toEqual('');
    });

    it('should store mutiple values on the data model', function() {
      openDirectiveTestPage();
      expect(multiField.evaluate('listFieldVal2')).toEqual(null);
      multiField.click();
      expect(searchResults.isDisplayed()).toBeTruthy();
      var item = $('#searchResults li:first-child');
      item.click();
      expect(multiField.evaluate('listFieldVal2')).toEqual([{text: 'Green', code: 'G'}]);
      // Now add a second item.
      item = $('#searchResults li:first-child');
      item.click();
      expect(multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Green', code: 'G'}, {text: 'Blue', code: 'B'}]);
      // Now remove the first item
      var button = element.all(by.css('button:first-child')).first().click();
      expect(multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Blue', code: 'B'}]);
      // Add an invalid value.  The existing value should not get lost if we
      // then add a second valid value.  (Note: multiField is CNE).
      multiField.sendKeys('zzz');
      multiField.sendKeys(protractor.Key.TAB); // attempt to leave field
      expect(hasClass(multiField, 'no_match')).toBe(true);
      expect(hasClass(multiField, 'invalid')).toBe(true);
      multiField.sendKeys(protractor.Key.TAB); // shift focus from field (clearing it)
      expect(multiField.getAttribute('value')).toEqual('');
      // Add a valid item and check the model.
      multiField.click();
      expect(searchResults.isDisplayed()).toBeTruthy();
      item = $('#searchResults li:first-child');
      item.click();
      expect(multiField.evaluate('listFieldVal2')).toEqual(
        [{text: 'Blue', code: 'B'},{text: 'Green', code: 'G'}]);
    });

    it('should not show matches for selected items', function() {
      openDirectiveTestPage();
      expect(multiField.evaluate('listFieldVal2')).toEqual(null);
      multiField.click();
      expect(searchResults.isDisplayed()).toBeTruthy();
      var item = $('#searchResults li:first-child');
      item.click();
      expect(multiField.evaluate('listFieldVal2')).toEqual([{text: 'Green', code: 'G'}]);
      multiField.sendKeys('Gr');
      // There should be no matches
      expect(element(by.css('#searchResults li:first-child')).isPresent()).toBeFalsy();
    });
  });

  describe(': CNE lists', function() {
    var cneListID = 'ac2';
    var cneList = $('#'+cneListID);
    it('should warn user about invalid values', function() {
      openDirectiveTestPage();
      expect(hasClass(cneList, 'no_match')).toBe(false);
      expect(hasClass(cneList, 'invalid')).toBe(false);

      cneList.click();
      cneList.sendKeys('zzz');
      cneList.sendKeys(protractor.Key.TAB); // shift focus from field
      expect(hasClass(cneList, 'no_match')).toBe(true);
      expect(hasClass(cneList, 'invalid')).toBe(true);
      // Focus should be back in the field
      expect(browser.driver.switchTo().activeElement().getAttribute('id')).toEqual(cneListID);
    });
  });

  describe(': search lists', function() {
    var searchList = $('#list3');
    it('should show a result list when the user types', function() {
      searchList.click();
      expect(searchResults.isDisplayed()).toBeFalsy();
      searchList.sendKeys('ar');
      expect(searchResults.isDisplayed()).toBeTruthy();
    });

    it('should have the extra data in the model for selected items', function() {
      // Pick the first search result from the previous test
      firstSearchRes.click();
      expect(searchList.getAttribute('value')).toBe(
       'Adult respiratory distress syndrome (ARDS)');
      expect(searchList.evaluate('listFieldVal3')).toEqual(
        {text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
         term_icd9_code: '518.82'});

      // Try the expanded results list
      // Clear the field first
      browser.driver.executeScript(function() {$('list3').value = '';});
      searchList.sendKeys('ar');
      expect(searchList.isDisplayed()).toBeTruthy();
      var expandLink = $('#moreResults');
      expect(expandLink.isDisplayed()).toBeTruthy();
      expandLink.click();
      var tenthSearchRes = $('#searchResults li:nth-child(10)');
      tenthSearchRes.click();
      expect(searchList.getAttribute('value')).toBe('Arrhythmia');
      expect(searchList.evaluate('listFieldVal3')).toEqual(
        {text: 'Arrhythmia', code: '3140', term_icd9_code: '427.9'});


      // Try the suggestion list
      var list4 = $('#list4');
      list4.sendKeys('ar');
      // Click someplace else to leave 'ar' in the field
      inputElem.click();
      expect(element(by.css('.ui-dialog')).isDisplayed()).toBeTruthy();
      var sugLink = element.all(by.css('.ui-dialog a')).first();
      expect(sugLink.isDisplayed()).toBeTruthy();
      sugLink.click();
      expect(list4.getAttribute('value')).toBe('Aortic insufficiency');
      expect(searchList.evaluate('listFieldVal4')).toEqual(
        {text: 'Aortic insufficiency', code: '2886', term_icd9_code: '424.1'});
    });
  });

});
