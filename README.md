# autocomp-phr

This is a package of JavaScript autocompleters based on PrototypeJS and
Scriptaculous.  These were originally developed to meet the requirements of the
[NLM PHR project]
(http://lhncbc.nlm.nih.gov/project/nlm-personal-health-record-phr).
Changes from the Scriptaculous autocompleters:

1. Supports coded-value lists
1. Provides a way to get extra information about the record associated with a
list item.  (See recordDataRequester.js.)
1. Numbered list items (optional).
1. Two-column lists when there is not enough space on the page to show the list
in a single column.
1. Partial support for multi-select lists.  (Multi-select lists
do not currently support entry of text not on the list for the case of search
lists (autoCompSearch.js).  Multi-select prefetch lists (autoCompPrefetch.js)
are fully supported.)
1. Support for list suggestions in the search (AJAX) autocompleter, when the user does
not pick an item in the list.
1. Can require that an entry in the field match the list.
1. Event listeners for various things like "list selection".
1. "autofill" option -- fills in the field automatically if there is just one
list item
1. Heading items in lists
1. Default values (optional), which gets placed in the field when the field gets
focus (along with showing the list).
1. A "see more" link on the search autocompleter which provides an expanded list
of items.
1. Search buttons (optional) for search autocompleters to make them show an expanded
results list.  (Without a button, the user can click on the "see more" link.)
1. A results cache for the search autocompleter, so that repeats of AJAX calls
for the same list items are not necessary.


This software, autocomp-phr, was developed by the National Library of Medicine (NLM) Lister Hill National Center for Biomedical Communications (LHNCBC), part of the National Institutes of Health (NIH).

Please cite as: http://lhncbc.nlm.nih.gov/project/nlm-personal-health-record-phr

This software is distributed under a BSD-style open-source license.  See [LICENSE.md](LICENSE.md).

No warranty or indemnification for damages resulting from claims brought by third parties whose proprietary rights may be infringed by your usage of this software are provided by any of the owners.
