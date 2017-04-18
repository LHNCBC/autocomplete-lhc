// Tests for the screen reader log

var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');

describe('Screen reader log', function() {

  describe('lists with headings', function() {
    it('should not count headings with the item count', function() {
      po.openTestPage();
      po.headings1ColCWE.click();
      expect(po.nthLastLogEntry(2)).toEqual('Showing 12 of 135 items total.');
    });
  });

});
