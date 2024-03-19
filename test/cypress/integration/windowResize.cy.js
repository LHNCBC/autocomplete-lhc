import { default as po } from '../support/autocompPage.js';

describe('window resize', function() {
  it('should reposition answer list after window is resized', function () {
    let fieldPosition, listPosition;
    po.openTestPage();
    cy.get(po.prefetchCNE).click();
    cy.get(po.searchResSel).should('be.visible');
    cy.window().then(win => {
     fieldPosition = win.document.getElementById(po.prefetchCNEFieldName).getBoundingClientRect();
     listPosition = win.document.getElementById('searchResults').getBoundingClientRect();
     // The answer list is positioned right under the field.
     expect(listPosition.top).to.equal(fieldPosition.bottom);
     expect(listPosition.left).to.equal(fieldPosition.left);
    });
    // Smaller width of viewport will render the field into next line, causing the answer list to also move.
    cy.viewport(500, 660);
    cy.window().should(win => {
      const newFieldPosition = win.document.getElementById(po.prefetchCNEFieldName).getBoundingClientRect();
      const newListPosition = win.document.getElementById('searchResults').getBoundingClientRect();
      // The field has moved.
      expect(newFieldPosition.top).not.to.equal(fieldPosition.top);
      expect(newFieldPosition.left).not.to.equal(fieldPosition.left);
      // The answer list is again positioned right under the field.
      expect(newListPosition.top).to.equal(newFieldPosition.bottom);
      expect(newListPosition.left).to.equal(newFieldPosition.left);
    });
  });
});
