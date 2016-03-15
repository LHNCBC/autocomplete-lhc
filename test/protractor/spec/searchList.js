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
});
