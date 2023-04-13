// Test helper functions.  The purpose is both the simplify the test code and to
// hide the particular test framework being used (which might very well change
// yet again).

import {deepEqual} from 'deep-equal';

/**
 *  Creates a Cypress modifier string for the given modifier keys.
 * @param modifiers an array of modifier key values from
 * TestHelpers.prototype.KeyModifiers.
 */
function modifierString(modifiers) {
  let rtn = '';
  if (modifiers) {
    modifiers.forEach((modifier)=>{
      switch(modifier) {
        case TestHelpers.prototype.KeyModifiers.CONTROL:
          rtn += '{control}';
          break;
        case TestHelpers.prototype.KeyModifiers.SHIFT:
          rtn += '{shift}';
          break;
      }
    });
  }
  return rtn;
}

export class TestHelpers {
  /**
   *  Asserts that the given field has the given value.
   * @param field the CSS selector for a field
   * @param value the expected value
   */
  assertFieldVal(field, value) {
    cy.get(field).should('have.value', value);
  }


  /**
   *  Asserts that the given field does not have the given value.
   * @param field the CSS selector for a field
   * @param value the expected value
   */
  assertNotFieldVal(field, value) {
    cy.get(field).should('not.have.value', value);
  }

  /**
   *  Asserts that the given promise resolves to the given value.
   * @param promise the promise to resolve
   * @param value the expected value
   */
  assertPromiseVal(promise, value) {
    promise.should('deep.equal', value);
  }


  /**
   *  Asserts that the given promise resolves to a value greater than the given value.
   * @param promise the promise to resolve
   * @param value the value that should be less than the promise value
   */
  assertPromiseValGT(promise, value) {
    promise.should('be.greaterThan', value);
  }


  /**
   *  Asserts that the field has an attribute with the given value.
   * @param field the CSS selector for a field
   * @param attr the attribute name
   * @param value the expected attribute value.  If this is
   *  null, the assertion is changed to assert the absence of the attribute.
   */
  assertAttrVal(field, attr, value) {
    if (value === null)
      cy.get(field).should('not.have.attr', attr);
    else
      cy.get(field).should('have.attr', attr, value);
  }


  /**
   *  Asserts that the start of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selStart the expected selection start position
   */
  assertSelectionStart(field, selStart) {
    cy.get(field).then(el=>expect(el[0].selectionStart).to.equal(selStart));
  }


  /**
   *  Asserts that the end of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selEnd the expected selection end position
   */
  assertSelectionEnd(field, selEnd) {
    cy.get(field).then(el=>expect(el[0].selectionEnd).to.equal(selEnd));
  }


  /**
   *  Asserts that the given element has the given CSS class.
   * @param field the CSS selector for a field, or the test framework's concept
   *  of an element.
   * @param cls the CSS class to assert
   */
  assertCSSClass(field, cls) {
    (typeof field == 'string' ? cy.get(field) : field).should('have.class', cls);
  }

  /**
   *  Asserts that the given element does not have the given CSS class.
   * @param field the CSS selector for a field, or the test framework's concept
   *  of an element.
   * @param cls the CSS class to assert is not there
   */
  assertNotCSSClass(field, cls) {
    (typeof field == 'string' ? cy.get(field) : field).should('not.have.class', cls);
  }


  /**
   *  Asserts that the given element is visible.
   * @param elemSel the CSS selector for the element.
   */
  assertElemVisible(elemSel) {
    cy.get(elemSel).should('be.visible');
  }


  /**
   *  Asserts that the given element is not visible.
   * @param elemSel the CSS selector for the element.
   */
  assertElemNotVisible(elemSel) {
    cy.get(elemSel).should('not.be.visible');
  }


  /**
   *  Clicks in the given field.  By default, the viewport will be scrolled to move the
   *  element to the top of the window.
   * @param field the CSS selector for an element, or a element that can be clicked
   * @param options {scrollBehavior: false} will disable scrolling.
   */
  click(field, options) {
    (typeof field == 'string' ? cy.get(field) : field).click(options);
  }


  /**
   *  Causes the given field to lose its focus.  The field should have focus
   *  before this is called.
   * @param elemSel the CSS selector for an element
   */
  blur(elemSel) {
    cy.get(elemSel).blur();
  }


  /**
   *  Executes the given code in the context of the application.
   * @param code either a string of JavaScript (the body of a function) or a function.  If it is
   *  function, it is expected to take the window object as its first parameter.
   * @return a promise which resolves to the return value of the code
   */
  executeScript(code) {
    // Make the "window" object available.
    return cy.window().then(win=>{
      if (typeof code === 'string') {
        // Use "with" (deprecrated, but currently with wide support) to make the
        // window object the default object.
        code = new Function('window', 'with(window) {'+code+'}');
      }
      let rtn = code(win);
      // If we return undefined, then it returns "window", so return null
      // instead (which is hopefully less confusing).
      return rtn === undefined ? null : rtn;
    });
  }


  /**
   *  Repeatedly executes the the given code in the context of the application,
   *  until the script evaluates (via eval) to the given expected value.
   * @param code A string of JavaScript one which eval will be run.
   */
  waitForEval(code, expectedValue) {
    var script = code.replace(/"/g, '\\"')
    return cy.window().then(win=> {
      let withWinFn = new Function('window', 'with(window) {return eval("'+script+'")}');
      let promiseFn = function() {
        return withWinFn(win);
      }
      return cy.waitForPromiseVal(promiseFn, expectedValue);
    });
  }


  /**
   *  Clears the given field.
   * @param field the CSS selector for an element
   * @return (debugging only) the Cypress promise
   */
  clear(field) {
    //cy.get(field).clear();
    return cy.get(field).clear();
  }


  /**
   *  Types the given text string in the given field.  Assumes the field is
   *  already focused, and does not clear the field before typing.
   * @param field the CSS selector for a field
   * @param text the text to be typed
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   * in the array should be members of the KeyModifiers object which is part of this
   * object.
   */
  type(field, text, modifiers) {
    cy.get(field).type(modifierString(modifiers) + text);
  }


  /**
   *  Sends a down arrow event to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   * in the array should be members of the KeyModifiers object which is part of this
   * object.
   */
  downArrow(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{downArrow}');
  }


  /**
   *  Sends an up arrow event to the given field
   * @param field the CSS selector for a field
   */
  upArrow(field) {
    cy.get(field).type('{upArrow}');
  }


  /**
   *  Sends a right arrow event to the given field
   * @param field the CSS selector for a field
   */
  rightArrow(field) {
    cy.get(field).type('{rightArrow}');
  }


  /**
   *  Sends a left arrow event to the given field
   * @param field the CSS selector for a field
   */
  leftArrow(field) {
    cy.get(field).type('{leftArrow}');
  }


  /**
   *  Sends a backspace key to the given field
   * @param field the CSS selector for a field
   */
  backspace(field) {
    cy.get(field).type('{backspace}');
  }

  /**
   *  Sends a page down key to the given field
   * @param field the CSS selector for a field
   */
  pageDown(field) {
    cy.get(field).type('{pageDown}');
  }

  /**
   *  Sends a page up key to the given field
   * @param field the CSS selector for a field
   */
  pageUp(field) {
    cy.get(field).type('{pageUp}');
  }

  /**
   *  Sends an escape key to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   *  in the array should be members of the KeyModifiers object which is part of this
   *  object.
   */
  escapeKey(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{esc}');
  }

  /**
   *  Sends a shift key to the given field
   * @param field the CSS selector for a field
   */
  shiftKey(field) {
    cy.get(field).type('{shift}');
  }

  /**
   *  Sends a control keypress to the given field
   * @param field the CSS selector for a field
   */
  controlKey(field) {
    cy.get(field).type('{control}');
  }


  /**
   *  Sends an enter keypress to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   *  in the array should be members of the KeyModifiers object which is part of this
   *  object.
   */
  enterKey(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{enter}');
  }


  /**
   *  Reads a file and retuns a promise with its contents.
   * @param pathName the pathname of the file relative to the project root.
   * @param encoding the encoding of the file (default: utf-8)
   */
  readFile(pathName, encoding) {
    if (!encoding)
      encoding = 'utf-8';
    return cy.readFile(pathName, {encoding});
  }

  /**
   *  Opens the given web page.
   * @param url the URL to open
   */
  visit(url) {
    cy.visit(url);
  }


  /**
   *  Waits the given number of milliseconds before proceding.
   * @param waitTime the number milliseconds to wait
   */
  wait(waitTime) {
    cy.wait(waitTime);
  }
}

/**
 *  Constants to indicate key modifiers in use.
 *  This is defined on the prototype so subclasses can access it.
 */
TestHelpers.prototype.KeyModifiers = {
  CONTROL: 1,
  SHIFT: 2
};


