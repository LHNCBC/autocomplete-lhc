# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [8.1.0] - 2016-04-07
### Added 
- Search autocompleters now have a "setURL" method for updating the URL which
  also takes care of clearing the cached autocompletion results (from the
  previous URL), as well as a clearCachedResults method for clearing the cache
  (called by setURL).

