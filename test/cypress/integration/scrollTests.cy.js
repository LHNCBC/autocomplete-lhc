import { default as po } from '../support/autocompPage.js';

describe('autocomp scroll function', function() {
  var windowSize;

  before(function() {
    // Store the current size of the window before we run the tests below which
    // resize the window.
    cy.window().then(win=>windowSize = {width: win.outerWidth, height: win.outerHeight});
  });

  after(function() {
    // Reset the window to its full size for subsequent tests
    cy.window().then(win=>win.resizeTo(windowSize.width, windowSize.height));
  });

  it('should scroll the list into view', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.longOddCNEID);
    po.windowScrollTop().then(winScrollPos=>{
      cy.get(po.longOddCNE).click();
      po.windowScrollTop().should('be.greaterThan', winScrollPos);
    });
  });


  it('should not scroll the list into view when that is disabled', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.longOddCNENoScrollID);
    po.windowScrollTop().then(winScrollPos=> {
      cy.get(po.longOddCNENoScrollCSS).click({scrollBehavior: false});
      po.windowScrollTop().should('equal', winScrollPos); // no change
    });
  });


  it('should not scroll the list into the header bar', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.longOddCNENoScrollID);
    // Get the position of the test field
    cy.get(po.longOddCNECSS).then(el=>{
      let fieldTop = el[0].getBoundingClientRect().top;
      // Add a top header bar.
      // Extend the height down to the top of the field, so that it doesn't
      // scroll.
      var headerBar = '<div id=\'testHeaderBar\' style=\'background-color: blue; height: '+
        fieldTop+'px; position: fixed; top: 0; width: 75px\'></div>'
      cy.window().then(win=>{
        win.document.body.appendChild(win.jQuery(headerBar)[0]);
        po.windowScrollTop().then(initialWinScroll=>{
          // Now click in the field.  The field shouldn't move upward.
          cy.get(po.longOddCNE).click({scrollBehavior: false});
          cy.wait(200); // allow for scrolling to happen, if any
          po.windowScrollTop().should('equal', initialWinScroll).then(()=>{

            // Now shorten the header and confirm that the field scrolls
            win.jQuery("#testHeaderBar")[0].style.height="10px";
            cy.get(po.nonField).click();
            po.putElementAtBottomOfWindow(po.longOddCNENoScrollID);
            cy.get(po.longOddCNE).click({scrollBehavior: false});
            cy.wait(200); // allow for scrolling to happen, if any
            po.windowScrollTop().should('be.greaterThan', initialWinScroll);
          });
        });
      });
    });
  });


  it('should scroll as much as possible when the list is large', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.multiHeadingCWEID);
    // Test that when the long list is expanded, the field gets scrolled up to
    // the top of the window.
    cy.get(po.multiHeadingCWE).click({scrollBehavior: false});
    cy.get(po.multiHeadingCWE).type('{control+enter}');
    // Here we take the difference between the field's container (which
    // holds the selected item list) and the page's scrollTop.  It should be
    // zero, meaning that the page was scrolled up as far as we allow.
    po.waitForScrollToStop(po.multiHeadingCWEID);
    cy.window().then(win=>{
      cy.wrap(win.document.body.scrollTop || win.document.documentElement.scrollTop).should('equal',
        (win.jQuery('#'+po.multiHeadingCWEID)[0].parentNode.offsetTop));
    });
  });


  it('should stop scrolling if the field blurs', function () {
    // The reason for this is that if the page is being scrolled for field A,
    // and the user clicks in field B, field B might get scrolled out of view.
    // To test for this, we repeat the events in
    // 'should scroll as much as possible when the list is large'
    // in which the field was scrolled to the top, but shift-tab to the previous
    // field before the scrolling is done.
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.multiHeadingCWEID);
    cy.get(po.multiHeadingCWE).click({scrollBehavior: false}).type('{control+enter}').blur();
    // Confirm the event was canceled
    cy.window().then(win=>{
      cy.wrap(win.jQuery('#'+po.multiHeadingCWEID)[0].autocomp.lastScrollEffect_.state).should('equal', 'finished');
    });
  });

  it('should place list under the autocomplete control on a dialog', function() {
    cy.get(po.myButton).click();
    cy.get(po.prefetchCNEOnModal).should('be.visible');
    cy.get(po.prefetchCNEOnModal).click();
    po.waitForSearchResults();
    cy.window().then(win => {
      // Verify that the search result list is placed right under the autocommpleter-lhc control.
      const autocompElement = win.document.getElementById(po.prefetchCNEOnModalFieldName);
      const autocompElementOffset = autocompElement.getBoundingClientRect();
      const searchResultElement = win.document.getElementById("searchResults");
      const searchResultElementOffset = searchResultElement.getBoundingClientRect();
      expect(Math.abs(searchResultElementOffset.top - autocompElementOffset.bottom)).to.be.lessThan(0.5);
    });
  });
});
