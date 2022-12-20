// Page objects for the pages that test minified versions of files
import { BasePage } from './basePage';

const MinifiedPage = function() {
  BasePage.call(this);

  this.prefetchList = '#field1';
  this.searchList = '#field2';

  this.openMinTest = function() {
    cy.visit('test/pages/minificationTest.html');
  };

  this.openMinTestAngular = function() {
    cy.visit('test/pages/minificationTestAngular.html');
  };
};

export default new MinifiedPage();
