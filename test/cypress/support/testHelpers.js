// Test helper functions.  The purpose is both the simplify the test code and to
// hide the particular test framework being used (which might very well change
// yet again).

// This class exports a function which assigns the helper function to the "this"
// object.


export function TestHelpers() {
  /**
   *  Asserts that the given field has the given value.
   * @param field the CSS selector for a field
   * @param value the expected value
   */
  this.assertFieldVal = function(field, value) {
    cy.get(field).should('have.value', value);
  };


  /**
   *  Asserts that the given promise resolves to the given value.
   * @param promise the promise to resolve
   * @param value the expected value
   */
  this.assertPromiseVal = function(promise, value) {
    promise.should('equal', value);
  };


  /**
   *  Sends a down arrow event to the given field
   * @param field the CSS selector for a field
   */
  this.downArrow = function(field) {
    cy.get(field).type('{downArrow}');
  }


  /**
   *  Sends a right arrow event to the given field
   * @param field the CSS selector for a field
   */
  this.rightArrow = function(field) {
    cy.get(field).type('{rightArrow}');
  }


  /**
   *  Asserts that the start of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selStart the expected selection start position
   */
  this.assertSelectionStart = function(field, selStart) {
    cy.get(field).then(el=>expect(el[0].selectionStart).to.equal(selStart));
  };


  /**
   *  Asserts that the end of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selEnd the expected selection end position
   */
  this.assertSelectionEnd = function(field, selEnd) {
    cy.get(field).then(el=>expect(el[0].selectionEnd).to.equal(selEnd));
  };


   /**
   *  Clicks in the given field.
   * @param field the CSS selector for a field
   */
  this.click = function(field) {
    cy.get(field).click();
  }


  /**
   *  Types the given text string in the given field.  Assumes the field is
   *  already focused, and does not clear the field before typing.
   * @param field the CSS selector for a field
   * @param text the text to be typed
   */
  this.type = function(field, text) {
    cy.get(field).type(text);
  }
}

