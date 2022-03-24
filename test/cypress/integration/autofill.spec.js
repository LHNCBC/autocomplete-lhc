describe('autoFill parameter', () => {
  it('should work for multi-select lists', () => {
    cy.visit('test/protractor/autocomp_atr.html');
    // Check field with autofill enabled
    cy.get('#list_w_autofill').should('have.value', 'Blue');
    // check data model
    cy.get('#list_w_autofill').then((jqEl)=>{
      expect(jqEl[0].autocomp.selectedItems_).to.deep.equal({Blue: 1});
    });

    // Check field with autofill disabled
    cy.get('#list_wo_autofill').should('have.value', '');
    // check data model
    cy.get('#list_wo_autofill').then((jqEl)=>{
      expect(jqEl[0].autocomp.selectedItems_).to.deep.equal({});
    });
    // Confirm that it has a list.
    cy.get('#list_wo_autofill').click();
    cy.get('#completionOptions li:first-child').should('contain', 'Blue');
  });
});

