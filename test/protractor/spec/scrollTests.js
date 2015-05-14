var po = require('../autocompPage.js');
describe('autocomp scroll function', function() {
  it('should scroll the list into view', function() {
    po.openTestPage();
    browser.manage().window().setSize(1100, 473); // height just includes #long_odd_cne
    expect(po.windowScrollTop()).toBe(0);
    po.longOddCNE.click();
    expect(po.windowScrollTop()).toBeGreaterThan(0);
  });


  it('should not scroll the list into view when that is disabled', function() {
    po.openTestPage();
    // Set the window height so it just includes #long_odd_cne
    browser.driver.executeScript('return jQuery("'+po.longOddCNENoScrollCSS+
      '").offset().top').then(function(top) {
      // The returned offset top value is not completely right, it seems,
      // so, I am adding adding extra height pixels in the setSize call below.
      browser.manage().window().setSize(1100, top+100);
      po.longOddCNENoScroll.click();
      expect(po.windowScrollTop()).toBe(0);
    });
  });
});
