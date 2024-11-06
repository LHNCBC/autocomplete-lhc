import { default as po } from '../support/autocompPage.js';

describe('Prefetch lists', function() {
  it('should prefer a case-sensitive match when attempting a selection', function() {
    // In the UCUM list, both "pA" and "Pa" appear as units, and the one the
    // user types should be selected when they leave the field.
    po.openTestPage();
    cy.get(po.csMatchPrefetch).type('pA');
    cy.get(po.nonField).click();
    cy.get(po.csMatchPrefetch).should('have.value', 'pA')
      .should('not.have.class', 'no_match');
    cy.get(po.csMatchPrefetch).clear();
    cy.get(po.csMatchPrefetch).type('Pa');
    cy.get(po.nonField).click();
    cy.get(po.csMatchPrefetch).should('have.value', 'Pa')
      .should('not.have.class', 'no_match');
  });

  it('should not match case-insensitive items if caseInsenstiveSelection is false', function () {
    po.openTestPage();
    // If caseInsenstiveSelection is set to false, typing 'pb' should not match
    // the item 'pB' in the list.
    cy.get(po.csMatchPrefetch_caseSenstiveSelection).type('pb');
    cy.get(po.nonField).click();
    cy.get(po.csMatchPrefetch_caseSenstiveSelection)
      .should('have.value', 'pb')
      .should('have.class', 'no_match');
    cy.get(po.csMatchPrefetch_caseSenstiveSelection).clear();
    cy.get(po.csMatchPrefetch_caseSenstiveSelection).type('pB');
    cy.get(po.nonField).click();
    cy.get(po.csMatchPrefetch_caseSenstiveSelection)
      .should('have.value', 'pB')
      .should('not.have.class', 'no_match');
  });

  it('should show the list when clicked even if focused', function() {
    po.openTestPage();
    cy.get(po.prefetchCWE).click();
    cy.get(po.searchResSel).should('be.visible');
    po.searchResult(1).click();
    cy.get(po.searchResSel).should('not.be.visible');
    // Now click in the field.  The list should appear
    cy.get(po.prefetchCWE).click();
    cy.get(po.searchResSel).should('be.visible');
  });

  it('should show the full list when clicked even after typing', function() {
    po.openTestPage();
    cy.get(po.prefetchCWE).click().type('Span');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 1);
    // Now click in the field.  The full list should show.
    cy.get(po.prefetchCWE).click();
    po.shownItemCount().should('equal', 4);
    // The list should not have a default selection, either.  The first item
    // should still be the first item.
    po.searchResult(1).should('contain.text', 'Spanish');
    // Try again but with a non-matching value
    cy.get(po.prefetchCWE).type('z');
    cy.get(po.prefetchCWE).click();
    po.shownItemCount().should('equal', 4);
    po.searchResult(1).should('contain.text', 'Spanish');
  });

  it('should allow selection by number', function() {
    po.openTestPage();
    cy.get(po.prefetchCWE).click().type('2');
    po.waitForSearchResults();
    po.shownItemCount().should('equal', 1);
    po.searchResult(1).should('contain.text', 'French');
  });

  it('should default when picked by number to the item whose number is a full'+
     ' match even when that item is not the shortest matching item', function() {

    cy.get(po.longOddCNE).should('have.value', ''); // precondition
    cy.get(po.longOddCNE).click().type('1');
    // The shortest matching item is "11: Nutrition".  Make sure it picks #1.
    cy.get(po.nonField).click();
    cy.get(po.longOddCNE).should('have.value', 'Allergies and such');
  });

  it('should default when picked by number to the item whose number is a full'+
     ' match even when that item is found after the desired number of matches',
     function() {

    cy.get(po.itemNumMatchField).should('have.value', ''); // precondition
    cy.get(po.nonField).click(); // close open list
    cy.get(po.itemNumMatchField).click().type('20');
    // All the items match "20".  Make sure it picks #20.
    cy.get(po.nonField).click(); // close open list
    cy.get(po.itemNumMatchField).should('have.value', 'item 20 containing 20');
  });

  it('should still show the list when there is a default', function() {
    // If the user tabs to a field with a default value, the list should be
    // open.
    po.openTestPage();
    // Start at the field prior to the field with the default.
    cy.get(po.prefetchCWE).click();
    // Check that the field with the default is blank
    cy.get(po.prefetchWithDefault).should('have.value', '');

    // Tab into it
    cy.get(po.prefetchCWE).tab();
    cy.get(po.prefetchWithDefault).should('have.value', 'French');
    // Check that the list is showing
    po.searchResult(1).should('be.visible');
  });

  it('should escape HTML markup characters in list items', function() {
    cy.get(po.prefetchCWE).click();
    po.searchResult(4).should('contain.text', 'escape<test>&');
    po.searchResult(4).click();
    cy.get(po.prefetchCWE).should('have.value', 'escape<test>&');
    cy.get(po.prefetchCWE).clear();
    cy.get(po.prefetchCWE).should('have.value', '');
    cy.get(po.prefetchCWE).type('e');
    po.waitForSearchResults();
    po.searchResult(1).should('contain.text', 'escape<test>&');
    po.searchResult(1).click();
    cy.get(po.prefetchCWE).should('have.value', 'escape<test>&');
  });

  it('should allow an element to be passed to the constructor', function() {
    var p = '#prefetch_for_el';
    cy.get(po.searchResSel).should('not.be.visible');
    cy.get(p).click();
    po.waitForSearchResults();
    cy.get(po.searchResSel).should('be.visible');
    po.searchResult(1).click();
    cy.get(p).should('have.value', 'Spanish');
  });

  it('should not count headings in the shown count', function() {
    cy.get(po.headings1ColCWE).click();
    po.checkListCountMessage('12 of 135 items total');
    // close list
    cy.get(po.headings1ColCWE).type('{esc}');
  });

  it('should report the count for matches', function() {
    cy.get(po.itemNumMatchField).click();
    po.checkListCountMessage('14 of 25 items total');
    cy.get(po.itemNumMatchField).type('20');
    // The number should in this case is 15, because after finding the first 14,
    // we make an exception and add the item whose number matches the input.
    po.shownItemCount().should('equal', 15);
    po.checkListCountMessage('15 of 25 items total');
  });

  it('should not look for matches in the item if the number matched', function() {
    // This is to avoid double-counting items whose text and number partially
    // match.
    cy.get(po.itemNumMatchField).clear().click().type('2');
    po.shownItemCount().should('equal', 14);
    po.checkListCountMessage('14 of 25 items total');
  });

  it('should not show list if preventListFromShowing is set to true', function() {
    po.openTestPage();
    cy.window().then((win) => {
      win.Def.PrototypeAPI.$(po.prefetchCWEID).autocomp.preventListFromShowing = true;
    });
    cy.get(po.prefetchCWE).click();
    // List should not be shown on focus if preventListFromShowing is set to true.
    cy.get(po.searchResSel).should('not.be.visible');
    cy.window().then((win) => {
      win.Def.PrototypeAPI.$(po.prefetchCWEID).autocomp.preventListFromShowing = false;
    });
    // Now click in the field.  The list should appear
    cy.get(po.prefetchCWE).click();
    cy.get(po.searchResSel).should('be.visible');
  });

  it('should display HTML when isListHTML is true', function() {
    po.openTestPage();
    cy.get('#prefetch_html')
      .focus();
    cy.get('#completionOptions li')
      .as('listOptions');
    cy.get('@listOptions')
      .should('be.visible')
      .should('have.length', 3);
    cy.get('@listOptions').eq(0).should('have.html', '<strong>bla</strong>');
    cy.get('@listOptions').eq(1).should('have.html', '<span title="I am strong.">bla</span>');
    cy.get('@listOptions').eq(2).should('have.html', '<i title="I am strong.">I am strong</i>');
    // Check the value in the field after the user selects something.
    cy.get('@listOptions').eq(2).click();
    cy.get('#prefetch_html').should('have.value', 'I am strong');
  });

  it('should filter and highlight correctly when isListHTML is true', function() {
    po.openTestPage();
    cy.get('#prefetch_html')
      .focus();
    cy.get('#completionOptions li')
      .should('have.length', 3);
    // Should only match and highlight the text outside an HTML tag.
    cy.get('#prefetch_html')
      .type('strong');
    cy.get('#completionOptions li')
      .should('have.length', 1);
    cy.get('#completionOptions li')
      .eq(0)
      .should('have.html', '<i title="I am strong.">I am <strong>strong</strong></i>');
    // The value in the field should be the original HTML option after the user selects the highlighted option.
    cy.get('#completionOptions li')
      .eq(0)
      .click();
    cy.get('#prefetch_html').should('have.value', 'I am strong');
  });

  it('should not return a match for "bla<" when isListHTML is true', function() {
    po.openTestPage();
    cy.get('#prefetch_html')
      .focus();
    cy.get('#completionOptions li')
      .should('have.length', 3);
    cy.get('#prefetch_html')
      .type('bla');
    cy.get('#completionOptions li')
      .should('have.length', 2);
    cy.get('#prefetch_html')
      .type('<');
    cy.get('#completionOptions li')
      .should('have.length', 0);
  });

  it('should display images in drop-down when isListHTML is true', function() {
    po.openTestPage();
    cy.get('#prefetch_html_image')
      .focus();
    cy.get('#completionOptions img')
      .should('have.length', 3);
    // Check the value in the field after the user selects something.
    cy.get('#completionOptions li').eq(2).click();
    cy.get('#prefetch_html_image').should('have.value', 'Sad');
  });

  it('should display text in drop-down when isListHTML is false', function() {
    po.openTestPage();
    cy.get('#prefetch_non_html_image')
      .focus();
    // Autocomplete should display the options as plain text, no <img> tags.
    cy.get('#completionOptions img')
      .should('have.length', 0);
    cy.get('#completionOptions li')
      .should('have.length', 4);
    cy.get('#completionOptions li')
      .eq(0)
      .should('have.text', 'Happy <img src="happy-face.png">');
    // Check the value in the field after the user selects something.
    cy.get('#completionOptions li').eq(0).click();
    cy.get('#prefetch_non_html_image').should('have.value', 'Happy <img src="happy-face.png">');
  });
});

