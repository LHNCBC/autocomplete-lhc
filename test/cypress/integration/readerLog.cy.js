// Tests for the screen reader log

import { default as po } from '../support/autocompPage.js';

describe('Screen reader log', function() {
  before(function() {
    po.openTestPage();
  });

  afterEach(function() {
    // Hide the autocompleter list
    cy.get(po.nonField).click();
  });

  describe('match status', function() {
    it('should not report a non-match status more than once', function() {
      // Case: type into a clear field a non-matching value, then leave the
      // field, and there were three messages about the non-matching value.
      cy.get(po.alleleSearch).clear().click().type('z');
      cy.get(po.nonField).click();
      po.nthLastLogEntry(1).should('equal',
        'The field\'s value does not match any items in the list.');
      po.nthLastLogEntry(2).should('equal', 'Type to show matching list values.');
    });
  });

  describe('lists with headings', function() {
    it('should not count headings with the item count', function() {
      cy.get(po.headings1ColCWE).click();
      po.nthLastLogEntry(2).should('equal', 'Showing 12 of 135 items total.');
    });

    it('should reading headings when passed over with arrow keys', function() {
      // The first down-arrow press will cross a header.  The header should be
      // read.  (The list item does not go into the screen reader log (not for
      // non-table-format lists anyway), because JAWS reads the value that is
      // put into the field.)
      cy.get(po.headings1ColCWE).type('{downArrow}');
      po.nthLastLogEntry(1).should('equal', 'Under list heading: Food allergies');
      // Arrow down under the next heading
      cy.get(po.headings1ColCWE).type('{downArrow}{downArrow}{downArrow}');
      po.nthLastLogEntry(1).should('equal',
        'Under list heading: Environmental allergies');
      // Arrow back up over that heading
      cy.get(po.headings1ColCWE).type('{upArrow}');
      po.nthLastLogEntry(1).should('equal', 'Above list heading: Environmental allergies');
    });
  });

  describe('table-format lists', function() {
    it('should read the whole row highlighted by arrow keys', function() {
      cy.get(po.multiFieldSearchHeaders).click();
      cy.get(po.multiFieldSearchHeaders).type('ar');
      po.waitForSearchResults();
      cy.get(po.multiFieldSearchHeaders).type('{downArrow}');
      po.nthLastLogEntry(1).should('equal', 'Arm pain; pain in arm');
    });

    it('should not read the row if there is just one column', function() {
      // This is because the single value in the column will be put into the
      // field as the user arrows down, and will be read by JAWS from that.
      // Type the characters one at a time to have a stable order of log messages.
      cy.get(po.multiFieldSearch1Col).click().type('a');
      po.nthLastLogEntry(1).should('equal', 'The field\'s value does not match any items in the list.')
      cy.get(po.multiFieldSearch1Col).click().type('r');
      po.waitForSearchResults();
      cy.get(po.multiFieldSearch1Col).click().type('{downArrow}');
      // The last line with either be
      po.nthLastLogEntry(2).should('equal', 'A list has appeared below the field.');
      po.nthLastLogEntry(1).should('equal', 'The field no longer contains a non-matching value.');
    });

    it('should read the column headers', function() {
      cy.get(po.multiFieldSearchHeaders).clear().click().type('ar');
      po.waitForSearchResults();
      po.nthLastLogEntry(2).should('equal', 'The column headers on the multi-column list are C1; C2');
    });
  });

});
