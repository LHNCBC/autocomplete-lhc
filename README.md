# autocomplete-lhc

This is a package of JavaScript-based input field autocompleters.
These were developed to meet the
requirements of the
[NLM PHR](https://phr-demo.nlm.nih.gov) and
[LHC-Forms](https://lhncbc.nlm.nih.gov/project/lhc-forms) projects.  The package
includes an AngularJS directive, but can be used without Angular.

For features and demos, please visit the [project
page](http://lhncbc.github.io/autocomplete-lhc/).

## How to run the tests
If you wish to modify this package, you will likely want to run the package's
tests.  The steps are:
1) Make sure node and npm are in your PATH.  If you are on a Linux operating system, you should be able to ```source bashrc.autocomp```.
2) npm ci
3) Add node_modules/.bin to your PATH.  Again, if you are on a Linux operating system, you should be able to re-run ```source bashrc.autocomp```.
3) npm run build
4) npm run update-webdriver # The need for this will go away when we remove our Protractor dependency.
5) npm run test


## License and Disclaimer
This software was developed by the National Library of Medicine (NLM) Lister Hill National Center for Biomedical Communications (LHNCBC), part of the National Institutes of Health (NIH).

Please cite as:

Lister Hill National Center for Biomedical Communications  
National Library of Medicine  
Bethesda, MD  

This software is distributed under a BSD-style open-source license.  See [LICENSE.md](LICENSE.md).

No warranty or indemnification for damages resulting from claims brought by third parties whose proprietary rights may be infringed by your usage of this software are provided by any of the owners.
