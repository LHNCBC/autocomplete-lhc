// Based on hasClass in: http://stackoverflow.com/a/23046060/360782
var hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

module.exports = {
  hasClass: hasClass
};
