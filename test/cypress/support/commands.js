// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

import deepEqual from 'deep-equal';
import {waitForPromiseVal} from '../support/waitForPromiseVal';

// Type in a search box and wait until search queries are finished.
// (Copied from lforms)
Cypress.Commands.add(
  'typeAndWait',
  { prevSubject: 'optional' },
  (subject, term) => {
    // Intercept the last query which would contain '={term}'.
    cy.intercept('GET', '*=' + term + '**').as('lastSearchQuery');
    cy.wrap(subject).type(term);
    cy.wait('@lastSearchQuery');
    // It's guaranteed that the queries have returned. But there was still a slight
    // chance that the next Cypress command catches some element before the application
    // finishes updating DOM.
    cy.wait(100);
  }
);

// Wait for the given function to return something truthy
Cypress.Commands.add(
  'waitForCondition',
  { prevSubject: 'optional' },
  (subject, conditionFn) => {
    const MAX_WAIT = 4000;
    const ITER_WAIT = 50;
    let totalWait = 0;
    return new Cypress.Promise((resolve, reject) => {
      function waitForCondition() {
        var result;
        try {
          result = conditionFn();
        }
        catch (e) {}
        if (!result) {
          if (totalWait < MAX_WAIT) {
            setTimeout(waitForCondition, ITER_WAIT);
            totalWait += ITER_WAIT;
          }
          else
            reject('Condition not satisfied after ' +MAX_WAIT+' ms');
        }
        else {
          // Per Cypress.Promise docs, if we resolve to undefined, the outside promise
          // resolves to the window.  So, return null in that case.
          resolve(result);
        }
      }
      waitForCondition();
    });
  }
);


// Wait for the given function to return a promise that resolves to the given
// expected value (compared with deep equal).
Cypress.Commands.add(
  'waitForPromiseVal',
  { prevSubject: 'optional' },
  (subject, promiseFn, expectedVal) => {
    return waitForPromiseVal(promiseFn, expectedVal);
  }
);
