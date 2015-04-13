var helpers = require('../test_helpers.js');
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


});
