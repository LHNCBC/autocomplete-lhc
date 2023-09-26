// Page objects common to the autocompleter test pages.
import { TestHelpers } from './testHelpers';

export function BasePage() {
  this.__proto__ = TestHelpers.prototype;

  var searchResID = 'searchResults';
  var searchResSel = '#'+searchResID;
  this.searchResSel = searchResSel;
  this.allSearchRes = searchResSel + ' li';
  this.expandLink = '#moreResults';
  this.completionOptionsCSS = '#completionOptions';
  this.completionOptionsScrollerCSS = '#completionOptionsScroller';

  /**
   *  Returns the list item in the search results list at the given position
   *  number (starting at 1).  The returned item might be a heading.
   * @param pos the item position number (starting at 1).
   */
  this.searchResult = function(pos) {
    return cy.get(searchResSel + ' li:nth-child('+pos+'), '+
      searchResSel + ' tr:nth-child('+pos+')');
  };


  /**
   *  Asserts that the search result at the given index is equal to the given
   *  value.
   * @param pos the position of the search result in the list (starting at 1)
   * @param expectedVal the expected value of the search result.   */
  this.assertSearchResVal = function(pos, expectedVal) {
    return this.assertPromiseVal(this.searchResult(pos).invoke('text'), expectedVal);
  };


  /**
   *  Returns the item in the search results list at the given position
   *  number (starting at 1), assuming the table format is being used.  (This is
   *  the same thing as "searchResult" but for the table format.)  The returned
   *  item might be a heading.
   * @param pos the item position number (starting at 1).
   */
  this.tableSearchResult = function(pos) {
    return cy.get(searchResSel + ' tr:nth-child('+pos+')');
  };


  /**
   *  Returns the results of getSelectedCodes and getSelectedItems for the
   *  autocompleter on the given field ID.  The two are returned as elements of
   *  an array.
   * @param fieldID the field for the autocompleter.
   */
  this.getSelected = function(fieldID) {
    // Use a string rather than a function object so fieldID can be passed to
    // the browser.
    return cy.window().then(win=> {
      // The replace below escapes / characters in fieldID
      return getSelectedWithWin(fieldID, win);
    });
  };


  /**
   *  The same as getSelected, but also takes a window object yielded from
   *  cy.window().  This is needed because Cypress does not let you call
   *  cy.window() inside a should().
   */
  function getSelectedWithWin(fieldID, win) {
    var ac = win.document.querySelector('#'+fieldID.replace(/\//g, '\\\\/')).autocomp;
    return [ac.getSelectedCodes(), ac.getSelectedItems()];
  }


  /**
   *  Checks the values of getSelectedCodes and getSelectedItems for the
   *  autocompleter on the given field ID.
   * @param fieldID the field for the autocompleter.
   * @param t2c a hash from display strings to code values.  (If there are no
   * code values, the hash still must be passed, but the code values should be undefined.)
   */
  this.checkSelected = function(fieldID, t2c) {
    t2c = {...t2c}; // the checks are done later, so clone
    return cy.window().then(win=> {
      const data = getSelectedWithWin(fieldID, win);
      var codes = data[0];
      var texts = data[1];
      var expectedLength = Object.keys(t2c).length;
      expect(codes).to.have.length(expectedLength);
      expect(texts).to.have.length(expectedLength);
      var actualT2C = {};
      for (var i=0; i<expectedLength; ++i) {
        actualT2C[texts[i]] = codes[i];
      }
      expect(actualT2C).to.deep.equal(t2c);
    });
  };



  /**
   * Wait for the autocomplete results to be shown
   */
  this.waitForSearchResults = function() {
    cy.get(searchResSel).should('be.visible');
  };

  /**
   * Wait for the autocomplete results to not be shown
   */
  this.waitForNoSearchResults = function() {
    cy.get(searchResSel).should('not.be.visible');
  };


  /**
   *  Returns resolving to the model data object for the given element.
   * @param elemCSSSel the CSS selector for the field
   * @param modelAttrName (optional) the attribute on the scope holding the model data. (Default: modelData)
   * @param isolatedScope (default: true) whether to look at the isolated scope
   *  of the element.  (false=scope()).
   */
  this.getModel = function(elemCSSSel, modelAttrName, isolatedScope) {
    if (!modelAttrName)
      modelAttrName = 'modelData';
    if (isolatedScope === undefined)
      isolatedScope = true;
    cy.get(elemCSSSel).should('exist'); // make sure it is present
    return cy.window().then(win=> {
      return new Cypress.Promise((resolve, reject) => {
        function getScope() {
          return win.eval('var testField = angular.element(document.querySelector("'+elemCSSSel+'")); testField.'+
            (isolatedScope ? 'isolateScope()' : 'scope()'));
        }
        function waitForScope() {
          var scope;
          if ((scope=getScope()) === undefined) {
            setTimeout(waitForScope, 50);
          }
          else {
            // Per Cypress.Promise docs, if we resolve to undefined, the outside promise
            // resolves to the window.  So, return null in that case.
            resolve(scope[modelAttrName] === undefined ? Promise.resolve(null) : scope[modelAttrName] );
          }
        }
        waitForScope();
      });
    });
  }


  /**
   *  Sets the field's value to the given text string, and picks the first
   *  autocompletion result.
   * @param field the CSS selector for an autocompleting field
   * @param text the text with which to autocomplete
   */
  this.autocompPickFirst = function(field, text) {
    this.autocompPickNth(field, text, 1);
  };


  /**
   *  Sets the field's value to the given text string, and picks the nth
   *  autocompletion result.
   * @param field the CSS selector for an autocompleting field
   * @param text the text with which to autocomplete.  This can be null or the
   *  empty string for prefetch lists.
   * @param n the number of the list item to pick (starting at 1).
   */
  this.autocompPickNth = function(field, text, n) {
    cy.get(field).clear().should('have.value', '').click();
    if (text)
      cy.get(field).type(text);
    this.waitForSearchResults();
    this.searchResult(n).should('be.visible');
    this.searchResult(n).click();
  };


  /**
   *  Returns the number of items shown in the list.
   */
  this.shownItemCount = function() {
    return cy.window().then(win=>{
      return win.Def.Autocompleter.listItemElements().length;
    });
  };


  /**
   *  Checks the message with the count and total count that appears below the
   *  list.
   * @param expectedMsg the expected text of the message
   */
  this.checkListCountMessage = function(expectedMsg) {
    cy.get('#searchCount').invoke('text').should('match', new RegExp('^'+expectedMsg));
  };


  /**
   *  Puts the given element's bottom edge at the bottom of the window.
   *  Assumption:  The window is taller than the element (typically a field).
   * @param elemID the ID of the element (field) to be moved to the bottom
   */
  this.putElementAtBottomOfWindow = (elemID) => {
    // Add a div to the top of the page whose height is just bit enough to
    // push the element below the bottom, and then scroll it into view.
    return cy.window().then(win=>{
      var elem = win.document.querySelector("#"+elemID);
      var elemTop = win.Def.jqueryLite.getElementOffset(elem).top;
      var winHeight = win.innerHeight;
      if (winHeight > elemTop) {
        var div = win.document.getElementById('scrollTestDiv');
        if (!div) {
          div = win.document.createElement('div');
          div.style.backgroundColor = 'green';
          div.id = 'scrollTestDiv';
          win.document.body.insertBefore(div, win.document.body.firstChild);
        }
        div.style.height = (winHeight-elemTop)+'px';
        div.style.width = '100px'; // to make it visible
      }
      elem.scrollIntoView(false);
    });
  };


  /**
   *  Returns the nth last log entry in the screen reader log.
   * @param n the number of the log entry, starting with 1 for the last item.
   */
  this.nthLastLogEntry = function(n) {
    return cy.get('#reader_log p:nth-last-child('+n+')').then(el=>el[0].innerText);
  };


  /**
   *  Waits for the page to stop scrolling the search results into view.
   * @param fieldID the field whose autocompleter is doing the scrolling.
   */
  this.waitForScrollToStop = function(fieldID) {
    if (!fieldID)
      throw 'Missing fieldID parameter in waitForScrollToStop';
    cy.get('#'+fieldID).then(el=>{
      var ac = el[0].autocomp;
      cy.waitForCondition(()=>!ac.lastScrollEffect_ || ac.lastScrollEffect_.state != 'running');
    });
  };


  /**
   *  Returns the number of times an AJAX call has been made.
   */
  this.getAjaxCallCount = function() {
    return cy.window().then(win=>win.Def.jqueryLite.ajax.ajaxCtr);
  };


  /**
   *  Returns the scroll position of the list's scrollbar.
   */
  this.listScrollPos = function() {
    return this.executeScript(
      'return window.document.querySelector("'+this.completionOptionsScrollerCSS+'").scrollTop;'
    );
  };


if (false) {
// These functions will be ported to Cypress as needed.

  /**
   *  Returns true if the selection list is currently visible, and false if not.
   */
  this.listIsVisible = function() {
    return browser.driver.executeScript(
      'return document.querySelector("#'+searchResID+'").style.visibility === "visible"'
    );
  };


  /**
   *  Erases the value in the given field.  Leaves the focus in the field
   *  afterward.
   */
  this.clearField = function(field) {
    field.click();
    field.sendKeys(protractor.Key.CONTROL, 'a'); // select all
    field.sendKeys(protractor.Key.BACK_SPACE); // clear the field
  };


  /**
   *  Outputs the browser's console messages.
   */
  this.printBrowserConsole = function() {
    browser.manage().logs().get('browser').then(function(browserLogs) {
      if (browserLogs.length > 0) {
        console.log("Messages from browser's console");
        browserLogs.forEach(function(log){
          console.log(log.message);
        });
        console.log("End of messages from browser's console");
      }
    });
  }


  /**
   *  Sends key events to a field.
   * @param field the field to which the characters should be send
   * @param text the text whose characters should be sent
   */
  this.sendKeys = function(field, text) {
    // For some reason, on RHEL 7 in Chrome, if you focus a field and then send
    // key events withouht sleeping a bit between the two, the autocompleter's
    // getUpdates function does not get called before the field value is updated
    // with the last character.  The problem can also be solved by increasing
    // the autocompleter options.frequency setting, but it only happens when
    // testing, so I don't want to make that slower.
    browser.sleep(100);
    // Sending empty input, i.e. just focusing on the empty field.
    if (!text) {
      field.sendKeys('');
      return;
    }
    // Some key events are lost?  Send them one at a time.
    for (var i=0, len=text.length; i<len; ++i) {
      field.sendKeys(text[i]);
      browser.sleep(10);
    }
  }


  /**
   *  Sets the window height so that it is just large enough to show the given
   *  element.
   * @param elemID the ID of the element
   * @return a promise for when the size has been set
   */
  this.setWindowHeightForElement = (elemID) => {
    // As of 2018/5/8 (or earlier) the setSize function no longer shrinks the
    // window height in Chrome, though it does still affect the width.
    // An issue was filed at:  https://github.com/angular/protractor/issues/4798
    // Rather than wait for a fix, we are switching to using a new function,
    // "putFieldAtBottomOfWindow".
    return browser.driver.executeScript('return Def.jqueryLite.getElementOffset(document.querySelector("#'+elemID+'")).top'
      ).then(function(top) {
        // The returned offset top value is not completely right, it seems,
        // so I am adding adding extra height pixels in the setSize call below.
        return browser.manage().window().setSize(1100, top+110);
      });
  };


 }
};

module.exports = {BasePage: BasePage};
