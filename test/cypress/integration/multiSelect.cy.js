// Tests for multi-select lists
// See also:  directiveMultiSelect.js
import { default as po } from '../support/autocompPage.js';

describe('multi-select lists', function() {

  it('should allow non-matching values for prefetch CWE lists', function () {
    po.openTestPage();
    // Add a non-list value
    cy.get(po.multiPrefetchCWE).click().type('non-list val 1');
    cy.get(po.nonField).click(); // shift focus from field
    cy.get(po.multiPrefetchCWESelected).should('have.length', 1);
    cy.get(po.multiPrefetchCWE).should('have.value', '');
    // Add a list value
    cy.get(po.multiPrefetchCWE).click();
    po.searchResult(1).click();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 2);
    // Add another non-list value
    cy.get(po.multiPrefetchCWE).click().type('non-list val 2');
    cy.get(po.nonField).click(); // shift focus from field
    cy.get(po.multiPrefetchCWESelected).should('have.length', 3);
    cy.get(po.multiPrefetchCWE).should('have.value', '');
    // Remove the first non-list value
    cy.get(po.multiPrefetchCWE).click();
    cy.get(po.allSearchRes).should('have.length', 2);
    cy.get(po.multiPrefetchCWEFirstSelected).click();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 2);
    // A non-list item should not be added into the list when removed
    cy.get(po.multiPrefetchCWE).click();
    cy.get(po.allSearchRes).should('have.length', 2);
    // Remove a list value
    cy.get(po.multiPrefetchCWEFirstSelected).click();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 1);
    cy.get(po.multiPrefetchCWE).click();
    cy.get(po.allSearchRes).should('have.length', 3);
  });

  it('should return display strings and codes in the same order', function() {
    po.openTestPage();
    // Test both list items and non-list items.
    cy.get(po.multiPrefetchCWE).click();
    po.searchResult(1).click();
    cy.get(po.multiPrefetchCWE).type('zzz');
    cy.get(po.nonField).click(); // shift focus from field
    cy.get(po.multiPrefetchCWE).click();
    po.searchResult(1).click();
    // Note:  The orders of the following arrays depends on their storage in a
    // hash, so they could change;  However, whatever the order, the order
    // of the code and display strings should correspond to each other.
    let t2c =  {"Spanish": "LA44-3","French": "LA45-0", "zzz": undefined};
    po.checkSelected(po.multiPrefetchCWEID, t2c);
    // Delete the first two items and confirm the codes are correct.
    cy.get(po.multiPrefetchCWEFirstSelected).click();
    delete t2c['Spanish'];
    po.checkSelected(po.multiPrefetchCWEID, t2c);
    cy.get(po.multiPrefetchCWEFirstSelected).click();
    delete t2c['zzz'];
    po.checkSelected(po.multiPrefetchCWEID, t2c);
  });

  it('should allow multiple items to be clicked without closing the list',
      function() {
    po.openTestPage();
    cy.get(po.multiSearchCWE).click().type('ar');
    po.waitForSearchResults();
    po.searchResult(1).click();
    // That element should be removed, and the new first element should now have
    // the "selected" class.
    po.searchResult(1).should('have.class', 'selected');
    po.searchResult(1).click(); // should now be the second result
    // Try keys.  The first item should still be selected.
    cy.get(po.multiSearchCWE).type('{enter}');
    // Confirm that the new first search result has the "selected" class
    po.searchResult(1).should('have.class', 'selected');
    cy.get(po.multiSearchCWE).type('{downArrow}');
    // Now we should be on the second item
    cy.get(po.multiSearchCWE).type('{enter}');

    cy.get(po.multiSearchCWESelected).should('have.length', 4);
    var expected = {"Coronary artery disease (CAD)": "2212",
      "Arm pain": "2958", "Eye pain": "2189",
        "Kidney failure (short-term renal failure)": "11458"};
    po.checkSelected(po.multiSearchCWEID, expected);
  });

  it('should load extra items when some are selected', function () {
    po.openTestPage();
    cy.get(po.multiSearchCWE).click().type('ar');
    po.waitForSearchResults();
    po.searchResult(1).click();
    po.searchResult(1).click();
    cy.get(po.multiSearchCWE).type('ar');
    po.shownItemCount().should('equal', 7);
  });

  it('should not allow the user to select a heading', function() {
    po.openTestPage();
    cy.get(po.multiHeadingCWE).click();
    // The first item is a heading; we should not be able to click on it
    po.searchResult(1).click();
    // Even though we clicked on the heading, the list should stay open
    cy.get(po.searchResSel).should('be.visible');
    // Try moving the first non-heading item and selecting that
    cy.get(po.multiHeadingCWE).type('{downArrow}{enter}');
    cy.get(po.multiHeadingCWESelected).should('have.length', 1);
    // In this list, after picking that one, there are two more items
    // in that section and then another heading.  Try moving to that heading and
    // selecting it.  Note that we cannot normally move to that item, unless
    // there is another bug, so we have to force the index there.
    cy.window().then(win=>{
      win.document.querySelector(po.multiHeadingCWE).autocomp.index = 3;
      cy.get(po.multiHeadingCWE).type('{enter}');
      // It should not have been added to the selction area.
      cy.get(po.multiHeadingCWESelected).should('have.length', 1);
      // Also try clicking on that item
      po.searchResult(4).click();
      cy.get(po.multiHeadingCWESelected).should('have.length', 1);
      // Select the item immediately after the heading.  It should be selectable.
      po.searchResult(5).click();
      cy.get(po.multiHeadingCWESelected).should('have.length', 2);
      // The first list item should have lost its "selected" (highlighted)  state.
      po.searchResult(2).should('not.have.class', 'selected');
      // Select the item immediately before the heading.
      po.searchResult(3).click();
      cy.get(po.multiHeadingCWESelected).should('have.length', 3);
      // The heading should not be in a "selected" (highlighted) state
      // That heading is now result 3.  (Two before it were removed).
      po.searchResult(3).should('not.have.class', 'selected');
      // The item after the heading should now have the "selected" state.
      po.searchResult(4).should('have.class', 'selected');
      // Confirm the selected items are as expected.
      const t2c = {"Chocolate": "FOOD-2","Cat": "OTHR-18","Egg": "FOOD-4"};
      po.checkSelected(po.multiHeadingCWEID, t2c);
    });
  });

  it('should not have a weird problem with picking items from list with headings',
     function() {
    // There is currently an odd problem in which if you pick the first three
    // list items from po.multiHeadingCWE, and then refocus the field, you can't
    // pick the new first item, and the list closes.  No exception occurs.
    // It is probably due to other current bugs with the list headings.
    po.openTestPage();
    cy.get(po.multiHeadingCWE).click();
    cy.get(po.searchResSel).should('be.visible');
    // Pick the first three items.  (Note:  the searchResult(1) is a heading.)
    po.waitForSearchResults();
    po.searchResult(2).click();
    po.searchResult(2).click();
    po.searchResult(2).click();
    cy.get(po.nonField).click(); // shift focus from field
    cy.get(po.multiHeadingCWE).click();
    po.searchResult(2).click();
    cy.get(po.multiHeadingCWESelected).should('have.length', 4);
    cy.get(po.searchResSel).should('be.visible');
  });

  it('should not allow left/right arrows to pick headings', function() {
    po.openTestPage();
    po.putElementAtBottomOfWindow(po.multiHeadingCWEID).then(()=>{
      cy.get(po.multiHeadingCWE).click({scrollBehavior: false});
      // Pick the first non-heading item in the multi-select heading CWE field
      po.searchResult(2).click({scrollBehavior: false});
      // Now the list still has a heading as the first item, but the list is
      // displaying as two columns, and next the first heading in the right column
      // is a list item that we can get to with the arrow keys.
      cy.get(po.multiHeadingCWE).type('{rightArrow}');
      // Confirm that this is a two column list by checking the selected item
      po.searchResult(10).should('have.class', 'selected');
      cy.get(po.multiHeadingCWE).type('{upArrow}');
      po.searchResult(9).should('have.class', 'selected');
      cy.get(po.multiHeadingCWE).type('{leftArrow}');
      po.searchResult(1).should('not.have.class', 'selected');
      po.searchResult(9).should('have.class', 'selected');
    });
  });

  it('should not prevent shift-tab from leaving the field even when an item is '+
     'selected', function() {
    po.openTestPage();
    cy.get(po.multiPrefetchCWE).click();
    // Select first item
    cy.get(po.multiPrefetchCWE).type('{downArrow}');
    // https://github.com/kuceb/cypress-plugin-tab - TBD (or
    // https://github.com/dmtrKovalenko/cypress-real-events)
    cy.get(po.multiPrefetchCWE).tab({shift: true});
    // Focus should be on the button for the selected item now
    cy.get(po.multiPrefetchCWE).should('not.have.focus');
  });

  it('should not select an item when the tab key is pressed if there is nothing' +
     ' in the field', function() {
    // Note that an item might be highlighted from a return-key
    // selection, but if the field is empty we will ignore that
    // because the user might just be trying to leave the field.
    po.openTestPage();
    cy.get(po.multiPrefetchCWE).type('{downArrow}{enter}');
    cy.get(po.multiPrefetchCWESelected).should('have.length', 1);
    cy.get(po.multiPrefetchCWE).tab();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 1);
  });

  it('should not show "see more" in a search list after a click on an item',
    function() {
    // This is because in this case, unless the user previously arrowed down
    // into the list, preFieldFillVal_ won't be set, and the link won't show any
    // results (but will still show the hit count field).  There is no reason
    // why this couldn't be fixed, so that we could show "see more" in this
    // case, but until we need it, I am leaving this test here and these
    // comments to make sure the link doesn't start appearing without a fix
    // being in place.
    po.openTestPage();
    cy.get(po.multiSearchCWE).click().type('ar');
    po.waitForSearchResults();
    po.searchResult(1).click();
    cy.get(po.expandLink).should('not.be.visible');
  });

  it('should expand list when "see more" is clicked after an item is selected',
    function() {
    // Per the comments in the test above, currently the only way to have a "see
    // more" link after selecting an item is to select it with the keyboard.
    po.openTestPage();
    //cy.get(po.multiSearchCWE).click().type('ar{downArrow}{enter}'); // too fast
    cy.get(po.multiSearchCWE).click().type('ar');
    cy.get(po.multiSearchCWE).type('{downArrow}');
    cy.get(po.multiSearchCWE).type('{enter}');
    cy.get(po.expandLink).click();
    cy.get(po.allSearchRes).should('have.length.greaterThan', 14);
  });

  it('should not show "see more" just because an item is already selected',
      function() {
    po.openTestPage();
    cy.get(po.multiPrefetchCNE).click();
    po.searchResult(1).click();
    cy.get(po.nonField).click();
    cy.get(po.multiPrefetchCNE).click();
    // There are only three results total, so it is should not be showing "see
    // more".
    cy.get(po.expandLink).should('not.be.visible');
  });

  it('should remove the selected items when destroyed', function () {
    po.openTestPage();
    cy.get(po.multiPrefetchCWE).click();
    po.searchResult(1).click();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 1);
    cy.get('#dest_multi_sel_cwe').click();
    cy.get(po.multiPrefetchCWESelected).should('have.length', 0);
  });
});

