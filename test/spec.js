
describe('angularjs homepage', function() {
  it('should have a title', function() {
    browser.driver.get('http://localhost:3000/autoComp_test.html');

    expect(browser.driver.getTitle()).toEqual('JavaScript unit test file');
  });
});
