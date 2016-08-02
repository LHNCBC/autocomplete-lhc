// Tests for multi-field lists
var po = require('../autocompPage.js');
var hasClass = require('../test_helpers').hasClass;

describe('multi-field lists', function() {
  beforeAll(function() {
    po.openTestPage();
  });


/* Commenting out multi-field prefetch tests until we support that

  it('should show both fields in the list', function() {
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
    po.multiFieldSearch.click();
    po.multiFieldSearch.sendKeys('ar');
    po.waitForSearchResults();
    expect(po.tableSearchResult(1).isPresent(0)).toBe(true);
    expect(po.tableSearchResult(1).getInnerHtml()).toBe(
      '<td>Arm pain</td><td>pain in arm</td>');
  });

  it('should put only the second field into the search form field when configured that way',
     function() {
    po.tableSearchResult(1).click();
    expect(po.multiFieldSearch.getAttribute('value')).toBe('pain in arm');
  });


  it('should function properly with the multi-select feature', function() {
    po.multiSelectTableSearch.click();
    po.multiSelectTableSearch.sendKeys('ar');
    po.waitForSearchResults();
    expect(po.tableSearchResult(1).getInnerHtml()).toBe('<td>NM_001113511</td>');
    po.tableSearchResult(1).click();
    expect(po.getSelectedItems(po.multiSelectTableSearchID)).toEqual(
      ['NM_001113511']);
    expect(po.shownItemCount()).toBe(6);
    expect(po.tableSearchResult(1).getInnerHtml()).not.toBe('<td>NM_001113511</td>');
    po.nonField.click();
    po.multiSelectTableSearch.click();
    po.multiSelectTableSearch.sendKeys('ar');
    expect(po.shownItemCount()).toBe(6);
    expect(po.tableSearchResult(1).getInnerHtml()).not.toBe('<td>NM_001113511</td>');
  });


  it('should show the column headers when those are specified', function() {
    po.multiFieldSearchHeaders.click();
    po.multiFieldSearchHeaders.sendKeys('ar');
    expect(po.tableSearchResult(1).getInnerHtml()).toBe('<th>C1</th><th>C2</th>');
    // Make sure we can't click on the header and select it
    po.tableSearchResult(1).click();
    expect(po.multiFieldSearchHeaders.getAttribute('value')).toBe('ar');
    // Make sure we don't select the header by arrowing down
    po.multiFieldSearchHeaders.sendKeys(protractor.Key.ARROW_DOWN);
    element.all(by.css(po.searchResCSS + ' tr:nth-child(1)')).then(
         function(firstRows) {
      // firstRows contains the header row and then the first row of tbody.
      expect(firstRows.length).toBe(2);
      expect(hasClass(firstRows[0], 'selected')).toBe(false);
      expect(hasClass(firstRows[1], 'selected')).toBe(true);
    });
  });
});
