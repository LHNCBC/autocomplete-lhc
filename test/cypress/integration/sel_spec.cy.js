import { default as po } from '../support/autocompPage.js';
import { TestHelpers } from '../support/testHelpers';
import deepEqual from 'deep-equal';
import {waitForPromiseVal} from '../support/waitForPromiseVal';

/**
 *  Returns a CSS selector for the given element ID.
 */
function idToSel(elemID) {
  // To be general purpose, we would also need to escape certain characters like
  // '/', but that is not necessary in these tests.
  return '#' + elemID;
}


/**
 *  ATR is a namespace for functions that process the selenese test file.
 */
const ATR = {
  /**
   *  Time in milliseconds to wait for something to be occur.
   */
  TIMEOUT: 5000,

  /**
   *  Returns a function that will run a line of a selenese test file.
   *  The function will call assertions as needed for the line.
   * @param line The line from the file.  This should contain an action,
   *  and not just be a blank line or comment.
   */
  selCommandFn: function(line) {
    var cmdParts = line.split('|');
    // line starts with |, so shift.
    cmdParts.shift();
    return function() {
      var cmd = cmdParts[0].trim();
      if (cmdParts.length > 1) {
        var arg1 = cmdParts[1].trim();
        if (cmdParts.length > 2) {
          var arg2 = cmdParts[2].trim();
        }
      }
      if (this.Commands[cmd])
        this.Commands[cmd](arg1, arg2);
      else {
        switch(cmd) {
          case 'open':
            po.visit(arg1);
            break;
          case 'mouseDown':
            this.Commands.click(arg1);
            break;
          case 'keyDown':
            this.Commands.typeKeys(arg1, arg2);
            break;
          case 'assertNotVisible':
            this.Commands.waitForNotVisible(arg1, arg2);
            break;
          default:
            throw 'invalid command';
            break;
        }
      }
    }.bind(ATR);
  },


  Commands: {
    /**
     *  Handles a "storeExpression" command.
     * @param expression the expression to be evaluated and stored.
     * @param varName the name to store the result in.
     */
    storeExpression: function(expression, varName) {
      var script = ATR.CommandUtil.prepareExpression(expression);
      // The result will be stored in ATR_testVars_ hash
      // under the key in arg2.
      if (varName === '')
        throw 'Missing variable name';
      script = 'if (typeof window.ATR_testVars_ === "undefined") window.ATR_testVars_={}; '+
               'window.ATR_testVars_["' + varName + '"] = ' + script;
      po.executeScript(script);
    },


    /**
     *  Handles an "assertExpression" command.
     * @param expression the expression to be evaluated and tested.
     * @param expectedVal the expected value for the expression to have.
     */
    assertExpression: function(expression, expectedVal) {
      expression = ATR.CommandUtil.prepareExpression(expression);
      expectedVal = ATR.CommandUtil.prepareExpValue(expectedVal);
      // Use remoteEval to get the value of the last statement in the
      // expression.
      ATR.CommandUtil.remoteEval(expression).then(actualVal=>{
        expect(actualVal).to.equal(expectedVal);
      });
    },


    /**
     *  Handles a "waitForExpression" command.
     * @param expression the expression to be evaluated and tested.  The
     *  expression should be in the form "javascript{expr}" where expr is such
     *  that one might compare with expectedVal like "expr == expectedVal".
     * @param expectedVal the expected value for the expression to have.
     */
    waitForExpression: function(expression, expectedVal) {
      expression = ATR.CommandUtil.prepareExpression(expression);
      expectedVal = ATR.CommandUtil.prepareExpValue(expectedVal);
/*
      // expectedVal might be a string, in which case we will need to quote it
      // below, and escape any quotes it contains.  The remoteEval function
      // does the same using double quotes, so we will use single quotes here.
      if (typeof expectedVal === 'string')
        expectedVal = '\'' + expectedVal.replace(/\'/g, "\\'") + '\'';
*/
      let promiseFn = function () {
        // Use remoteEval to get the value of the last statement in the
        // expression.
        return ATR.CommandUtil.remoteEval(expression);
      }
      //return cy.waitForPromiseVal(promiseFn, expectedVal); // does not work ... maybe because of cy.window()
      // return waitForPromiseVal(promiseFn, expectedVal); -- gets confused
      // and reports that cy.window() is called inside cy.click();
        // maybe because cy.window() is called inside a promise
      return cy.window().then(win=> {
        let script = expression.replace(/"/g, '\\"')
        script = 'return eval("'+script+'")';
        // change to return a promse
      console.log("%%% inside promiseFn, script="+script);
        let withWinFn = new Function('window', 'with(window) {'+script+'}');
        let promiseFn = function() {
          return withWinFn(win);
        }
        return waitForPromiseVal(promiseFn, expectedVal);
        //let rtn = expression(win);
        //return rtn === undefined ? null : rtn;
      });
    },


    /**
     *  Handles a "scrollIntoView" command.
     * @param elemID the ID of the element to be scrolled into view.
     */
    scrollIntoView: (elemID) => {
      // With thanks to the form builder tests for inspiration
      po.executeScript('$("'+idToSel(elemID)+'")[0].scrollIntoView();');
    },

    /**
     *  Handles a "click" command.
     * @param locator the ID of the element to receive the event, or a
     *  selenium-style "locator" string, which can start with "css=" followed by
     *  a CSS locator.
     */
    click: function(locator) {
      var cssPrefix = 'css=';
      if (locator.indexOf(cssPrefix) === 0)
        locator = locator.substring(cssPrefix.length);
      else
        locator = idToSel(locator);
      po.click(locator);
    },


    /**
     *  Handles a "fireEvent" command.  For now we only support focus, blur, and
     *  change.
     * @param fieldID the ID of the element to receive the event
     * @param eventType the type of event.
     */
    fireEvent: function(fieldID, eventType) {
      if (eventType === 'focus')
        po.click(idToSel(fieldID));
      else if (eventType === 'blur')
        po.blur(idToSel(fieldID));
    },


    /**
     *  Handles a "typeKeys" command (sends key events).
     * @param fieldID the ID of the element to receive the event
     * @param chars the characters to be typed
     */
    typeKeys: function(fieldID, chars) {
      const fieldSel = idToSel(fieldID);
      po.wait(150); // see basePage.js sendKeys for explanation
      let modifierKeys;
      if (this.controlKey_)
        modifierKeys = [TestHelpers.prototype.KeyModifiers.CONTROL];

      if (chars === '\\13')
        po.enterKey(fieldSel, modifierKeys);
      else if (chars === '\\9')
        po.blur(fieldSel); // should be tab, Cypress doesn't support it
      else if (chars === '\\40')
        po.downArrow(fieldSel, modifierKeys);
      else if (chars === '\\27')
        po.escapeKey(fieldSel, modifierKeys);
      else
        po.type(fieldSel, chars, modifierKeys);
    },


    /**
     *  Handles a "type" command (sets a field value).
     * @param fieldID the ID of the form field
     * @param val the new field value
     */
    type: function(fieldID, chars) {
      // var elem = element(by.id(fieldID)).getWebElement();
      // There is probably some way to set a value on the element, but the API
      // docs are down.
      ATR.CommandUtil.remoteEval('jQuery("#'+fieldID+'")[0].value = "'+chars+'"');
    },


    /**
     *  Handles a "typeText" command (sets the field value, and sends key events
     *  only for the last character).
     * @param fieldID the ID of the element to receive the event
     * @param chars the characters to be typed
     */
    typeText: function(fieldID, chars) {
      var charsLen = chars.length;
      var oneLess = charsLen - 1;
      var lastChar = chars.substring(oneLess, charsLen);
      this.type(fieldID, chars.substring(0, oneLess));
      this.typeKeys(fieldID, lastChar);
    },


    /**
     *  Handles a "waitForVisible" command.
     * @param fieldID the ID of the element that should be visible.
     */
    waitForVisible: function(fieldID) {
      po.assertElemVisible(idToSel(fieldID));
    },


    /**
     *  Handles a "waitForNotVisible" command.
     * @param fieldID the ID of the element that should be visible.
     */
    waitForNotVisible: function(fieldID) {
      po.assertElemNotVisible(idToSel(fieldID));
    },


    /**
     *  Handles an "assertValue" command.
     * @param fieldID the ID of the element that should not have the value.
     * @param val the value the field should have.
     */
    assertValue: function(fieldID, val) {
      po.assertFieldVal(idToSel(fieldID), val);
    },


     /**
     *  Handles a "waitForValue" command.
     * @param fieldID the ID of the element that should not have the value.
     * @param val the value the field should have.
     * @param not an optional parameter that flips the test so that it waits
     *  for the field to not have the value.  (This is used by waitForNotValue.)
     */
    waitForValue: function(fieldID, val, not) {
      // In Cypress, assert a value is also waiting for a value.
      const fieldSel = idToSel(fieldID);
      if (not)
        po.assertNotFieldVal(fieldSel, val);
      else
        po.assertFieldVal(fieldSel, val);
    },


    /**
     *  Handles a "waitForNotValue" command.
     * @param fieldID the ID of the element that should not have the value.
     * @param val the value the field shouldn't have.
     */
    waitForNotValue: function(fieldID, val) {
      this.waitForValue(fieldID, val, true);
    },


    /**
     *  Handles a "controlKeyDown" command.  The key is not actually sent
     *  until a typeKeys command is issued.
     */
    controlKeyDown: function() {
      this.controlKey_ = true;
    },


    /**
     *  Handles a "controlKeyUp" command.  The key is not actually sent
     *  until a typeKeys command is issued.
     */
    controlKeyUp: function() {
      this.controlKey_ = false;
    }

  },


  CommandUtil: {
    /**
     *  Prepares a Javascript expression for evaluation in the browser.
     * @return the revised expression, ready for eval.
     */
    prepareExpression: function(expression) {
      // expression is a script wrapped in javascript{...}
      var prefix = 'javascript{';
      if (expression.indexOf(prefix) !== 0) {
        throw 'Missing prefix: "' + prefix + '" in "'+expression+'"';
      }
      var script = expression.substring(prefix.length, expression.length - 1);
      // Replace storedVals with the actual hash location.
      return script.replace('storedVars', 'ATR_testVars_');
    },


    /**
     *  Prepares a value for a comparison in an expression test.
     * @param val the string version of a value
     * @return the value, converted to its proper type (e.g. true instead of
     *  'true').
     */
    prepareExpValue: function(val) {
      if (val === 'null')
        val = null;
      else if (val === 'true')
        val = true;
      else if (val === 'false')
        val = false;
      else
        val = this.makeIntIfInt(val);
      return val;
    },


    /**
     *  Converts the given string to an integer if it is one.
     * @param str the string to possibly convert
     * @return an integer version of str if string was an integer; otherwise
     *  str itself.
     */
    makeIntIfInt: function(str) {
      if (str.match(/^\d+$/))
        str = parseInt(str);
      return str;
    },


    /**
     *  Evaluates (using eval) a JavaScript expression from the selenese, and returns
     *  a promise resolving to its value.
     * @param expr the expression to evaluate in the browser.
     */
    remoteEval: function(expr) {
      // We need to eval the script so that we get the result of the last
      // expression.  This means we need to put the script in quotes to pass
      // it as an argument to eval, and that means we need to escape any
      // double quotes (though we don't actually have those in the current
      // cases.)
console.log("%%% remoteEval, expr="+expr);
      var script = expr.replace(/"/g, '\\"')
      return po.executeScript('return eval("'+script+'")');
    },


    /**
     *  Wait for an eval of the given expression to match the expected value.
     * @param expr the expression to evaluate in the browser using eval
     * @param expectedVal the expected result of the last part of expr.
     */
    waitForRemoteEval: function(expr, expectedVal) {
//po.executeScript(()=>console.log("%%% in waitForRemoteEval"));
//po.executeScript(()=>console.log(expr));
      var script = expr.replace(/"/g, '\\"')
      return po.waitForScript('return eval("'+script+'")', expectedVal);
    }
  }
};

// End of selenese processing code


describe('autocomp selenese (modified) test', function() {
  // Load "selenese" test file.
  // (It is not quite selenese.)

  // For Cypress, I had to put all of these "tests" into one "it".  The reason is
  // that I can't call readFile outside of a test, and once you are inside a
  // test you can't define new tests.
  it('should pass all the selenese test specifications', ()=> {
    po.readFile('test/cypress/integration/autocompleters.sel').then(selStr=>{
      var selLines = selStr.split("\n");
      for (let i=0, len=selLines.length; i<len; ++i) {
        let line = selLines[i].trim();
        if (line !== '' && line.indexOf('#') !== 0) {
          // Put the console.log below in a command so it runs synchronously with the
          // test tests.
          po.executeScript(()=>console.log("Running line "+(i+1)+
            " of autocompleters.sel:  "+line));
          ATR.selCommandFn(line)();
        }
      }
    });
  });
});

