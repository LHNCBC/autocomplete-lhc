/**
 *  ATR is a namespace for functions that process the selenese test file.
 */
ATR = {

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
      switch(cmd) {
        case 'open':
          browser.get(arg1);
          break;
        default:
          if (this.Commands[cmd])
            this.Commands[cmd](arg1, arg2);
          else
            throw 'invalid command';
          break;
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
      script = 'if (typeof ATR_testVars_ === "undefined") ATR_testVars_={}; '+
               'ATR_testVars_["' + varName + '"] = ' + script;
      browser.driver.executeScript(script);
    },


    /**
     *  Handles an "assertExpression" command.
     * @param expression the expression to be evaluated and tested.
     * @param expectedVal the expected value for the expression to have.
     */
    assertExpression: function(expression, expectedVal) {
      var script = ATR.CommandUtil.prepareExpression(expression);
      // If expectedVal is an integer, convert it.
      if (expectedVal.match(/^\d+$/))
        expectedVal = parseInt(expectedVal);
      // We need to eval the script so that we get the result of the last
      // expression.  This means we need to put the script in quotes to pass
      // it as an argument to eval, and that means we need to escape any
      // double quotes (though we don't actually have those in the current
      // cases.)
      script = script.replace('"', '\\"')
      expect(browser.driver.executeScript('return eval("'+script+'")')).
             toEqual(expectedVal);
    },


    /**
     *  Handles a "fireEvent" command.  For now we only support focus, blur, and
     *  change.
     * @param fieldID the ID of the element to receive the event
     * @param eventType the type of event.
     */
    fireEvent: function(fieldID, eventType) {
      var elem = element(by.id(fieldID)).getWebElement();
      browser.driver.actions().mouseDown(elem).perform();
    },


    /**
     *  Handles a "typeKeys" command (sends key events).
     * @param fieldID the ID of the element to receive the event
     * @param chars the characters to be typed
     */
    typeKeys: function(fieldID, chars) {
      var elem = element(by.id(fieldID)).getWebElement();
      elem.sendKeys(chars);
    },


    /**
     *  Handles a "waitForVisible" command.
     * @param fieldID the ID of the element that should be visible.
     */
    waitForVisible: function(fieldID) {
      var elem = element(by.id(fieldID)).getWebElement();
      expect(elem.isDisplayed()).toBeTruthy();
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
        throw 'Missing prefix: ' + prefix;
      }
      var script = expression.substring(prefix.length, expression.length - 1);
      // Replace storedVals with the actual hash location.
      return script.replace('storedVars', 'ATR_testVars_');
    }
  }
};

// End of selenese processing code


describe('autocomp selenese (modified) test', function() {
  // Load "selenese" test file.
  // (It is not quite selenese.)
  var fs = require('fs');
  var sel_str = fs.readFileSync('autocompleters.sel', {'encoding': 'utf-8'});
  var sel_lines = sel_str.split("\n");

  for (var i=0, len=sel_lines.length; i<len; ++i) {
    var line = sel_lines[i].trim();
    if (line !== '' && line.indexOf('#') !== 0) {
      it('should pass at line '+(i+1)+':  '+line, ATR.selCommandFn(line));
    }
  }

  // Make the tests stop after the first failure.
  // From:  https://github.com/angular/protractor/issues/499
  afterEach(function() {
    var passed = jasmine.getEnv().currentSpec.results().passed();
    if(!passed) {
        jasmine.getEnv().specFilter = function(spec) {
            return false;
        };
    }
  });
});

