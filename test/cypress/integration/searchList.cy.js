import { default as po } from '../support/autocompPage.js';

describe('search lists', function() {
  it('should prefer a case-sensitive match when attempting a selection', function() {
    // In the UCUM list, both "pA" and "Pa" appear as units, and the one the
    // user types should be selected when they leave the field.
    po.openTestPage();
    cy.get(po.csMatchSearch).type('pA');
    po.waitForSearchResults();
    cy.get(po.nonField).click();
    cy.get(po.csMatchSearch).should('have.value', 'pA')
    cy.get(po.csMatchSearch).should('not.have.class', 'no_match');

    cy.get(po.csMatchSearch).clear().type('Pa');
    po.waitForSearchResults();
    cy.get(po.nonField).click();
    cy.get(po.csMatchSearch).should('have.value', 'Pa');
    cy.get(po.csMatchSearch).should('not.have.class', 'no_match');
  });

  it('should not run an AJAX call on a control+a (select all) event',
      function() {
    // The problem case is (was) noticeable if after you select an item from the
    // list, you return to the field and hit control+a.
    po.openTestPage();
    po.getAjaxCallCount().should('equal', 0);
    po.autocompPickFirst(po.searchCWESel, 'ar');
    po.getAjaxCallCount().should('equal', 2); // two characters = two AJAX calls
    cy.get(po.searchCWESel).should('have.value', 'Arm pain');
    cy.get(po.searchCWESel).click().type('{control+a}'); // select all
    po.getAjaxCallCount().should('equal', 2);
  });


  // Disabled because Cypress does not implement control+c or control+v as copy/paste.
  xit('should run an AJAX call on a control+v (paste) event', function() {
    // The user should be able to paste a value into field and have it
    // autocomplete.  (Although, I don't think it will work yet if the user uses
    // the mouse to paste.)
    po.openTestPage();
    po.getAjaxCallCount().should('equal', 0);
    // Enter some text in a non-ajax field and copy it.
    var nonAutoField = po.prefetchCWE;
    cy.get(nonAutoField).type('ar');
    cy.get(nonAutoField).type('{control+a}'); // select all
    cy.get(nonAutoField).type('{control+c}'); // copy
    po.getAjaxCallCount().should('equal', 0);
    // Paste into an ajax autocompleting field
    cy.get(po.searchCNESel).click().type('{control+v}'); // paste
    po.waitForSearchResults();
    po.getAjaxCallCount().should('equal', 1);
  });


  it('should find results for field values with leading whitespace',
      function() {
    po.openTestPage();
    // Note:  Trailing whitespace is significant (signifying that a wildcard
    // should not be applied) so we don't trim that.
    po.autocompPickFirst(po.searchCWESel, '  ar');
    cy.get(po.searchCWESel).should('have.value', 'Arm pain');
  });


  it('can find different results when trailing whitespace is present',
      function() {
    // Trailling whitespace means that a wildcard should not be appended, which
    // is why different results are possible.
    po.openTestPage();
    po.autocompPickFirst(po.searchCNESel, 'max');
    cy.get(po.searchCNESel).should('have.value',
      'MAXIFED REFORMULATED JUL 2008 (Oral Pill)');
    po.autocompPickFirst(po.searchCNESel, 'max ');
    cy.get(po.searchCNESel).should('have.value', 'MAX-FREEZE (Topical)');
  });


  // This test passed in Firefox before I even made the fix.  Apparently Linux
  // Firefox (but not Windows Firefox or Windows Chrome) does not have the
  // problem, and it is Linux Firefox we are testing with.  I will leave the
  // test here to make sure the Linux Firefox handling continues to work.
  it('should correctly associate values and extra data objects', function() {
    // Previously we had a case were itemExtraData_ was not correctly
    // initialized, and so sometimes field values were not correctly matched to
    // the extra data fields.
    po.openTestPage();
    cy.get(po.alleleSearch).click().type('rs');
    // Move to the fourth item and select it
    cy.get(po.alleleSearch).type('{downArrow}{downArrow}{downArrow}{downArrow}').blur();
    cy.get(po.alleleSearch).should('have.value', '20668');
    // It was 20668's extra data that was switched with another row, but check
    // all of them to be sure.
    var expected = {
       "20644": {"RefSeqID": "NM_012144.3", "GeneSymbol":"DNAI1"},
       "20663": {"RefSeqID": "NM_001099274.1", "GeneSymbol":"TINF2"},
       "20668": {"RefSeqID": "NM_000154.1", "GeneSymbol":"GALK1"},
       "20665": {"RefSeqID": "NM_001099274.1", "GeneSymbol":"TINF2"},
       "20680": {"RefSeqID": "NM_000030.2", "GeneSymbol":"AGXT"},
       "20685": {"RefSeqID": "NM_000030.2", "GeneSymbol":"AGXT"},
       "20694": {"RefSeqID": "NM_005807.4", "GeneSymbol":"-"}
    };

    var ids = Object.keys(expected);

    cy.window().then(win=>{
      for (var i=0, len=ids.length; i<len; ++i) {
        var recID = ids[i];
        var extraData = win.document.querySelector("#allele_search").autocomp.getItemExtraData(recID);
        expect(extraData).to.deep.equal(expected[recID]);
      }
    });
  });

  it('should allow an element to be passed to the constructor', function() {
    po.openTestPage();
    cy.get(po.searchResSel).should('not.be.visible');
    cy.get('#search_for_el').click().type('ar');
    po.waitForSearchResults();
    cy.get(po.searchResSel).should('be.visible');
  });

  it('should remove LIST_ITEM_FIELD_SEP from search strings', function() {
    po.openTestPage();
    cy.get(po.searchCNESel).click().type('ab - c');
    // Check that the result is the same as 'ab c'
    po.waitForSearchResults();
    cy.get(po.searchResSel).should('be.visible');
    po.searchResult(1).invoke('text').should('equal', 'CAD3');
    po.searchResult(2).invoke('text').should('equal', 'zArm pain3');
  });

  it('should display unknown total', function() {
    po.openTestPage();
    cy.get(po.csMatchSearch).clear().type('pp');
    po.waitForSearchResults();
    po.checkListCountMessage('4 of unknown total');
    cy.get(po.csMatchSearch).blur().should('have.value', 'pp').clear();
  });

  describe('clearCachedResults', function() {
    it('should cause new results to be fetched for the next search', function () {
      po.openTestPage(); // clear field values
      cy.get(po.nonField).click(); // hide the list (from previous test)
      cy.get(po.searchCNESel).click().type('ar');
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(po.searchCNESel).should('have.value', 'Arachnoiditis');
      // Now change the URL and reset the cache
      cy.get(po.nonField).click(); // hide the list
      cy.window().then(win=>{
        win.document.querySelector(po.searchCNESel).autocomp.url = "/form/get_search_res_list?fd_id=2163";
        win.document.querySelector(po.searchCNESel).autocomp.clearCachedResults();
        // Try the search again-- it should be different
        cy.get(po.searchCNESel).clear().click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).click();
        cy.get(po.searchCNESel).should('have.value', 'Arm pain');
      });
      // Note:  Subsequent tests should reload the page to avoid odd results
    });
  });

  describe('setURL', function() {
    it('should cause new results to be fetched for the next search', function () {
      // This is the same test as for clearCachedResults, but I wanted to test
      // both functions directly, because both will documented.
      po.openTestPage(); // clear field values
      cy.get(po.nonField).click(); // hide the list (from previous test)
      cy.get(po.searchCNESel).click().type('ar');
      po.waitForSearchResults();
      po.searchResult(1).click();
      cy.get(po.searchCNESel).should('have.value', 'Arachnoiditis');
      // Now change the URL and reset the cache
      cy.get(po.nonField).click(); // hide the list
      cy.window().then(win=>{
        win.document.querySelector(po.searchCNESel).autocomp.setURL("/form/get_search_res_list?fd_id=2163");
        // Try the search again-- it should be different
        cy.get(po.searchCNESel).clear().click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).click();
        cy.get(po.searchCNESel).should('have.value', 'Arm pain');
      });
      // Note:  Subsequent tests should reload the page to avoid odd results
    });
  });


  describe('cache', function() {
    it('should allow fields with the same URL and different IDs to use the '+
       'same cached values', function() {
      po.openTestPage();
      po.getAjaxCallCount().should('equal', 0);
      // Use two fields with different URLs
      po.autocompPickFirst(po.searchCNESel, 'ar');
      cy.get(po.searchCNESel).should('have.value', 'Arachnoiditis');
      po.getAjaxCallCount().should('equal', 2); // two characters typed
      po.autocompPickFirst(po.searchCWESel, 'ar');
      cy.get(po.searchCWESel).should('have.value', 'Arm pain');
      po.getAjaxCallCount().should('equal', 4); // two more characters typed
      // Confirm that if we send the same request a second time, no further AJAX
      // calls are made.
      cy.get(po.searchCWESel).clear();
      po.autocompPickFirst(po.searchCWESel, 'ar');
      cy.get(po.searchCWESel).should('have.value', 'Arm pain');
      po.getAjaxCallCount().should('equal', 4);
      // Now change searchCNE to have the same URL as search CWE
      cy.window().then(win=>{
        win.document.querySelector(po.searchCNESel).autocomp.setURL("/form/get_search_res_list?fd_id=2163");
        // Confirm that with the new URL, no new AJAX call is made for the same
        // search string.
        po.autocompPickFirst(po.searchCNESel, 'ar');
        cy.get(po.searchCWESel).should('have.value', 'Arm pain');
        po.getAjaxCallCount().should('equal', 4);
      });
    });
  });


  describe('getItemData', function() {
    describe('for items picked from the autocompletion list', function() {
      it('should return the code system when available', function() {
        po.openTestPage();
        cy.get(po.searchCWESel).click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).click();
        cy.window().then(win=>{
          expect(win.document.querySelector('#'+po.searchCWEID).autocomp.getItemData())
            .to.deep.equal({code: "2958", text: "Arm pain",
              data: {term_icd9_code: "729.5"},  code_system: "gopher"});
        });
      });

      it('should not include the code system when not available', function() {
        cy.get(po.searchCNESel).click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).click();
        cy.window().then(win=>{
          expect(win.document.querySelector(po.searchCNESel).autocomp.getItemData())
            .to.deep.equal({code: "5529", text: "Arachnoiditis",
          data: {term_icd9_code: "322.9"}});
        });
      });

      it('should not include "data" when not available', function() {
        cy.get(po.searchCNESel).clear().type('max');
        po.waitForSearchResults();
        po.searchResult(1).click();
        cy.window().then(win=>{
          expect(win.document.querySelector(po.searchCNESel).autocomp.getItemData().data)
          .to.equal(undefined);
        });
      });
    });
  });

  describe('sort option', function() {
    describe('suggestion mode 0 (no suggestions)', function () {
      it('should return the results in their original order', function() {
        po.openTestPage();
        cy.get('#search0NoSort_cwe').click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).invoke('text').should('equal', "Coronary artery disease (CAD)");
        // Next two are unsorted
        po.searchResult(5).invoke('text').should('equal', 'Shoulder or upper arm injury');
        po.searchResult(6).invoke('text').should('equal', "Kidney failure (short-term renal failure)");
      });
    });

    describe('suggestion mode 1 (shortest)', function () {
      it('should return the results in their original order but with a suggestion at the top', function() {
        po.openTestPage();
        cy.get('#search1NoSort_cwe').click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).invoke('text').should('equal', "Arm pain");
        // Next two are unsorted
        po.searchResult(5).invoke('text').should('equal', "Shoulder or upper arm injury");
        po.searchResult(6).invoke('text').should('equal', "Kidney failure (short-term renal failure)");
      });
    });

    describe('suggestion mode 2 (statistics)', function () {
      it('should return the results in their original order', function() {
        // In this case the "suggestion" is the top-most item from the original
        // order.  If the "sort" option were enabled, the rest of the items
        // would be sorted, but it is not, so this case is actually the same as
        // suggestion mode 0.
        po.openTestPage();
        cy.get('#search2NoSort_cwe').click().type('ar');
        po.waitForSearchResults();
        po.searchResult(1).invoke('text').should('equal', "Coronary artery disease (CAD)");
        // Next two are unsorted
        po.searchResult(5).invoke('text').should('equal', 'Shoulder or upper arm injury');
        po.searchResult(6).invoke('text').should('equal', "Kidney failure (short-term renal failure)");
      });
    });
  });

  describe('non-match suggestions', function() {
    before(function() {
      po.openTestPage();
      cy.get(po.searchCWESel).click().type('ar').blur();
    });

    it('should generate a suggestion list', function() {
      cy.window().then(win=>{
        cy.waitForCondition(()=>win.fe_search_cwe_suggestions &&
          win.fe_search_cwe_suggestions.suggestion_list.length>0).should('equal', true);
      });
    });

    it('should be possible to accept a suggestion', function() {
      cy.window().then(win=>{
        win.document.querySelector(po.searchCWESel).autocomp.acceptSuggestion(0);
        cy.get(po.searchCWESel).should('have.value', 'Aortic insufficiency');
      });
    });

    it('should result in a "suggestion used" event after one is accepted', function() {
      cy.window().then(win=>{
        cy.waitForCondition(()=>win.fe_search_cwe_suggUsedData &&
          win.fe_search_cwe_suggUsedData.field_id).should('equal', 'fe_search_cwe');
      });
    });
  });

  describe('delayed ajax', function(){
    beforeEach(function() {
      po.openTestPage();
      cy.window().then(function(win) {
        win.Def.jqueryLite.ajaxFactory(500);
      });
    });

    it('should cancel previous request on new key stroke', function() {
      po.getAjaxAbortCount().should('equal', 0);
      cy.get(po.searchCNESel).click().type('a');
      cy.get(po.searchCNESel).click().type('r');
      po.getAjaxAbortCount().should('equal', 1);
      po.waitForSearchResults();
      cy.get(po.searchCNESel).click().type('a');
      // Abort count should not increase since the previous request is completed.
      po.getAjaxAbortCount().should('equal', 1);
      cy.get(po.searchCNESel).click().type('a');
      po.getAjaxAbortCount().should('equal', 2);
    });
  });

  describe('loading indicator', function() {
    beforeEach(function() {
      po.openTestPage();
      cy.window().then(function(win) {
        win.Def.jqueryLite.ajaxFactory(2000);
      });
    });

    it('should disable loading indicator', function() {
      cy.get(po.searchCNESel).click().type('ar');
      // A shorter timeout than the ajax delay to make sure the <progress> element never showed.
      cy.get(po.searchCNESel + ' + progress', {timeout: 300}).should('not.exist');
    });

    it('should show loading indicator', function() {
      cy.get(po.alleleSearch).click().type('rs');
      cy.get(po.alleleSearch + ' + progress').should('have.class', 'show');
      cy.get(po.alleleSearch + ' + progress').should('not.have.class', 'show');
      // multi-select search field
      cy.get(po.multiSearchCWE).click().type('rs');
      cy.get(po.multiSearchCWE + ' + progress').should('have.class', 'show');
      cy.get(po.multiSearchCWE + ' + progress').should('not.have.class', 'show');
      // field with a search button
      cy.get('#fe_search_button_cne').click().type('ab');
      cy.get('#fe_search_button_cne_button').click();
      cy.get('#fe_search_button_cne + progress').should('have.class', 'show');
      cy.get('#fe_search_button_cne + progress').should('not.have.class', 'show');
    });

    it('should hide loading indicator when the field is cleared', function() {
      cy.get(po.alleleSearch).clear().type('a');
      cy.get(po.alleleSearch + ' + progress', {timeout: 300}).should('have.class', 'show');
      cy.get(po.alleleSearch).clear();
      // A shorter timeout than the ajax delay to make sure the <progress> element goes away before the ajax request finishes.
      cy.get(po.alleleSearch + ' + progress', {timeout: 300}).should('not.have.class', 'show');
    });
  });
});
