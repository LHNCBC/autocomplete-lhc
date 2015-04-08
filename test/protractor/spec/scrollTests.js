var po = require('../autocompPage.js');
describe('autocomp scroll function', function() {
  it('should scroll the list into view', function() {
    po.openTestPage();
    browser.manage().window().setSize(1100, 473); // 323 = just below #long_odd_cne
    expect(po.windowScrollTop()).toBe(0);
    po.longOddCNE.click();
    expect(po.windowScrollTop()).toBeGreaterThan(0);
  });


  it('should not scroll the list into view when that is disabled', function() {
    po.openTestPage();
    browser.manage().window().setSize(1100, 473); // 323 = just below #long_odd_cne
    expect(po.windowScrollTop()).toBe(0);
    po.longOddCNENoScroll.click();
    expect(po.windowScrollTop()).toBe(0);
  });
});
