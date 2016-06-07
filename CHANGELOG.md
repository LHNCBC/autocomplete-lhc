# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [9.0.0] - 2016-06-07
### Fixed
- Removed the field's background image for print media.
### Changed
- Removed "!important" from the CSS.  It is this change that triggered the major
  version bump, since it is impossible to be sure whether this will mess up
  the CSS for someone using this package.

## [8.1.1] - 2016-05-20
### Changed
- Updated package tests to use Node.js 4 and changed the protractor tests to run
  Chrome, to work around an issue with Selenium webdriver or Firefox (see
  https://github.com/angular/protractor/issues/3200).

## [8.1.0] - 2016-04-07
### Added 
- Search autocompleters now have a "setURL" method for updating the URL which
  also takes care of clearing the cached autocompletion results (from the
  previous URL), as well as a clearCachedResults method for clearing the cache
  (called by setURL).

