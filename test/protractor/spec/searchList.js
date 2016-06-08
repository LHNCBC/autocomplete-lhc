var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('search lists', function() {
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
    po.alleleSearch.sendKeys('rs');
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
    s.sendKeys('ar');
    po.waitForSearchResults();
    expect(po.listIsVisible()).toBeTruthy();
  });

  it('should remove LIST_ITEM_FIELD_SEP from search strings', function() {
    po.nonField.click(); // hide the list (from previous test)
    po.searchCNE.click();
    po.searchCNE.sendKeys('ab - c');
    // Check that the result is the same as 'ab c'
    po.waitForSearchResults();
    expect(po.listIsVisible()).toBeTruthy();
    expect(po.firstSearchRes.getInnerHtml()).toEqual('CAD3');
    expect(po.secondSearchRes.getInnerHtml()).toEqual('zArm pain3');

    // Now try the non-match suggestion list.
    po.searchCWE.click();
    po.searchCWE.sendKeys('ab - c');
    po.nonField.click(); // leave the field to trigger the suggestions
    browser.wait(function() {
      return po.suggestionDialog.isPresent();
    }, 5000);
    expect(po.suggestionDialog.isDisplayed()).toBeTruthy();
    expect(po.firstSugLink.isDisplayed()).toBeTruthy();
    expect(po.firstSugLink.getInnerHtml()).toEqual('Blue');
    // Close the dialog before continuing to the next test
    po.suggestionDialogClose.click();
  });

  describe('clearCachedResults', function() {
    it('should cause new results to be fetched for the next search', function () {
      po.openTestPage(); // clear field values
      po.nonField.click(); // hide the list (from previous test)
      po.searchCNE.click();
      po.searchCNE.sendKeys('ar');
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
      po.searchCNE.sendKeys('ar');
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
      po.searchCNE.sendKeys('ar');
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arachnoiditis');
      // Now change the URL and reset the cache
      po.nonField.click(); // hide the list
      browser.driver.executeScript(
        'jQuery("'+po.searchCNECSS+'")[0].autocomp.setURL("/form/get_search_res_list?fd_id=2163")');
      // Try the search again-- it should be different
      po.clearField(po.searchCNE);
      po.searchCNE.click();
      po.searchCNE.sendKeys('ar');
      po.waitForSearchResults();
      po.firstSearchRes.click();
      expect(po.searchCNE.getAttribute('value')).toEqual('Arm pain');
      // Note:  Subsequent tests (if there are any) should reload the page to avoid odd results
    });
  });
});
