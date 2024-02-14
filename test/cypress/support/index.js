// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
  // One of the test pages includes a RecordDataRequester configured to send requests to example.com,
  // which results in a error that sometimes fails a test.
  if (err.message.includes('Unexpected end of JSON input')) {
    return false
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
})


require('@cypress/xpath');
require('cypress-plugin-tab');
