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
    po.openTestPage();
    browser.driver.executeScript(function() {
      window.callCount = 0;
      Def.Autocompleter.Event.observeListSelections('race_or_ethnicity', function(eventData) {
        ++callCount;
      });
    });

    expect(browser.driver.executeScript('return window.callCount')).toBe(0);
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('zzz');
    expect(po.prefetchCNE.getAttribute('value')).toBe('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.TAB); // shift focus from field; should return
    expect(po.prefetchCNE.getAttribute('value')).toBe('zzz');
    expect(browser.driver.executeScript('return window.callCount')).toBe(0);
    po.prefetchCNE.sendKeys(protractor.Key.TAB); // shift focus from field, field should clear
    expect(po.prefetchCNE.getAttribute('value')).toBe('');
    expect(browser.driver.executeScript('return window.callCount')).toBe(0);

    // However, we do want it to send an event if the final, cleared value is
    // a change from what was originally in the field.
    // Select a valid list item, then enter something invalid and tab until
    // the field clears.  There should be a list selection event for that
    // case, to signal the field was cleared.
    po.prefetchCNE.click();
    var item = $('#searchResults li:first-child');
    item.click();
    // For that selection, there should have been one event sent.
    expect(browser.driver.executeScript('return window.callCount')).toBe(1);
    // Tab away and refocus
    po.prefetchCNE.sendKeys(protractor.Key.TAB);
    browser.driver.switchTo().activeElement().sendKeys(
      protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB));
    // Now try entering an invalid value again.
    po.prefetchCNE.sendKeys('zzz');
    expect(po.prefetchCNE.getAttribute('value')).toBe('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.TAB); // shift focus from field; should return
    expect(po.prefetchCNE.getAttribute('value')).toBe('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.TAB); // shift focus from field, field should clear
    expect(po.prefetchCNE.getAttribute('value')).toBe('');
    // Now we should have had another call, because the end result is that the
    // field was cleared.
    expect(browser.driver.executeScript('return window.callCount')).toBe(2);
  });


  it('should not let the ENTER key submit the form with an invalid value',
    function() {
    po.openTestPage();
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    // If the form wasn't submitted, angular will still be defined.  (The
    // response to the submit does not have angular.)
    expect(browser.driver.executeScript('return window.angular !== undefined')
          ).toBe(true);
    // Try to hit enter a second time.  This time the field should be cleared.
    // We also let the event go through, which submits the form.  To test that
    // the field is cleared, we need to prevent the form from submitting.
    browser.driver.executeScript('jQuery("#'+po.prefetchCNEFieldName+'").'+
      'keydown(function(event) {event.preventDefault()})');
    expect(po.prefetchCNE.getAttribute('value')).toNotBe('');
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    expect(browser.driver.executeScript('return window.angular !== undefined')
          ).toBe(true);
    expect(po.prefetchCNE.getAttribute('value')).toBe('');

    // Repeat the above but without the preventDefault() call, to confirm that
    // the form is allowed to be submitted (which means angular won't be
    // present).
    po.openTestPage();
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    expect(browser.driver.executeScript('return window.angular !== undefined')
          ).toBe(false);
  });

});

