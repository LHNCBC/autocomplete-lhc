// Tests for directive-generated search lists
import { default as dp } from '../support/directivePage.js'; // dp = DirectivePage instance

describe('directive', function() {
  describe(': search lists', function() {
    it('should show a result list when the user types', function() {
      dp.openDirectiveTestPage();
      cy.get(dp.searchList).click();
      cy.get(dp.searchResCSS).should('not.be.visible');
      cy.get(dp.searchList).type('ar');
      cy.get(dp.searchResCSS).should('be.visible');
    });

    it('should have the extra data in the model for selected items', function() {
      // Pick the first search result from the previous test
      dp.searchResult(1).click();
      cy.get(dp.searchList).should('have.value',
        'Adult respiratory distress syndrome (ARDS)');
      dp.checkModel(dp.searchList, dp.searchListModel,
        {text: 'Adult respiratory distress syndrome (ARDS)', code: '2910',
         data: {term_icd9_code: '518.82'}});

      // Try the expanded results list
      // Clear the field first
      cy.get(dp.searchList).clear().type('ar');
      cy.get(dp.searchResCSS).should('be.visible');
      cy.get(dp.expandLink).should('be.visible').click();
      dp.searchResult(10).click();
      cy.get(dp.searchList).should('have.value', 'Arrhythmia');
      dp.checkModel(dp.searchList, dp.searchListModel,
        {text: 'Arrhythmia', code: '3140', data: {term_icd9_code: '427.9'}});

      // Try a case with more than one field in the extra item data hash.
      cy.get(dp.searchList).clear().type('abc');
      dp.searchResult(2).click();
      dp.checkModel(dp.searchList, dp.searchListModel,
        {text: 'zArm pain', code: '2958',
         data: {term_icd9_code: '729.5', other_field: 'green'}});

      // Try the search list that has suggestions turned off.
      cy.get(dp.searchWithoutSug).type('ar');
      // Click someplace else to leave 'ar' in the field
      cy.get(dp.inputElem).click();
      cy.get(dp.searchWithoutSug).should('have.value', 'ar');
      // The only entry in the model should be the text, because it is not on
      // the list.
      dp.checkModel(dp.searchWithoutSug, dp.searchWithoutSugModel,
        {text: 'ar', _notOnList: true});
    });

    it('should clear its cache if the URL changes', function() {
      // Confirm we get a certain result before changing the URL.  (It should be
      // different than the result that follows after changing the URL.)
      cy.get(dp.multiSearchCWE).clear().type('ar');
      dp.searchResult(1).should('have.text', 'Adult respiratory distress syndrome (ARDS)');
      // Change the URL and confirm we get different results for the new list
      cy.window().then(win=>{
        win.multiSearchCWEOpts.originalUrl = win.multiSearchCWEOpts.url;
        win.multiSearchCWEOpts.url = '/form/get_search_res_list?fd_id=2163';
        win.angular.element(dp.multiSearchCWE).scope().$digest();
        cy.get(dp.multiSearchCWE).clear().type('ar');
        dp.searchResult(1).should('have.text', 'Arm pain').then(()=>{
          // Restore the url
          win.multiSearchCWEOpts.url = win.multiSearchCWEOpts.originalUrl;
          win.angular.element(dp.multiSearchCWE).scope().$digest();
        });
      });
    });

    it('should allow the URL to be undefined', function() {
      dp.openDirectiveTestPage();
      cy.get(dp.noURLTest).click().type('ar');
      cy.get(dp.searchResCSS).should('not.be.visible');
      // Set the URL to something and confirm the autocompleter starts working
      cy.window().then(win=>{
        win.searchList9Opts.url = '/form/get_search_res_list?fd_id=2163';
        win.angular.element(dp.noURLTest).scope().$digest();
      });
      cy.get(dp.noURLTest).clear().type('ar');
      cy.get(dp.searchResCSS).should('be.visible');
    });

    describe('CWE lists', function() {
      it('should set _notOnList for off-list items, but not empty values',
          function() {
        dp.openDirectiveTestPage();
        var testField = dp.searchWithoutSug;
        cy.get(testField).click().type('zzz').blur();
        dp.checkModel(testField, 'listFieldVal4b', {text: 'zzz', _notOnList: true});
        // Now set it to an empty value.  The model value should be null.
        cy.get(testField).click().clear().blur();
        dp.checkModel(testField, 'listFieldVal4b', null);
      });
    });
  });
});
