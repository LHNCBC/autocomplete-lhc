import { TestPages } from './testPages.js';
import { default as deepEqual } from 'deep-equal';
var BasePage = require('./basePage').BasePage;

var DirectivePage = function() {
  BasePage.call(this);

  // Directive-page properties
  this.inputElem = '#ac1';
  this.codeField = '#code';
  this.prePopElem = '#list1b'; // has pre-populated model
  this.searchListID = 'list3';
  this.searchList = '#'+this.searchListID;
  this.searchListModel = 'listFieldVal3'; // model name for searchList
  this.searchWithoutSug = '#list4b';  // search list without suggestions
  this.searchWithoutSugModel = 'listFieldVal4b';  // search list without suggestions
  this.prefetchCWEBlank = '#list5';
  this.prefetchCNEBlank = '#list6';
  this.prefetchWithCodeDefault = '#list7';
  this.optChangeTest = '#list8';
  this.btnOptChangeTest = '#btnList8';
  this.noURLTest = '#list9';

  // Multi-select CNE prefetch list
  var multiFieldID = 'multiPrefetchCNE';
  this.multiField = '#'+multiFieldID;
  this.multiPrefetchCNE = this.multiField; // alias
  var multiPrefetchCNESectionCSS = '#multiPrefetchCNESection'
  this.multiFieldSelectedItems = multiPrefetchCNESectionCSS + ' .autocomp_selected li';
  this.multiFieldFirstSelected = multiPrefetchCNESectionCSS+' li:first-child button';
  this.multiFieldFirstSelectedSpan = this.multiFieldFirstSelected + ' span';

  // CNE list
  // For now the CNE list test is using the multi-select CNE list field
  this.cneListID = multiFieldID;
  this.cneListSel = this.multiField;

  // Multi-select CWE prefetch list
  this.multiPrefetchCWE = '#multiPrefetchCWE';
  var multiPrefetchCWESectionCSS = '#multiPrefetchCWESection'
  this.multiPrefetchCWEFirstSelected =
    multiPrefetchCWESectionCSS + ' li:first-child button';
  this.multiPrefetchCWESelected =
    multiPrefetchCWESectionCSS + ' button';

  // Multi-select CWE search list
  this.multiSearchCWE = '#multiSearchCWE';
  var multiSearchCWESectionCSS = '#multiSearchCWESection'
  this.multiSearchCWEFirstSelected =
    multiSearchCWESectionCSS + ' li:first-child button';
  this.multiSearchCWESelected =
    multiSearchCWESectionCSS + ' button';
  this.multiSearchCWEModel = 'multiSearchCWEVal';


  // Multi-select CWE search list with pre-populated model value
  this.multiSearchCWEPrePopID = 'multiSearchCWEPrePop';

  this.openDirectiveTestPage = function() {
    cy.visit(TestPages.directiveTest);
  }


  /**
   *  Asserts that an element has the expected model data.
   * @param fieldCSS the CSS selector for the element
   * @param modelAttr the attribute on the element's scope() for its data model
   * @param expectedModel the data that is expected to be in the data model.
   */
  this.checkModel = function (fieldCSS, modelAttr, expectedModel) {
    cy.get(fieldCSS).should('exist'); // make sure it is present
    return cy.window().should(win=> {
      return new Cypress.Promise((resolve, reject) => {
        const waitPeriod = 50, maxWaits = 80;
        let numWaits = 0;
        function getScope() {
          return win.eval('var testField = angular.element(document.querySelector("'+fieldCSS+'")); testField.scope()');
        }
        function waitForScope() {
          ++numWaits;
          var scope;
          if ((scope=getScope()) === undefined) {
            if (numWaits >= maxWaits) // fail the test
              expect(scope).not.to.be.undefined;
            else
              setTimeout(waitForScope, waitPeriod);
          }
          else {
            const actualModel = scope[modelAttr];
            if (actualModel === undefined && expectedModel === null) {
              // Ignore this different, and let the check pass
              resolve(null);
            }
            else if (!deepEqual(actualModel, expectedModel)) {
              // Wait for the model to update
              if (numWaits >= maxWaits) {// fail the test
                console.log(scope);
                console.log(modelAttr);
                expect(actualModel).to.deep.equal(expectedModel);
                resolve(actualModel);
              }
              else
                setTimeout(waitForScope, waitPeriod);
            }
            else {
              expect(actualModel).to.deep.equal(expectedModel);
              resolve(actualModel);
            }
          }
        }
        waitForScope();
      });
    });
  }
}


export default new DirectivePage();
