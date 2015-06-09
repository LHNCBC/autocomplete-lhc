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
      // so I am adding adding extra height pixels in the setSize call below.
      browser.manage().window().setSize(1100, top+100);
      po.longOddCNENoScroll.click();
      expect(po.windowScrollTop()).toBe(0);
    });
  });


  it('should not scroll the list into the header bar', function() {
    po.openTestPage();
    // Get the position of the test field

    browser.driver.executeScript('return jQuery("'+po.longOddCNECSS+
      '").offset().top').then(function(fieldTop) {
      // Add a top header bar.
      // Extend the height down to the top of the field, so that it doesn't
      // scroll.
      var headerBar = '<div id=\'testHeaderBar\' style=\'background-color: blue; height: '+
        fieldTop+'px; position: fixed; top: 0; width: 100px\'></div>'
      browser.driver.executeScript('document.body.appendChild(jQuery("'+
           headerBar+'")[0])').then(function() {
        expect(po.windowScrollTop()).toBe(0); // precondition
        // Now click in the field.  The field shouldn't move upward.
        po.longOddCNE.click();
        expect(po.windowScrollTop()).toBe(0);
        // Now shorten the header and confirm that the field scrolls
        browser.executeScript('jQuery("#testHeaderBar")[0].style.height="10px"').
            then(function() {
          po.nonField.click();
          po.longOddCNE.click();
          expect(po.windowScrollTop()).toNotBe(0);
        });
      })
    });
  });
});
