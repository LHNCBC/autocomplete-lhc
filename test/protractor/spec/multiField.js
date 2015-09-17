// Tests for multi-field lists
var po = require('../autocompPage.js');
var hasClass = require('../test_helpers').hasClass;

describe('multi-field lists', function() {
/* Commenting out multi-field prefetch tests until we support that

  it('should show both fields in the list', function() {
    po.openTestPage();
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
    po.openTestPage();
    po.multiFieldSearch.click();
    po.multiFieldSearch.sendKeys('mtest');
    expect(po.tableSearchResult(1).isPresent(0)).toBe(true);
    expect(po.tableSearchResult(1).getInnerHtml()).toBe(
      '<td>Arm pain</td><td>pain in arm</td>');
  });

  it('should put only the second field into the search form field when configured that way',
     function() {
    po.tableSearchResult(1).click();
    expect(po.multiFieldSearch.getAttribute('value')).toBe('pain in arm');
  });

});
