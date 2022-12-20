// Tests minified versions of files.
import { default as po } from '../support/minifiedPages.js';

describe('minified files', function() {
  it('should produce working prefetch lists', function() {
    po.openMinTest();
    cy.get(po.prefetchList).click();
    po.waitForSearchResults();
  });

  it('should produce working search lists', function() {
    po.openMinTest();
    cy.get(po.searchList).click().type('a');
    po.waitForSearchResults();
  });

  describe('directive', function() {
    it('should produce working prefetch lists', function() {
      po.openMinTestAngular();
      cy.get(po.prefetchList).click();
      po.waitForSearchResults();
    });

    it('should produce working search lists', function() {
      po.openMinTestAngular();
      cy.get(po.searchList).click().type('a');
      po.waitForSearchResults();
    });
  });
});
