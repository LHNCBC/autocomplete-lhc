# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [10.0.2] - 2016-12-05
### Fixed
- The AngularJS directive for the case where prefetched lists have padded
  values.
- Lists created by the AngularJS directive were leaving list selection observers
  behind when they were destroyed and recreated.

## [10.0.1] - 2016-12-01
### Changed
- The directive now permits the search autocompleter to be constructed with an
  empty URL.  This is useful for cases in which the URL is not yet known.

## [10.0.0] - 2016-11-16
### Changed
- The "autocomp" parameter in URLs for search lists has been replaced with the
  "maxList" parameter, so that without either parameter specified the default
  return size is expected to be small.  When maxList is present, the URL is
  expected to return are large number of items (e.g., 500) if possible.  In
  other words, the expected effect of maxList is opposite that of autocomp.
- The default for the nonMatchSuggestions option is now false.

## [9.2.3] - 2016-11-14
### Fixed
- Added a needed polyfill for IE (Object.assign).  Versions 9.2.0-9.2.2 were
  broken for IE.

## [9.2.2] - 2016-10-28
### Fixed
- If the list is too wide for the page, the left edge of the list will be at the
  left edge of the page, rather than a negative position.

## [9.2.1] - 2016-10-27
### Fixed
- A problem was introduced in 9.2.0 that allowed the input field to be scrolled
  under a top navigation bar.

## [9.2.0] - 2016-10-26
### Added
- The ability for the left edge of the list to be positioned left of the field
  if needed to avoid the list extending past the right edge of the window.

## [9.1.2] - 2016-10-14
### Fixed
- A positioning problem which occured if the positioning process changed whether
  the scrollbar was showing.

## [9.1.1] - 2016-08-03
### Fixed
- Missing padding around column headers

## [9.1.0] - 2016-08-02
### Added
- The ability to specify column headers for search lists

### Changed
- The color scheme, as a part of selecting the color for the heading.

## [9.0.1] - 2016-06-08
### Fixed
- The field separator character is now removed from search strings before
  querying.  This solves a problem in which a selected list item could look
  invalid if a query was sent for the combined field value of a multi-field list.
- The AngularJS directive now clears a search field's result cache if its URL
  changes. 

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

