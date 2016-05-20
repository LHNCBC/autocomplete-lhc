# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [8.1.1] - 2016-05-20
### Changed
- Updated package tests to use Node.js 4 and changed the protractor tests to run
  Chrome, to work around an issue with Selenium webdriver or Firefox (see
  https://github.com/angular/protractor/issues/3200).

## [8.1.0] - 2016-04-07
### Added 
- search autocompleters now have a "seturl" method for updating the url which
  also takes care of clearing the cached autocompletion results (from the
  previous url), as well as a clearcachedresults method for clearing the cache
  (called by seturl).

