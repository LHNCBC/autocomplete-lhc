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
    // If the form wasn't submitted, the page URL will have changed.
    expect(browser.driver.executeScript('return ""+window.location.href')
          ).toBe(po.testPageURL);

    // Try to hit enter a second time.  This time the field should be cleared.
    // We also let the event go through, which submits the form.  To test that
    // the field is cleared, we need to prevent the form from submitting.
    browser.driver.executeScript('jQuery("#'+po.prefetchCNEFieldName+'").'+
      'keydown(function(event) {event.preventDefault()})');
    expect(po.prefetchCNE.getAttribute('value')).not.toBe('');
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    expect(browser.driver.executeScript('return window.location.href')
          ).toBe(po.testPageURL);
    expect(po.prefetchCNE.getAttribute('value')).toBe('');

    // Repeat the above but without the preventDefault() call, to confirm that
    // the form is allowed to be submitted (which means the page URL will have
    // chanegd).
    po.openTestPage();
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('zzz');
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    po.prefetchCNE.sendKeys(protractor.Key.ENTER);
    expect(browser.driver.executeScript('return window.location.href')
          ).not.toBe(po.testPageURL);
  });


  it('should accept a valid value when the user erases extra characters',
      function() {
    // This tests for bug LF-185, in which if you start with a valid field
    // value (previously entered) and then append extra characters and click
    // away from the field to get it to complain, if you then remove the extra
    // characters so the value is valid and click away, the field clears.
    // The following test (should move to the next field...) tests for a variant
    // of this bug involving the TAB key.
    po.openTestPage();
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('Unknown');
    po.prefetchCNE.sendKeys(protractor.Key.TAB);
    // At the point the field should be in a valid state.
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(false);
    // Add extra characters
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('z');
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknownz');
    po.nonField.click();
    // Now it should be invalid
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(true);
    // Now erase the bad key.  Hit the right arrow key to move to the end of the
    // field, because the text might be highlighted.
    po.prefetchCNE.sendKeys(protractor.Key.ARROW_RIGHT);
    po.prefetchCNE.sendKeys(protractor.Key.BACK_SPACE);
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknown');
    po.nonField.click();
    // The field should be valid and still have its value.
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(false);
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknown');
  });


  it('should move to the next field after the user erases extra characters',
      function() {
    // This is a part of LF-185.  If the list has an valid value, and then the
    // user adds extra characters and tabs and gets the invalid value warning,
    // and then the user deletes the extra characters so the is is valid again,
    // the field remained in its invalid state when the TAB key was pressed and
    // the focus stayed in the field.
    po.openTestPage();
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('Unknown');
    po.prefetchCNE.sendKeys(protractor.Key.TAB);
    // At the point the field should be in a valid state.
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(false);
    po.prefetchCNE.click();
    po.prefetchCNE.sendKeys('z');
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknownz');
    po.prefetchCNE.sendKeys(protractor.Key.TAB);
    // Now it should be invalid
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(true);
    // Now erase the bad key.  Hit the right arrow key to move to the end of the
    // field, because the text might be highlighted.
    po.prefetchCNE.sendKeys(protractor.Key.ARROW_RIGHT);
    po.prefetchCNE.sendKeys(protractor.Key.BACK_SPACE);
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknown');
    po.prefetchCNE.sendKeys(protractor.Key.TAB);
    // Now the field should be valid, and shoud not have focus anymore.
    // (I am not testing which field should have focus, to avoid introducing
    // a dependency on the order of the fields on the page, but just that this
    // field does not have the focus.)
    expect(hasClass(po.prefetchCNE, 'invalid')).toBe(false);
    expect(po.prefetchCNE.getAttribute('id')).not.toEqual(
      browser.driver.switchTo().activeElement().getAttribute('id'));
    expect(po.prefetchCNE.getAttribute('value')).toEqual('Unknown');
  });
});

