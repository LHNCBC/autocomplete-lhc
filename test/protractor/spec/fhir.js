var helpers = require('../test_helpers.js');
var po = require('../autocompPage.js');
var fhirField = $('#fhir_search');
var fhirFieldMulti = $('#fhir_search_multi');
var searchFunctionFieldMulti = $('#fhir_search_w_function_multi');
var fhirFieldWButton = $('#fhir_search_w_button');
var fhirFieldButtonID = 'fhir_search_button';
var fhirFieldButton = $('#'+fhirFieldButtonID);

describe('FHIR Search Lists', function() {

  beforeAll(function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(fhirFieldButtonID);
  });

  it('should show 7 results for a non-expanded search', function() {
    po.sendKeys(fhirField, 'pmol');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
    expect(po.listCountMessage().then((val)=>{
      return val.indexOf('7 of 10 total') >= 0;
    })).toBe(true);
    po.firstSearchRes.click();
    expect(fhirField.getAttribute('value')).toBe('picomole');
  });

  it('should show > 7 results for an expanded search', function() {
    po.clearField(fhirField);
    po.waitForNoSearchResults();
    po.sendKeys(fhirField, 'pmol');
    po.waitForSearchResults();
    po.expandLink.click();
    expect(po.shownItemCount()).toBe(10);
    po.firstSearchRes.click();
    expect(fhirField.getAttribute('value')).toBe('picomole');
  });

  it('should show 7 results after an expanded search', function() {
    // At one point, the expanded list was getting cached in place of the regular list
    po.clearField(fhirField);
    po.sendKeys(fhirField, 'pmol');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
    po.firstSearchRes.click(); // to dismiss the list
  });

  it('should work with the search button', function() {
    po.sendKeys(fhirFieldWButton, 'pmol');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
    fhirFieldButton.click();
    expect(po.shownItemCount()).toBe(10);
    po.firstSearchRes.click(); // to dismiss the list
    po.clearField(fhirField);
    po.sendKeys(fhirField, 'pmol');
    expect(po.shownItemCount()).toBe(7);
  });

  it('should show 7 results after selecting items', function() {
    // autoCompSearch should request extra items when some are selected
    po.sendKeys(fhirFieldMulti, 'pmol');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
    expect(po.listCountMessage().then((val)=>{
      return val.indexOf('7 of 10 total') >= 0;
    })).toBe(true);
    po.firstSearchRes.click();
    po.clearField(fhirFieldMulti);
    po.sendKeys(fhirFieldMulti, 'pmol');
    expect(po.shownItemCount()).toBe(7);
    expect(po.listCountMessage().then((val)=>{
      return val.indexOf('7 of 10 total') >= 0;
    })).toBe(true);
  });
});

describe('FHIR search by function', function() {
  var searchFunctionFieldID = 'fhir_search_w_function';
  var searchFunctionField = $('#'+searchFunctionFieldID);

  beforeAll(function() {
    po.openTestPage();
  });

  it('should show 5 results when empty', function() {
    po.sendKeys(searchFunctionField, '');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(5);
  });

  it('should show 7 results for a non-expanded search', function() {
    po.sendKeys(searchFunctionField, 'b');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
  });

  it('should show > 7 results for an expanded search', function() {
    po.expandLink.click();
    expect(po.shownItemCount()).toBe(10);
    po.sendKeys(searchFunctionField, protractor.Key.ESCAPE); // close the list
  });

  it('should have its own results cache', function() {
    // Confirm that we get different results for a second fhir search field
    var secondField = $('#fhir_search_cache_test');
    secondField.click();
    po.sendKeys(secondField, 'b');
    expect(po.firstSearchRes.getText()).toBe("Back pain 2");
  });

  it('should show 7 results after selecting items', function() {
    // autoCompSearch should request extra items when some are selected
    po.sendKeys(searchFunctionFieldMulti, '');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
    expect(po.listCountMessage().then((val)=>{
      return val.indexOf('7 of 621 total') >= 0;
    })).toBe(true);
    po.firstSearchRes.click();
    po.sendKeys(searchFunctionFieldMulti, 'b');
    expect(po.shownItemCount()).toBe(7);
    expect(po.listCountMessage().then((val)=>{
      return val.indexOf('7 of 621 total') >= 0;
    })).toBe(true);
  });

});

describe('Non FHIR search by function', function() {
  var searchFunctionFieldID = 'non_fhir_search_w_function';
  var searchFunctionField = $('#'+searchFunctionFieldID);

  beforeAll(function() {
    po.openTestPage();
  });

  it('should show 7 results for a non-fhir search', function() {
    po.sendKeys(searchFunctionField, 'b');
    po.waitForSearchResults();
    expect(po.shownItemCount()).toBe(7);
  });

});

