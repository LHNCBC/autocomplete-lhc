// Tests for directive-generated multi-select lists
import { default as dp } from '../support/directivePage.js'; // dp = DirectivePage instance

describe('directive', function() {
  describe(': multi-select lists', function() {
    function checkMultiFieldModel(expectedModel) {
      dp.checkModel(dp.multiField, 'listFieldVal2', expectedModel);
    }

    it('should have an empty selection area initially (without a default setting)',
       function() {
      dp.openDirectiveTestPage();
      cy.get(dp.multiField).should('exist');
      cy.get(dp.multiField).xpath('../ul').should('exist');
      cy.get(dp.multiField).xpath('../ul').xpath('li').should('not.exist');
    });

    it('should be blank (without a default setting)', function() {
      cy.get(dp.multiField).should('have.value', '');
    });

    it('should leave the field empty after a selection', function() {
      cy.get(dp.multiField).click();
      cy.get(dp.searchResSel).should('be.visible');
      dp.searchResult(1).should('exist').click();
      cy.get(dp.multiField).should('have.value', '');
    });

    it('should store mutiple values on the data model', function() {
      dp.openDirectiveTestPage();
      checkMultiFieldModel(null);
      cy.get(dp.multiField).click();
      cy.get(dp.searchResSel).should('be.visible');
      dp.searchResult(1).click();
      checkMultiFieldModel([{text: 'Green', code: 'G'}]);
      // Now add a second item.
      dp.searchResult(1).click();
      checkMultiFieldModel([{text: 'Green', code: 'G'}, {text: 'Blue', code: 'B'}]);
      // Now remove the first item
      cy.get(dp.multiFieldFirstSelected).click();
      checkMultiFieldModel([{text: 'Blue', code: 'B'}]);
      // Add an invalid value.  The existing value should not get lost if we
      // then add a second valid value.  (Note: dp.multiField is CNE).
      cy.get(dp.multiField).type('zzz');
      cy.get(dp.multiField).type('{enter}');
      cy.get(dp.multiField).should('have.class', 'no_match');
      cy.get(dp.multiField).should('have.class', 'invalid');
      cy.get(dp.inputElem).click(); // shift focus from multiField (clearing it)
      cy.get(dp.multiField).should('have.value', '');
      // Add a valid item and check the model.
      cy.get(dp.multiField).click();
      cy.get(dp.searchResSel).should('be.visible');
      dp.searchResult(1).click();
      checkMultiFieldModel([{text: 'Blue', code: 'B'}, {text: 'Green', code: 'G'}]);
      // Remove the first item again, to make sure that the new "span" element
      // within the button can receive clicks and still handle the event
      // correctly.
      cy.get(dp.multiFieldFirstSelectedSpan).click();
      checkMultiFieldModel([{text: 'Green', code: 'G'}]);
      // There should also just be one selected item on the page.
      cy.get(dp.multiFieldSelectedItems).should('have.length', 1);
    });

    it('should not show matches for selected items', function() {
      dp.openDirectiveTestPage();
      checkMultiFieldModel(null);
      cy.get(dp.multiField).click();
      cy.get(dp.searchResSel).should('be.visible');
      dp.searchResult(1).click();
      checkMultiFieldModel([{text: 'Green', code: 'G'}]);
      cy.get(dp.multiField).type('Gr');
      // There should be no matches
      dp.searchResult(1).should('not.exist');
    });

    it('should allow non-matching values for prefetch CWE lists', function () {
      dp.openDirectiveTestPage();
      // Add a non-list value
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal', null);
      cy.get(dp.multiPrefetchCWE).click().type('non-list val 1');
      cy.get(dp.codeField).click(); // shift focus from field
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal',
        [{text: 'non-list val 1', _notOnList: true}]);
      cy.get(dp.multiPrefetchCWESelected).should('have.length', 1);
      cy.get(dp.multiPrefetchCWE).should('have.value', '');
      // Add a list value
      cy.get(dp.multiPrefetchCWE).click();
      dp.searchResult(1).click();
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal',
        [{text: 'non-list val 1', _notOnList: true}, {text: 'Green', code: 'G'}]);
      cy.get(dp.multiPrefetchCWESelected).should('have.length', 2);
      // Add another non-list value
      cy.get(dp.multiPrefetchCWE).click().type('non-list val 2');
      cy.get(dp.codeField).click(); // shift focus from field
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal',
        [{text: 'non-list val 1', _notOnList: true}, {text: 'Green', code: 'G'},
         {text: 'non-list val 2', _notOnList: true}]);
      cy.get(dp.multiPrefetchCWESelected).should('have.length', 3);
      cy.get(dp.multiPrefetchCWE).should('have.value', '');
      // Remove the first non-list value
      cy.get(dp.multiPrefetchCWE).click();
      cy.get(dp.allSearchRes).should('have.length', 2);
      cy.get(dp.multiPrefetchCWEFirstSelected).click();
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal',
        [{text: 'Green', code: 'G'}, {text: 'non-list val 2', _notOnList: true}]);
      cy.get(dp.multiPrefetchCWESelected).should('have.length', 2);
      // A non-list item should not be added into the list when removed
      cy.get(dp.multiPrefetchCWE).click();
      cy.get(dp.allSearchRes).should('have.length', 2);
      // Remove a list value
      cy.get(dp.multiPrefetchCWEFirstSelected).click();
      dp.checkModel(dp.multiPrefetchCWE, 'multiPrefetchCWEVal',
        [{text: 'non-list val 2', _notOnList: true}]);
      cy.get(dp.multiPrefetchCWESelected).should('have.length', 1);
      cy.get(dp.multiPrefetchCWE).click();
      cy.get(dp.allSearchRes).should('have.length', 3);
    });

    it('should allow non-matching values for search CWE lists', function () {
      dp.openDirectiveTestPage();
      // Add a non-list value
      dp.checkModel(dp.multiSearchCWE, dp.multiSearchCWEModel, null);
      cy.get(dp.multiSearchCWE).click().type('non-list val 1');
      cy.get(dp.codeField).click(); // shift focus from field
      dp.checkModel(dp.multiSearchCWE, dp.multiSearchCWEModel,
        [{text: 'non-list val 1', _notOnList: true}]);
      cy.get(dp.multiSearchCWESelected).should('have.length', 1);
      cy.get(dp.multiSearchCWE).should('have.value', '');

      // Add a list value
      cy.get(dp.multiSearchCWE).click().type('ar');
      dp.searchResult(1).click();
      cy.get(dp.searchList).should('have.value', '');
      dp.checkModel(dp.multiSearchCWE, dp.multiSearchCWEModel,
        [{text: 'non-list val 1', _notOnList: true},
         {text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          data: {term_icd9_code: '518.82'}}]);
      cy.get(dp.multiSearchCWESelected).should('have.length', 2);

      // Reload the page and add a list value first
      dp.openDirectiveTestPage();
      cy.get(dp.multiSearchCWE).click().type('ar');
      dp.searchResult(1).click();
      cy.get(dp.multiSearchCWESelected).should('have.length', 1);
      dp.checkModel(dp.multiSearchCWE, dp.multiSearchCWEModel,
        [{text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          data: {term_icd9_code: '518.82'}}]);
      // Now add a non-list value
      cy.get(dp.multiSearchCWE).type('non-list val 1');
      cy.get(dp.codeField).click(); // shift focus from field
      dp.checkModel(dp.multiSearchCWE, dp.multiSearchCWEModel,
        [{text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
          data: {term_icd9_code: '518.82'}},
         {text: 'non-list val 1', _notOnList: true}]);
      cy.get(dp.multiSearchCWESelected).should('have.length', 2);
    });

    it('should not allow non-matching values in a CNE', function() {
      // Testing one particular case that is currently failing.
      dp.openDirectiveTestPage();
      // Add a non-list value
      dp.checkModel(dp.multiPrefetchCNE, dp.multiSearchCWEModel, null);
      cy.get(dp.multiPrefetchCNE).click();
      cy.get(dp.multiPrefetchCNE).type('non-list val 1{enter}');
      // Click outside the field
      cy.get(dp.inputElem).click();
      // At this point the field should be cleared from its value (because there
      // were two attempts to leave the field without the field changing
      // inbetween.)
      cy.get(dp.multiPrefetchCNE).should('have.value', '');
    });

    it('should handle pre-populated model values', function () {
      dp.checkSelected(dp.multiSearchCWEPrePopID, {'item1': 'a', 'item2': 'b'});
    });

    it('should load the default value for multi-select lists', function() {
      var listID = 'list10';
      var listField = '#'+listID;
      cy.get(listField).should('have.value', ''); // multiselect clears field
      dp.checkSelected(listID, {'Green': 'G'});
      // The model should be set
      dp.checkModel(listField, 'listFieldVal10',[{text: 'Green', code: 'G'}]);
      // Green should not be in the list, because it is selected already
      cy.get(listField).click();
      cy.get(dp.searchResSel).should('be.visible');
      cy.get(listField).type('Gr');
      // There should be no matches
      dp.searchResult(1).should('not.exist');
    });

  });
});


