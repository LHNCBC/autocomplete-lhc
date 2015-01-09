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
});


describe('directive', function() {
  var inputElem = $('#ac1');
  var codeField = $('#code');
  var searchResults = $('#searchResults');

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
});
