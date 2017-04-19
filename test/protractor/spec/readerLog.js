// Tests for the screen reader log

var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('Screen reader log', function() {
  beforeAll(function() {
    po.openTestPage();
  });

  afterEach(function() {
    // Hide the autocompleter list
    browser.executeScript('if (Def.Autocompleter.currentAutoCompField_) {'+
        'jQuery("#"+Def.Autocompleter.currentAutoCompField_)[0].autocomp.hideList();'+
      '}');
  });

  describe('lists with headings', function() {
    it('should not count headings with the item count', function() {
      po.headings1ColCWE.click();
      expect(po.nthLastLogEntry(2)).toEqual('Showing 12 of 135 items total.');
    });

    it('should reading headings when passed over with arrow keys', function() {
      // The first down-arrow press will cross a header.  The header should be
      // read.  (The list item does not go into the screen reader log (not for
      // non-table-format lists anyway), because JAWS reads the value that is
      // put into the field.)
      po.headings1ColCWE.sendKeys(protractor.Key.ARROW_DOWN);
      expect(po.nthLastLogEntry(1)).toEqual('Under list heading: Food allergies');
      // Arrow down under the next heading
      po.headings1ColCWE.sendKeys(protractor.Key.ARROW_DOWN);
      po.headings1ColCWE.sendKeys(protractor.Key.ARROW_DOWN);
      po.headings1ColCWE.sendKeys(protractor.Key.ARROW_DOWN);
      expect(po.nthLastLogEntry(1)).toEqual(
        'Under list heading: Environmental allergies');
      // Arrow back up over that heading
      po.headings1ColCWE.sendKeys(protractor.Key.ARROW_UP);
      expect(po.nthLastLogEntry(1)).toEqual('Above list heading: Environmental allergies');
    });
  });

  describe('table-format lists', function() {
    it('should read the whole row highlighted by arrow keys', function() {
      po.multiFieldSearchHeaders.click();
      po.multiFieldSearchHeaders.sendKeys('ar');
      po.multiFieldSearchHeaders.sendKeys(protractor.Key.ARROW_DOWN);
      expect(po.nthLastLogEntry(1)).toEqual('Arm pain; pain in arm');
    });

    it('should read the column headers', function() {
      po.multiFieldSearchHeaders.click();
      po.clearField(po.multiFieldSearchHeaders);
      po.multiFieldSearchHeaders.sendKeys('ar');
      expect(po.nthLastLogEntry(1)).toEqual('The column headers on the multi-column list are C1; C2');
    });
  });

});
