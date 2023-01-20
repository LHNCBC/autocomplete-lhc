// Tests for multi-field lists
import { default as po } from '../support/autocompPage.js';

describe('multi-field lists', function() {
  before(function() {
    po.openTestPage();
  });


/* Commenting out multi-field prefetch tests until we support that

  it('should show both fields in the list', function() {
    po.multiFieldPrefetch.click();
    expect(po.firstSearchRes).toBe('Spanish - Español');
  });
  it('should put both fields in the form field unless otherwise configured',
      function() {
    po.firstSearchRes.click();
    expect(po.multiFieldPrefetch.getAttribute('value')).toBe('Spanish - Español');
  });
  it('should still show both fields when configured to use one for the form field',
     function() {
    po.multiFieldPrefetchCol2.click();
    expect(po.firstSearchRes).toBe('Spanish - Español');
  });
  it('should put only the second field into the form field when configured that way',
     function() {
    po.firstSearchRes.click();
    expect(po.multiFieldPrefetchCol2.getAttribute('value')).toBe('Español');
  });
*/


  it('should show both fields in the list for search fields', function() {
    cy.get(po.multiFieldSearch).click().type('ar');
    po.waitForSearchResults();
    po.tableSearchResult(1).should('be.visible').invoke('html').should('equal',
      '<td>Arm pain</td><td>pain in arm</td>');
  });

  it('should put only the second field into the search form field when configured that way',
     function() {
    po.tableSearchResult(1).click();
    cy.get(po.multiFieldSearch).should('have.value', 'pain in arm');
  });


  it('should function properly with the multi-select feature', function() {
    cy.get(po.multiSelectTableSearch).click().type('ar');
    po.waitForSearchResults();
    po.tableSearchResult(1).invoke('html').should('equal', '<td>NM_001113511</td>');
    po.tableSearchResult(1).click();
    po.getSelected(po.multiSelectTableSearchID).then((data)=>{
      cy.wrap(data[1]).should('deep.equal', ['NM_001113511']);
    });
    po.shownItemCount().should('equal', 6);
    po.tableSearchResult(1).invoke('html').should('not.equal', '<td>NM_001113511</td>');
    cy.get(po.nonField).click();
    cy.get(po.multiSelectTableSearch).click().type('ar');
    po.shownItemCount().should('equal', 7);
    po.tableSearchResult(1).invoke('html').should('not.equal', '<td>NM_001113511</td>');
  });


  it('should show the column headers when those are specified', function() {
    cy.get(po.multiFieldSearchHeaders).click().type('ar');
    po.waitForSearchResults();
    po.tableSearchResult(1).should('have.length', 2); // contains the header row and then the first row of tbody.
    po.tableSearchResult(1).eq(0).invoke('html').should('equal', '<th>C1</th><th>C2</th>');
    // Make sure we can't click on the header and select it
    po.tableSearchResult(1).eq(0).click();
    cy.get(po.multiFieldSearchHeaders).should('have.value', 'ar');
    // Make sure we don't select the header by arrowing down
    cy.get(po.multiFieldSearchHeaders).type('{downArrow}');
    po.tableSearchResult(1).eq(0).should('not.have.class', 'selected');
    po.tableSearchResult(1).eq(1).should('have.class', 'selected');
  });
});
