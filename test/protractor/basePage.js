// Page objects common to the autocompleter test pages.
function BasePage() {
  var searchResCSS = '#searchResults';
  this.searchResults = $(searchResCSS);
  this.firstSearchRes = $(searchResCSS + ' li:first-child');
  this.secondSearchRes = $(searchResCSS + ' li:nth-child(2)');
  this.tenthSearchRes = $(searchResCSS + ' li:nth-child(10)');
  this.allSearchRes = element.all(by.css(searchResCSS + ' li'));
  this.expandLink = $('#moreResults');
  this.firstSugLink = element.all(by.css('.ui-dialog a')).first(); // first suggestion
  this.suggestionDialog = element(by.css('.ui-dialog'));
};

module.exports = {BasePage: BasePage};
