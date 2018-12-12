var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('search lists', function() {
  it('should prefer a case-sensitive match when attempting a selection', function() {
    // In the UCUM list, both "pA" and "Pa" appear as units, and the one the
    // user types should be selected when they leave the field.
    po.openTestPage();
    po.sendKeys(po.csMatchSearch, 'pA');
    po.waitForSearchResults();
    po.csMatchSearch.sendKeys(protractor.Key.TAB);
    expect(po.csMatchSearch.getAttribute('value')).toEqual('pA');
    po.clearField(po.csMatchSearch);
    po.sendKeys(po.csMatchSearch, 'Pa');
    po.waitForSearchResults();
    po.csMatchSearch.sendKeys(protractor.Key.TAB);
    expect(po.csMatchSearch.getAttribute('value')).toEqual('Pa');
  });

  it('should not run an AJAX call on a control+a (select all) event',
      function() {
    // The problem case is (was) noticeable if after you select an item from the
    // list, you return to the field and hit control+a.
    po.openTestPage();
    expect(po.getAjaxCallCount()).toBe(0);
    po.autocompPickFirst(po.searchCWE, 'ar');
    expect(po.getAjaxCallCount()).toBe(2); // two characters = two AJAX calls
    expect(po.searchCWE.getAttribute('value')).toEqual('Arm pain');
    po.searchCWE.click();
    po.searchCWE.sendKeys(protractor.Key.CONTROL, 'a'); // select all
    expect(po.getAjaxCallCount()).toBe(2);
  });


  it('should run an AJAX call on a control+v (paste) event', function() {
    // The user should be able to paste a value into field and have it
    // autocomplete.  (Although, I don't think it will work yet if the user uses
    // the mouse to paste.)
    po.openTestPage();
    expect(po.getAjaxCallCount()).toBe(0);
    // Enter some text in a non-ajax field and copy it.
    var nonAutoField = po.prefetchCWE;
    nonAutoField.sendKeys('ar');
    nonAutoField.sendKeys(protractor.Key.CONTROL, 'a'); // select all
    nonAutoField.sendKeys(protractor.Key.CONTROL, 'c'); // copy
    expect(po.getAjaxCallCount()).toBe(0);
    // Paste into an autocompleting field
    po.searchCNE.click();
    po.searchCNE.sendKeys(protractor.Key.CONTROL, 'v'); // paste
    po.waitForSearchResults();
    expect(po.getAjaxCallCount()).toBe(1);
  });


  it('should find results for field values with leading whitespace',
      function() {
    po.openTestPage();
    // Note:  Trailing whitespace is significant (signifying that a wildcard
    // should not be applied) so we don't trim that.
    po.autocompPickFirst(po.searchCWE, '  ar');
    expect(po.searchCWE.getAttribute('value')).toEqual('Arm pain');
  });


  it('can find different results when trailing whitespace is present',
      function() {
    // Trailling whitespace means that a wildcard should not be appended, which
    // is why different results are possible.
    po.openTestPage();
    po.autocompPickFirst(po.searchCNE, 'max');
    expect(po.searchCNE.getAttribute('value')).toEqual(
      'MAXIFED REFORMULATED JUL 2008 (Oral Pill)');
    po.autocompPickFirst(po.searchCNE, 'max ');
    expect(po.searchCNE.getAttribute('value')).toEqual(
      'MAX-FREEZE (Topical)');
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
    po.alleleSearch.click();
    po.sendKeys(po.alleleSearch, 'rs');
    // Move to the fourth item and select it
    po.alleleSearch.sendKeys(protractor.Key.ARROW_DOWN);
    po.alleleSearch.sendKeys(protractor.Key.ARROW_DOWN);
    po.alleleSearch.sendKeys(protractor.Key.ARROW_DOWN);
    po.alleleSearch.sendKeys(protractor.Key.ARROW_DOWN);
    po.alleleSearch.sendKeys(protractor.Key.TAB);
    expect(po.alleleSearch.getAttribute('value')).toBe('20668');
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

    for (var i=0, len=ids.length; i<len; ++i) {
      var recID = ids[i];
      var extraData = browser.driver.executeScript('return '+
        'jQuery("#allele_search")[0].autocomp.getItemExtraData("'+recID+
        '");');
      expect(extraData).toEqual(expected[recID]);
    }
  });

  it('should allow an element to be passed to the constructor', function() {
    var s = $('#search_for_el');
    expect(po.listIsVisible()).toBeFalsy();
    s.click();
    po.sendKeys(s, 'ar');
    po.waitForSearchResults();
    expect(po.listIsVisible()).toBeTruthy();
  });

  it('should remove LIST_ITEM_FIELD_SEP from search strings', function() {
    po.openTestPage();
    po.searchCNE.click();
    po.searchCNE.sendKeys('ab - c');
    // Check that the result is the same as 'ab c'
    po.waitForSearchResults();
    expect(po.listIsVisible()).toBeTruthy();
    expect(po.firstSearchRes.getText()).toEqual('CAD3');
    expect(po.secondSearchRes.getText()).toEqual('zArm pain3');
  });

  describe('clearCachedResults', function() {
    it('should cause new results to be fetched for the next search', function () {
      po.openTestPage(); // clear field values
      po.nonField.click(); // hide the list (from previous test)
      po.searchCNE.click();
      po.sendKeys(po.searchCNE, 'ar');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arachnoiditis');
      // Now change the URL and reset the cache
      po.nonField.click(); // hide the list
      browser.driver.executeScript(
        'jQuery("'+po.searchCNECSS+'")[0].autocomp.url = "/form/get_search_res_list?fd_id=2163"');
      browser.driver.executeScript(
        'jQuery("'+po.searchCNECSS+'")[0].autocomp.clearCachedResults()');
      // Try the search again-- it should be different
      po.clearField(po.searchCNE);
      po.searchCNE.click();
      po.sendKeys(po.searchCNE, 'ar');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arm pain');
      // Note:  Subsequent tests (if there are any) should reload the page to avoid odd results
    });
  });

  describe('setURL', function() {
    it('should cause new results to be fetched for the next search', function () {
      // This is the same test as for clearCachedResults, but I wanted to test
      // both functions directly, because both will documented.
      po.openTestPage();
      po.searchCNE.click();
      po.sendKeys(po.searchCNE, 'ar');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arachnoiditis');
      // Now change the URL and reset the cache
      po.nonField.click(); // hide the list
      browser.driver.executeScript(
        'jQuery("'+po.searchCNECSS+'")[0].autocomp.setURL("/form/get_search_res_list?fd_id=2163")');
      // Try the search again-- it should be different
      po.clearField(po.searchCNE);
      po.searchCNE.click();
      po.sendKeys(po.searchCNE, 'ar');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arm pain');
      // Note:  Subsequent tests (if there are any) should reload the page to avoid odd results
    });
  });


  describe('cache', function() {
    it('should allow fields with the same URL and different IDs to use the '+
       'same cached values', function() {
      po.openTestPage();
      expect(po.getAjaxCallCount()).toBe(0);
      // Use two fields with different URLs
      po.autocompPickFirst(po.searchCNE, 'ar');
      expect(po.searchCNE.getAttribute('value')).toEqual('Arachnoiditis');
      expect(po.getAjaxCallCount()).toBe(2); // two characters
      po.autocompPickFirst(po.searchCWE, 'ar');
      expect(po.searchCWE.getAttribute('value')).toEqual('Arm pain');
      expect(po.getAjaxCallCount()).toBe(4); // two more characters
      // Confirm that if we send the same request a second time, no further AJAX
      // calls are made.
      po.autocompPickFirst(po.searchCWE, 'ar');
      expect(po.searchCWE.getAttribute('value')).toEqual('Arm pain');
      expect(po.getAjaxCallCount()).toBe(4);
      // Now change searchCNE to have the same URL as search CWE
      browser.driver.executeScript(
        'jQuery("'+po.searchCNECSS+'")[0].autocomp.setURL("/form/get_search_res_list?fd_id=2163")');
      // Confirm that with the new URL, no new AJAX call is made for the same
      // search string.
      po.autocompPickFirst(po.searchCNE, 'ar');
      expect(po.searchCWE.getAttribute('value')).toEqual('Arm pain');
      expect(po.getAjaxCallCount()).toBe(4);
    });
  });


  describe('getItemData', function() {
    describe('for items picked from the autocompletion list', function() {
      it('should return the code system when available', function() {
        po.openTestPage();
        po.searchCWE.click();
        po.sendKeys(po.searchCWE, 'ar');
        po.waitForSearchResults();
        po.firstSearchRes.click();
        let itemData = browser.driver.executeScript(
          'return jQuery("#'+po.searchCWEID+'")[0].autocomp.getItemData();');
        expect(itemData).toEqual({code: "2958", text: "Arm pain",
          data: {term_icd9_code: "729.5"},  code_system: "gopher"});
      });
      it('should not include the code system when not available', function() {
        po.searchCNE.click();
        po.sendKeys(po.searchCNE, 'ar');
        po.waitForSearchResults();
        po.firstSearchRes.click();
        let itemData = browser.driver.executeScript(
          'return jQuery("'+po.searchCNECSS+'")[0].autocomp.getItemData();');
        expect(itemData).toEqual({code: "5529", text: "Arachnoiditis",
          data: {term_icd9_code: "322.9"}});
      });
      it('should not include "data" when not available', function() {
        po.clearField(po.searchCNE);
        po.sendKeys(po.searchCNE, 'max');
        po.waitForSearchResults();
        po.firstSearchRes.click();
        let itemData = browser.driver.executeScript(
          'return jQuery("'+po.searchCNECSS+'")[0].autocomp.getItemData();');
        expect(itemData.data).toBe(undefined);
      });
    });
  });

  describe('sort option', function() {
    describe('suggestion mode 0 (no suggestions)', function () {
      it('should return the results in their original order', function() {
        po.openTestPage();
        let field = $('#search0NoSort_cwe');
        field.click();
        po.sendKeys(field, 'ar');
        po.waitForSearchResults();
        expect(po.firstSearchRes.getText()).toEqual("Coronary artery disease (CAD)");
        // Next two are unsorted
        expect(po.fifthSearchRes.getText()).toEqual("Shoulder or upper arm injury");
        expect(po.searchResult(6).getText()).toEqual("Kidney failure (short-term renal failure)");
      });
    });

    describe('suggestion mode 1 (shortest)', function () {
      it('should return the results in their original order but with a suggestion at the top', function() {
        po.openTestPage();
        let field = $('#search1NoSort_cwe');
        field.click();
        po.sendKeys(field, 'ar');
        po.waitForSearchResults();
        expect(po.firstSearchRes.getText()).toEqual("Arm pain");
        // Next two are unsorted
        expect(po.fifthSearchRes.getText()).toEqual("Shoulder or upper arm injury");
        expect(po.searchResult(6).getText()).toEqual("Kidney failure (short-term renal failure)");
      });
    });

    describe('suggestion mode 2 (statistics)', function () {
      it('should return the results in their original order', function() {
        // In this case the "suggestion" is the top-most item from the original
        // order.  If the "sort" option were enabled, the rest of the items
        // would be sorted, but it is not, so this case is actually the same as
        // suggestion mode 0.
        po.openTestPage();
        let field = $('#search2NoSort_cwe');
        field.click();
        po.sendKeys(field, 'ar');
        po.waitForSearchResults();
        expect(po.firstSearchRes.getText()).toEqual("Coronary artery disease (CAD)");
        // Next two are unsorted
        expect(po.fifthSearchRes.getText()).toEqual("Shoulder or upper arm injury");
        expect(po.searchResult(6).getText()).toEqual("Kidney failure (short-term renal failure)");
      });
    });
  });

  describe('non-match suggestions', function() {
    beforeAll(function() {
      po.openTestPage();
      let field = po.searchCWE;
      field.click();
      po.sendKeys(field, 'ar');
      po.sendKeys(field, protractor.Key.TAB);
    });

    it('should generate a suggestion list', function() {
      browser.wait(function() {
        return browser.executeScript(function(){
          return window.fe_search_cwe_suggestions && fe_search_cwe_suggestions.suggestion_list.length>0
        });
      }, 2000);
    });

    it('should be possible to accept a suggestion', function() {
      browser.executeScript(function(fieldID) {
        $('#'+fieldID)[0].autocomp.acceptSuggestion(0);
      }, po.searchCWEID);
      expect(po.searchCWE.getAttribute('value')).toBe('Aortic insufficiency');
    });

    it('should result in a "suggestion used" event after one is accepted', function() {
      browser.wait(function () {
        return browser.executeScript(function() {
          return window.fe_search_cwe_suggUsedData &&
            fe_search_cwe_suggUsedData.field_id === 'fe_search_cwe';
        });
      }, 2000);
    });
  });
});
