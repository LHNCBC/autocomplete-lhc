// A "page object" for multiple documentation pages.
var config = require('../config');
var baseURL = 'http://localhost:'+config.port;

var DocumentationPages = function() {

  var searchResID = 'searchResults';
  var searchResCSS = '#'+searchResID;
  this.searchResults = $(searchResCSS);

  /**
   *  Opens the specified page.
   * @param relativeURL the URL after the hostname and port
   */
  function openPage(relativeURL) {
    browser.driver.get(baseURL + relativeURL);
  }

  this.openMainPage = function() {
    openPage('/index.html');
  };


  this.searchDemoFields = [$("#demo8"), $("#demo11")]

};

module.exports = new DocumentationPages();
