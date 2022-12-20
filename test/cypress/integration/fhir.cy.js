import { default as po } from '../support/autocompPage.js';

const fhirField = '#fhir_search';
const fhirFieldMulti = '#fhir_search_multi';
const searchFunctionFieldMulti = '#fhir_search_w_function_multi';
const fhirFieldWButton = '#fhir_search_w_button';
const fhirFieldButtonID = 'fhir_search_button';
const fhirFieldButton = '#'+fhirFieldButtonID;

describe('FHIR Search Lists', function() {

  before(function() {
    po.openTestPage();
  });

  it('should show 7 results for a non-expanded search', function() {
    cy.get(fhirField).type('pmol');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
    po.checkListCountMessage('7 of 10 total');
    po.searchResult(1).click();
    cy.get(fhirField).should('have.value', 'picomole');
  });

  it('should show > 7 results for an expanded search', function() {
    cy.get(fhirField).clear();
    po.waitForNoSearchResults();
    cy.get(fhirField).type('pmol');
    po.waitForSearchResults();
    cy.get(po.expandLink).click();
    po.shownItemCount().should('equal', 10);
    po.searchResult(1).click();
    cy.get(fhirField).should('have.value', 'picomole');
  });

  it('should show 7 results after an expanded search', function() {
    // At one point, the expanded list was getting cached in place of the regular list
    cy.get(fhirField).clear();
    cy.get(fhirField).type('pmol');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
    po.searchResult(1).click(); // to dismiss the list
  });

  it('should work with the search button', function() {
    cy.get(fhirFieldWButton).type('pmol');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
    cy.get(fhirFieldButton).click();
    po.shownItemCount().should('equal', 10);
    po.searchResult(1).click(); // to dismiss the list
    cy.get(fhirField).clear();
    cy.get(fhirField).type('pmol');
    po.shownItemCount().should('equal', 7);
  });

  it('should show 7 results after selecting items', function() {
    // autoCompSearch should request extra items when some are selected
    cy.get(fhirFieldMulti).type('pmol');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
    po.checkListCountMessage('7 of 10 total');
    po.searchResult(1).click();
    cy.get(fhirFieldMulti).type('pmol');
    po.shownItemCount().should('equal', 7);
    po.checkListCountMessage('7 of 10 total');
  });
});

describe('FHIR search by function', function() {
  var searchFunctionFieldID = 'fhir_search_w_function';
  var searchFunctionField = '#'+searchFunctionFieldID;

  before(function() {
    po.openTestPage();
  });

  it('should show 5 results when empty', function() {
    cy.get(searchFunctionField).click();
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 5);
  });

  it('should show 7 results for a non-expanded search', function() {
    cy.get(searchFunctionField).type('b');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
  });

  it('should show > 7 results for an expanded search', function() {
    cy.get(po.expandLink).click();
    po.shownItemCount().should('equal', 10);
    cy.get(searchFunctionField).type('{esc}'); // close the list
  });

  it('should have its own results cache', function() {
    // Confirm that we get different results for a second fhir search field
    var secondField = '#fhir_search_cache_test';
    cy.get(secondField).click().type('b');
    po.searchResult(1).invoke('text').should('equal', "Back pain 2");
  });

  it('should show 7 results after selecting items', function() {
    // autoCompSearch should request extra items when some are selected
    cy.get(searchFunctionFieldMulti).click();
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
    po.checkListCountMessage('7 of 621 total');
    po.searchResult(1).click();
    cy.get(searchFunctionFieldMulti).type('b');
    po.shownItemCount().should('equal', 7);
    po.checkListCountMessage('7 of 621 total');
  });

});

describe('Non FHIR search by function', function() {
  var searchFunctionFieldID = 'non_fhir_search_w_function';
  var searchFunctionField = '#'+searchFunctionFieldID;

  before(function() {
    po.openTestPage();
  });

  it('should show 7 results for a non-fhir search', function() {
    cy.get(searchFunctionField).type('b');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 7);
  });

});

