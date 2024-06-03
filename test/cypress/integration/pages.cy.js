// Tests for the documentation pages

describe('search autocompletion lists', () => {
  it('should function', () => {
    cy.visit('/');
    // Test for the correct placeholder, and that some list appears when typing.
    ['#demo8', '#demo11'].forEach((field) => {
      cy.get(field).click();
      cy.get('#searchResults').should('not.be.visible');
      cy.get(field).type('ar');
      cy.get('#searchResults').should('be.visible');
      // Close the list before moving clicking in the next field
      cy.get(field).blur();
    });
  });
});
