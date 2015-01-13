helpers = require('./test_helpers.js');
var hasClass = helpers.hasClass;

describe('autocomp', function() {
  it('should not show the list in response to a shift or control key being held down',
     function() {
    browser.get('http://localhost:3000/test/protractor/autocomp_atr.html');
    var inputElem = $('#fe_race_or_ethnicity');
    inputElem.click();
    var searchResults = $('#searchResults');
    expect(searchResults.isDisplayed()).toBeTruthy();
    inputElem.sendKeys(protractor.Key.ESCAPE);
    expect(searchResults.isDisplayed()).toBeFalsy();
    // Now, if we send control or shift, the list should not redisplay
    inputElem.sendKeys(protractor.Key.CONTROL);
    expect(searchResults.isDisplayed()).toBeFalsy();
    inputElem.sendKeys(protractor.Key.SHIFT);
    expect(searchResults.isDisplayed()).toBeFalsy();
    // But if we type an backspace, the list should display
    inputElem.sendKeys(protractor.Key.BACKSPACE);
    expect(searchResults.isDisplayed()).toBeTruthy();
  });

  describe('CNE lists', function() {
    var cneList = $('#fe_multi_sel_cne');
    it('should warn user about invalid values', function() {
      expect(hasClass(cneList, 'no_match')).toBe(false);
      expect(hasClass(cneList, 'invalid')).toBe(false);

      cneList.click();
      cneList.sendKeys('zzz');
      cneList.sendKeys(protractor.Key.TAB); // shift focus from field
      expect(hasClass(cneList, 'no_match')).toBe(true);
      expect(hasClass(cneList, 'invalid')).toBe(true);
      // Focus should be returned to the field
      expect(browser.driver.switchTo().activeElement().getAttribute('id')).toEqual('fe_multi_sel_cne');
    });
  });
});


describe('directive', function() {
  var inputElem = $('#ac1');
  var codeField = $('#code');
  var searchResults = $('#searchResults');
  var multiField = $('#ac2');

  beforeEach(function() {
    browser.get('http://localhost:3000/test/protractor/directiveTest.html');
  });

  it('should create an area on the page for the list', function() {
    expect(searchResults).not.toBeNull();
  });
  it('should assign an ID to the autocompleting field', function() {
    var inputElem = element(by.id('ac1'));
    expect(inputElem).not.toBeNull();
  });
  it('should show the list when the field is clicked', function() {
    var searchResults = $('#searchResults');
    expect(searchResults.isDisplayed()).toBeFalsy();
    inputElem.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
  });
  it('should load the default item code and value', function() {
    expect(inputElem.getAttribute("value")).toEqual('Blue');
    expect(codeField.getAttribute("value")).toEqual('B');
  });
  it('should populate the model when an item is selected', function() {
    inputElem.click();
    expect(searchResults.isDisplayed()).toBeTruthy();
    var item = $('#searchResults li:first-child');
    item.click();
    // Change focus to send change event
    codeField.click();
    expect(inputElem.getAttribute("value")).toEqual('Green');
    expect(codeField.getAttribute("value")).toEqual('G');
  });
  it('should add the placeholder attribute when provided', function() {
    expect(inputElem.getAttribute("placeholder")).toEqual('Select or type a value');
  });

  describe('multi-select lists', function() {
    it('should have an empty selection area initially (without a default setting)',
       function() {
      expect(multiField.isPresent()).toBe(true);
      var list = multiField.element(by.xpath('../ul'));
      expect(list.isPresent()).toBe(true);
      var listItems = list.element(by.xpath('li'));
      expect(listItems.isPresent()).toBe(false);
    });

    it('should be blank (without a default setting)', function() {
      expect(multiField.getAttribute('value')).toEqual('');
    });
  });

  describe('CNE lists', function() {
    var cneListID = 'ac2';
    var cneList = $('#'+cneListID);
    it('should warn user about invalid values', function() {
      expect(hasClass(cneList, 'no_match')).toBe(false);
      expect(hasClass(cneList, 'invalid')).toBe(false);

      cneList.click();
      cneList.sendKeys('zzz');
      cneList.sendKeys(protractor.Key.TAB); // shift focus from field
      expect(hasClass(cneList, 'no_match')).toBe(true);
      expect(hasClass(cneList, 'invalid')).toBe(true);
      expect(browser.driver.switchTo().activeElement().getAttribute('id')).toEqual(cneListID);
    });
  });
});
