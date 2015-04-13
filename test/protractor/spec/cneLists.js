var helpers = require('../test_helpers.js');
var hasClass = helpers.hasClass;
var po = require('../autocompPage.js');

describe('CNE lists', function() {
  var cneList = $('#fe_multi_sel_cne');
  it('should warn user about invalid values', function() {
    po.openTestPage();
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

