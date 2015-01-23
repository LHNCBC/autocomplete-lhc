'use strict';
// An AngularJS directive (optional; for use if you are using AngularJS)
//
// Example:
// <input name="myfield" phr-autocomplete="opts" ng-model="selectedVal">
//
// The opts object (which could be a function that returns an object) contains
// the information needed for specifying the behavior of the autocompleter (e.g.
// what should be in the list).  There are two types of autocompleters.  You can
// either have a "prefetched" list where all the items are given to the autocompleter
// at construction time, or a "search" list where the list items are discovered
// as the user types, via AJAX calls.  For both types, opts is a hash, but the
// keys on the hash differ.
//
// For "prefetched lists", opts can contain:
// 1) source - (required) This is the list item data.  It should be an array,
//    and each element in the array should have a "label" property which is the
//    display string the user sees.  The object containing that label property
//    is what will get stored on the model you have associated via ng-model
//    (selectedVal, in the example above).
// 2) maxSelect - (default: 1) the maximum number of items that can be selected
//    from the list.  If this is '*', an unlimited number can be selected.  When
//    more than one item can be selected, selected items are stored in an array
//    on the model (e.g., selectedVal becomes an array).
// 3) Any other parameters used by the Def.Autocomp.Prefetch constructor defined in
//    autoCompPrefetch.js.  (Look at the options parameter in the initialize method).
//
// For "search" lists, opts can contain:
// 1) url - (required) The URL to which requests for data should be sent.  For
//    details about expected parameters and response data, see the comments for the
//    Def.Autocomp.Search constructor (the initialize method in autoCompSearch.js.)
// 2) Any other parameters used by the Def.Autocomp.Search constructor defiend
//    in autoCompSearch.js.  (Look at the options parameter in the initialize
//    method.)
if (typeof angular !== 'undefined') {
  angular.module('autocompPhr', [])

    .directive('phrAutocomplete', ['$timeout', function (phrAutocompleteConfig, $timeout) {
      'use strict';
      return {
        require:'?ngModel',
        scope: {
          modelData: '=ngModel' // the ng-model attribute on the tag
        },
        link:function (scope, element, attrs, controller) {
          var getOptions = function () {
            return angular.extend({}, phrAutocompleteConfig, );
          };

          var initWidget = function () {
            // Because we created our own scope, we have to evaluate
            // attrs.phrAutocomplete in the parent scope.
            var phrAutoOpts = scope.$parent.$eval(attrs.phrAutocomplete);

            // If we have a controller (i.e. ngModelController) then wire it up
            if (controller) {
              var itemText = [];
              var itemTextToItem = {};
              var itemLabel;
              // "source" = list item data.
              for (var i=0, len=phrAutoOpts.source.length; i<len; ++i) {
                var item = phrAutoOpts.source[i];
                itemLabel = item.label;
                itemText[i] = itemLabel;
                itemTextToItem[itemLabel] = item;
              }

              var pElem = element[0];
              // The autocompleter uses the ID attribute of the element. If pElem
              // does not have an ID, give it one.
              if (pElem.id === '') {
                // In this case just make up an ID.
                if (!Def.Autocompleter.lastGeneratedID_)
                  Def.Autocompleter.lastGeneratedID_ = 0;
                pElem.id = 'ac' + ++Def.Autocompleter.lastGeneratedID_;
              }
              // If it also does not have a name, use the ID.  We use the name
              // to register a listener below.
              if (pElem.name === '')
                pElem.name = pElem.id;

              // Assign the placeholder value if there is one.
              if (phrAutoOpts.placeholder)
                attrs.$set('placeholder', phrAutoOpts.placeholder);

              var ac = new Def.Autocompleter.Prefetch(pElem.id, itemText, phrAutoOpts);
              Def.Autocompleter.Event.observeListSelections(pElem.name, function(eventData) {
                scope.$apply(function() {
                  if (!ac.multiSelect_) {
                    var finalVal = eventData.final_val;
                    var item = itemTextToItem[finalVal] ||
                      {value: finalVal, id: finalVal, label: finalVal};
                    scope.modelData = item;
                  }
                  else {
                    if (typeof scope.modelData !== 'object')
                      scope.modelData = [];
                    var selectedItems = scope.modelData;
                    if (eventData.removed) {
                      // The item was removed
                      var removedVal = eventData.final_val;
                      for (var i=0, len=selectedItems.length; i<len; ++i) {
                        if (removedVal === selectedItems[i].label) {
                          selectedItems.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else
                      selectedItems.push(itemTextToItem[eventData.final_val]);
                  }
                });
              });

              // Add a parser to convert from the field value to the object
              // containing value and (e.g.) code.
              controller.$parsers.push(function(value) {
                var rtn = value;
                if (typeof value === 'string') {
                  rtn = itemTextToItem[value];
                  if (rtn === undefined && phrAutoOpts.matchListValue === false)
                    rtn = null; // undefined means invalid, but in this case a non-match is okay
                }

                return rtn;
              });
              // Also add a formatter to get the display string if the model is
              // changed.
              controller.$formatters.push(function(value) {
                var rtn = value;
                if (!ac.multiSelect_) {
                  if (typeof value === 'object')
                    rtn = value.label;
                }
                else
                  rtn = '';
                return rtn;
              });

              // if we have a default value, go ahead and select it
              if (phrAutoOpts.defaultValue !== undefined) {
                scope.modelData = itemTextToItem[phrAutoOpts.defaultValue];
              }
            } // if controller
          };

          // Run initWiget once after the name attribute has been filled in (for
          // situations where the name is coming from the data model).
          scope.$watch({}, initWidget, true); // i.e. run once
        }
      };
    }]
  );
}
