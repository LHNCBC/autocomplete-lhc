//var helpers = require('../test_helpers.js');
//var hasClass = helpers.hasClass;
//var po = require('../autocompPage.js');
import { TestPages } from '../support/testPages.js';
import { default as po } from '../support/autocompPage.js';

describe('CNE lists', function() {
  var cneList = '#fe_multi_sel_cne';

  beforeEach(()=>{
    cy.visit(TestPages.autocomp_atr);
  });

  it('should warn user about invalid values', function() {
    cy.get(cneList).should('not.have.class', 'no_match').should('not.have.class', 'invalid');

    cy.get(cneList).click().type('zzz').blur();
    cy.get(cneList).should('have.class', 'no_match').should('have.class', 'invalid');
    cy.get(cneList).should('have.focus');
  });


  it('should send a list selection event even for non-matching values', function() {
    cy.window().then((win)=>{
      win.callCount = 0;
      win.Def.Autocompleter.Event.observeListSelections('race_or_ethnicity', function(eventData) {
        ++win.callCount;
      });
    });

    cy.window().its('callCount').should('eq', 0);
    cy.get(po.prefetchCNE).click().type('zzz')
      .should('have.value', 'zzz').blur().should('have.focus'); // shift focus from field; should return
    cy.get(po.prefetchCNE).should('have.value', 'zzz');
    cy.window().its('callCount').should('eq', 1);
    cy.get(po.prefetchCNE).blur().should('have.value', ''); // shift focus from field, field should clear
    // Another event should be sent when the field is cleared, because we sent
    // one with the invalid value above.
    cy.window().its('callCount').should('eq', 2);

    // Also confirm that there is one event sent for the field being cleared
    // when the initial value was not blank.
    cy.get(po.prefetchCNE).click();
    cy.get('#searchResults li:first-child').click();
    // For that selection, there should have been one event sent.
    cy.window().its('callCount').should('eq', 3);
    // Tab away and refocus
    cy.get(po.prefetchCNE).blur().click();
    // Now try entering an invalid value again.
    cy.get(po.prefetchCNE).clear().type('zzz').should('have.value', 'zzz');
    cy.get(po.prefetchCNE).blur().should('have.focus'); // shift focus from field; should return
    cy.get(po.prefetchCNE).should('have.value', 'zzz');
    // An event should have been sent for the invalid value
    cy.window().its('callCount').should('eq', 4);
    cy.get(po.prefetchCNE).blur().should('have.value', ''); // shift focus from field, field should clear
    // Now we should have had another call, because the end result is that the
    // field was cleared.
    cy.window().its('callCount').should('eq', 5);
  });


  it('should not let the ENTER key submit the form with an invalid value', function() {
    cy.get(po.prefetchCNE).click().type('zzz').type('{enter}');
    // If the form wasn't submitted, the page URL will have changed.
    cy.window().its('location.href').should('contain', TestPages.autocomp_atr);

    // Try to hit enter a second time.  This time the field should be cleared.
    // We also let the event go through, which submits the form.  To test that
    // the field is cleared, we need to prevent the form from submitting.
    cy.window().then((win)=> {
      win.document.getElementsByTagName('form')[0].addEventListener('submit', (event)=>event.preventDefault());
    });
    //cy.wait(2000);
    cy.get(po.prefetchCNE).should('not.have.value', '');
    cy.get(po.prefetchCNE).type('{enter}');
    cy.window().its('location.href').should('contain', TestPages.autocomp_atr); // form did not submit
    cy.get(po.prefetchCNE).should('have.value', ''); // or undefined

    // Repeat the above but without the preventDefault() call, to confirm that
    // the form is allowed to be submitted (which means the page URL will have
    // changed).
    cy.visit(TestPages.autocomp_atr);
    //po.openTestPage();
    cy.get(po.prefetchCNE).click().type('zzz').type('{enter}').type('{enter}');
    cy.window().then(win=>{expect(win.location.href).not.to.equal(po.testPageURL)});
  });



  it('should accept a valid value when the user erases extra characters',
      function() {
    // This tests for bug LF-185, in which if you start with a valid field
    // value (previously entered) and then append extra characters and click
    // away from the field to get it to complain, if you then remove the extra
    // characters so the value is valid and click away, the field clears.
    // The following test (should move to the next field...) tests for a variant
    // of this bug involving the TAB key.
    cy.get(po.prefetchCNE).click().type('Unknown').blur();
    // At this point the field should be in a valid state.
    cy.get(po.prefetchCNE).should('not.have.class', 'invalid');
    // Add extra characters
    cy.get(po.prefetchCNE).click().type('z');
    cy.get(po.prefetchCNE).should('have.value', 'Unknownz');
    cy.get(po.nonField).click();
    // Now it should be invalid
    cy.get(po.prefetchCNE).should('have.class', 'invalid');
    // Now erase the bad key.  Hit the right arrow key to move to the end of the
    // field, because the text might be highlighted.
    cy.get(po.prefetchCNE).click().type('{moveToEnd}').type('{backspace}');
    cy.get(po.prefetchCNE).should('have.value', 'Unknown');
    cy.get(po.nonField).click();
    // The field should be valid and still have its value.
    cy.get(po.prefetchCNE).should('not.have.class', 'invalid');
    cy.get(po.prefetchCNE).should('have.value', 'Unknown');
    // The field should also not be focused anymore
    cy.get(po.prefetchCNE).should('not.have.focus');
  });


  it('should close the list when refocused from another list field', function() {
    // This test is for the problem in LF-870, where if you type some characters
    // into one CNE field to get it into the non-match state, and then click in
    // a different autocompleter field, the list for the second field shows up
    // and remains while focus is returned to the first CNE field.
    // This test failed to detect the problem, though I tried several approaches
    // (clicking, mouseDown/mouseUp, adding pauses, and focusing).  For some
    // reason, the problem does not occur when I do the same actions here with
    // selenium that I do using a browser.  Nonetheless, it seems worthwhile to
    // have this test.
    cy.get(po.searchCNECSS).click().should('have.focus').type('aazzz'); // non-match
    cy.get(po.prefetchCNE).click().should('not.have.focus');
    cy.get(po.searchCNECSS).click().type('zzz'); // non-match
    cy.wait(100);// wait for mocked Ajax requests to be processed
    cy.get(po.prefetchCNE).click();
    // Focus should be returned to the non-matching field
    // Note:  Could not catch movement to prefetchCNE, so we just wait a bit to
    // make sure that happened.
    cy.wait(100);
    cy.get(po.prefetchCNE).should('not.have.focus'); // should lose focus
    cy.get(po.searchCNECSS).should('have.focus');
    // The search result list should close
    po.waitForNoSearchResults();
  });

});
