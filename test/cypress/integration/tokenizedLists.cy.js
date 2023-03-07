// Tests related to the use of the "tokens" option.
import { default as po } from '../support/autocompPage.js';

describe('Prefetch list with tokens', function() {
  let field = po.prefetchCWETokens;
  describe('mouse selection', function() {
    it('should be able to autocomplete after a token character', function() {
      po.openTestPage();
      cy.get(field).click();
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value', 'American Indian or Alaska Native');
      cy.get(field).type(',wh');
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value',
        'American Indian or Alaska Native,White');
    });

    it('should be able to autocomplete before a token character', function() {
      po.openTestPage();
      cy.get(field).click().type('As');
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value', 'Asian');
      cy.get(field).type(',wh');
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value', 'Asian,White');
      // Arrow back to the first value, and edit it to bring up the list
      for (var i=0; i<6; ++i)
        cy.get(field).type('{leftArrow}');
      for (var i=0; i<5; ++i)
        cy.get(field).type('{backspace}');
      cy.get(field).type('U');
      // List should now say "Unknown"
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value', 'Unknown,White');
    });


    it('should be able to change the value', function() {
      // Testing for a bug related to token bounds not being reset properly.
      // First choose a short item to get the token bounds range set to
      // something small.
      po.openTestPage();
      cy.get(field).click();
      po.waitForSearchResults();
      po.searchResult(2).click();
      cy.get(field).should('have.value', 'Asian');
      // Now click to get the full list and pick a longer item
      cy.get(field).click();
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(field).should('have.value', 'American Indian or Alaska Native');
      // Now click and pick the short value again
      cy.get(field).click();
      po.waitForSearchResults();
      po.searchResult(2).click();
      cy.get(field).should('have.value', 'Asian');
    });
  });


  describe('arrow selection', function() {
    it('should allow down arrow to affect part of the field', function() {
      po.openTestPage();
      cy.get(field).click().type('as');
      po.waitForSearchResults();
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'Asian');
      // After a down arrow, the field's text is selected, so hit right arrow
      // before typing more text.
      cy.get(field).type('{rightArrow},wh');
      po.waitForSearchResults();
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'Asian,White');
    });

    it('should work for the second item', function() {
      po.openTestPage();
      cy.get(field).click().type('am');
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'American Indian or Alaska Native');
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'Black or African-American');
    });

    it('should allow the first value of the field to be changed', function() {
      // When there are two values in the field, and the first is edited, arrow
      // selection should work on that value.
      po.openTestPage();
      cy.get(field).click().type('as');
      po.waitForSearchResults();
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'Asian');
      cy.get(field).type('{rightArrow},wh'); // deselect to the right, then type
      po.waitForSearchResults();
      cy.get(field).type('{downArrow}');
      cy.get(field).should('have.value', 'Asian,White');
      // Checking here that only the 'White' was selected text
      po.assertSelectionStart(field, 6); // after "Asian,"
      cy.get(field).type('{leftArrow}'); // deselect to the left
      cy.get(field).type('{leftArrow}'); // move before comma
      for (var i=0; i<4; ++i)
        cy.get(field).type('{backspace}');  // "A,White"
      po.assertFieldVal(field, 'A,White');
      po.waitForSearchResults();
      po.downArrow(field);
      po.assertFieldVal(field, 'Asian,White');
      po.downArrow(field);
      po.assertFieldVal(field, 'American Indian or Alaska Native,White');
    });

    it.skip('should notice which field value the user clicks on', function() {
      // Not testable with Cypress.  github.com/cypress-io/cypress/issues/5721
      // This is difficult to test, because click() does not let you specify
      // a caret position.  However, a click on the element should put the caret
      // in the middle of the visible field.  So, to test this, we'll put a long
      // value as the first value in the field, and then click and see if the
      // list affects that value.
      po.openTestPage();
      po.click(field);
      po.type(field, 'na');
      po.waitForSearchResults();
      po.downArrow(field);
      po.assertFieldVal(field, 'Native Hawaiian or Pacific Islander');
      po.rightArrow(field); // deselect to the right
      po.type(field, ',wh');
      po.waitForSearchResults();
      po.downArrow(field);
      po.assertFieldVal(field, 'Native Hawaiian or Pacific Islander,White');
      po.rightArrow(field); // deselect to the right
      // Now click to bring the list full up and hopefully change the first
      // value.
      po.click(po.nonField);
      po.click(field);
      po.waitForSearchResults();
      po.downArrow(field);
      po.assertFieldVal(field, 'American Indian or Alaska Native,White');
      // Check that just the first value is selected
      po.assertSelectionStart(field, 0);
      po.assertSelectionEnd(field, 'American Indian or Alaska Native'.length);
    });

    it('should show the full list after token character', function() {
      po.openTestPage();
      po.click(field);
      po.type(field, 'as');
      po.waitForSearchResults();
      po.downArrow(field);
      po.assertFieldVal(field, 'Asian');
      po.rightArrow(field);
      po.type(field, ',');
      // Wait for the list to update, and check the result count
      po.assertPromiseVal(po.shownItemCount(), 7);
      // Also check that the first item is still the normal first item
      // and not a suggestion
      po.downArrow(field);
      po.assertFieldVal(field, 'Asian,Asian');
    });
  })
});


describe('Search list with tokens', function() {
  afterEach(function() {
    // Not currently supported by Cypress, but there is an open issue along
    // these lines:
    //   https://github.com/cypress-io/cypress/issues/448#issuecomment-613236352

    // Print out the browser's console messages (for debugging tests).
    // based on http://stackoverflow.com/a/24417431/360782
    /*
    browser.manage().logs().get('browser').then(function(browserLogs) {
      // browserLogs is an array of objects with level and message fields
      browserLogs.forEach(function(log){
         console.log(log.message);
      });
    });
    */
  });

  let field = po.searchCNETokens;
  it('should close the list if there are no matches for the second term',
      function() {
    po.openTestPage();
    po.click(field);
    po.type(field, 'ar');
    po.waitForSearchResults();
    po.downArrow(field);
    po.assertFieldVal(field, 'Arachnoiditis');
    po.rightArrow(field);
    po.type(field, ',qq'); // no matches
    po.waitForNoSearchResults();
    po.assertPromiseVal(po.shownItemCount(), 0);
  });


  it('should show results for a second term after a token', function() {
    po.openTestPage();
    po.click(field);
    po.type(field, 'ar');
    po.waitForSearchResults();
    po.downArrow(field);
    po.assertFieldVal(field, 'Arachnoiditis');
    po.rightArrow(field);
    po.type(field, ',ar');
    po.waitForSearchResults();
    po.downArrow(field);
    po.assertFieldVal(field, 'Arachnoiditis,Arachnoiditis');
  });
});
