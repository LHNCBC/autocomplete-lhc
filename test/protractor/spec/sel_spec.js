/**
 *  ATR is a namespace for functions that process the selenese test file.
 */
ATR = {
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
            var config = require('../../config');
            browser.ignoreSynchronization = true; // run without AngularJS
            browser.get('http://localhost:'+config.port+arg1);
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
      browser.driver.executeScript(script);
    },


    /**
     *  Handles an "assertExpression" command.
     * @param expression the expression to be evaluated and tested.
     * @param expectedVal the expected value for the expression to have.
     */
    assertExpression: function(expression, expectedVal) {
      expression = ATR.CommandUtil.prepareExpression(expression);
      expectedVal = ATR.CommandUtil.prepareExpValue(expectedVal);
      expect(ATR.CommandUtil.remoteEval(expression)).toEqual(expectedVal);
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
      // expectedVal might be a string, in which case we will need to quote it
      // below, and escape any quotes it contains.  The removeEval function
      // does the same using double quotes, so we will use single quotes here.
      if (typeof expectedVal === 'string')
        expectedVal = '\'' + expectedVal.replace(/\'/g, "\\'") + '\'';
      browser.wait(function() {
        return ATR.CommandUtil.remoteEval(expression + '==' + expectedVal);
      }, ATR.TIMEOUT);
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
        locator = by.css(locator.substring(cssPrefix.length));
      else
        locator = by.id(locator)
      element(locator).click();
    },


    /**
     *  Handles a "fireEvent" command.  For now we only support focus, blur, and
     *  change.
     * @param fieldID the ID of the element to receive the event
     * @param eventType the type of event.
     */
    fireEvent: function(fieldID, eventType) {
      if (eventType === 'focus')
        element(by.id(fieldID)).click();
      else if (eventType === 'blur')
        element(by.css('body')).click();
    },


    /**
     *  Handles a "typeKeys" command (sends key events).
     * @param fieldID the ID of the element to receive the event
     * @param chars the characters to be typed
     */
    typeKeys: function(fieldID, chars) {
      var elem = element(by.id(fieldID)).getWebElement();
      if (chars === '\\13')
        chars = protractor.Key.ENTER;
      else if (chars === '\\9')
        chars = protractor.Key.TAB;
      else if (chars === '\\40')
        chars = protractor.Key.ARROW_DOWN;
      else if (chars === '\\27')
        chars = protractor.Key.ESCAPE;
      if (this.controlKey_)
        elem.sendKeys(protractor.Key.CONTROL, chars);
      else
        elem.sendKeys(chars);
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
      var elem = element(by.id(fieldID)).getWebElement();
      this.type(fieldID, chars.substring(0, oneLess));
      this.typeKeys(fieldID, lastChar);
    },


    /**
     *  Handles a "waitForVisible" command.
     * @param fieldID the ID of the element that should be visible.
     */
    waitForVisible: function(fieldID) {
      // This implementation does not really wait.  See waitForValue
      // for an example of that if this needs to change.
      var elem = element(by.id(fieldID)).getWebElement();
      expect(elem.isDisplayed()).toBeTruthy();
    },


    /**
     *  Handles a "waitForNotVisible" command.
     * @param fieldID the ID of the element that should be visible.
     */
    waitForNotVisible: function(fieldID) {
      var elem = element(by.id(fieldID)).getWebElement();
      expect(elem.isDisplayed()).toBeFalsy();
    },


    /**
     *  Handles an "assertValue" command.
     * @param fieldID the ID of the element that should not have the value.
     * @param val the value the field should have.
     */
    assertValue: function(fieldID, val) {
      var elem = element(by.id(fieldID)).getWebElement();
      expect(elem.getAttribute('value')).toBe(val);
    },


     /**
     *  Handles a "waitForValue" command.
     * @param fieldID the ID of the element that should not have the value.
     * @param val the value the field should have.
     * @param not an optional parameter that flips the test so that it waits
     *  for the field to not have the value.  (This is used by waitForNotValue.)
     */
    waitForValue: function(fieldID, val, not) {
      if (not === undefined)
        not = false;
      var elem = element(by.id(fieldID)).getWebElement();
      // browser.wait waits for the returned Promise to resolve and be true.
      browser.wait(function() {
        return elem.getAttribute('value').then(function(fieldVal) {
          var rtn;
          if (not)
            rtn = fieldVal != val;
          else
            rtn = fieldVal == val;
          return rtn;
        });
      }, ATR.TIMEOUT);
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
     *  Evaluates a JavaScript expression from the selenese, and returns
     *  its value.
     * @param expr the expression to evaluate in the browser.
     */
    remoteEval: function(expr) {
      // We need to eval the script so that we get the result of the last
      // expression.  This means we need to put the script in quotes to pass
      // it as an argument to eval, and that means we need to escape any
      // double quotes (though we don't actually have those in the current
      // cases.)
      var script = expr.replace(/"/g, '\\"')
      return browser.driver.executeScript('return eval("'+script+'")');
    }
  }
};

// End of selenese processing code


describe('autocomp selenese (modified) test', function() {
  // Load "selenese" test file.
  // (It is not quite selenese.)
  var fs = require('fs');
  var path = require('path');
  var sel_str = fs.readFileSync(path.join(__dirname, '../autocompleters.sel'),
                                {'encoding': 'utf-8'});
  var sel_lines = sel_str.split("\n");

  for (var i=0, len=sel_lines.length; i<len; ++i) {
    var line = sel_lines[i].trim();
    if (line !== '' && line.indexOf('#') !== 0) {
      it('should pass at line '+(i+1)+':  '+line, ATR.selCommandFn(line));
    }
  }
});

