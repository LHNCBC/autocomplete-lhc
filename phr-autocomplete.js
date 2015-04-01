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
//    and each element in the array should have a "text" property which is the
//    display string the user sees.  The object containing that text property
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

          /**
           *  Sets up a prefetched list on the field.
           * @param pElem the element on which the autocompleter is to run
           * @param phrAutoOpts the options from the directive attribute
           */
          function prefetchList(pElem, phrAutoOpts) {
            var itemText = [];
            var itemTextToItem = {};
            var itemLabel;
            // "source" = list item data.
            for (var i=0, len=phrAutoOpts.source.length; i<len; ++i) {
              var item = phrAutoOpts.source[i];
              itemLabel = item.text;
              itemText[i] = itemLabel;
              itemTextToItem[itemLabel] = item;
            }

            var ac = new Def.Autocompleter.Prefetch(pElem.id, itemText, phrAutoOpts);
            Def.Autocompleter.Event.observeListSelections(pElem.name, function(eventData) {
              scope.$apply(function() {
                var item;
                if (!ac.multiSelect_) {
                  var finalVal = eventData.final_val;
                  item = itemTextToItem[finalVal] ||
                    {text: finalVal};
                  scope.modelData = item;
                }
                else {
                  if (!scope.modelData)
                    scope.modelData = [];
                  var selectedItems = scope.modelData;
                  if (eventData.removed) {
                    // The item was removed
                    var removedVal = eventData.final_val;
                    for (var i=0, len=selectedItems.length; i<len; ++i) {
                      if (removedVal === selectedItems[i].text) {
                        selectedItems.splice(i, 1);
                        break;
                      }
                    }
                  }
                  else {
                    item = itemTextToItem[eventData.final_val];
                    if (item === undefined)
                      item = {text: eventData.final_val} // non-list item
                    selectedItems.push(item);
                  }
                }
              });
            });

            // Add a parser to convert from the field value to the object
            // containing value and (e.g.) code.
            controller.$parsers.push(function(value) {
              // Just rely on the autocompleter list selection event to manage
              // model updates.  Here we will just return the model object, to
              // prevent any change to the model from the parsers.
              var rtn = scope.modelData;
              // Returning "undefined" means the value is invalid and will cause
              // the ng-invalid-parse class to get added.  Switch to null if we
              // allow non-matching field values.
              if (rtn === undefined && phrAutoOpts.matchListValue !== true)
                rtn = null;
              return rtn;
            });

            // if we have a default value, and if the model value is not already
            // set, go ahead and select the default
            if (phrAutoOpts.defaultValue !== undefined &&
                (scope.modelData === undefined || scope.modelData === null)) {
              scope.modelData = itemTextToItem[phrAutoOpts.defaultValue];
            }

            return ac;
          }


          /**
           *  Returns the model data structure for a selected item in a search
           *  list.
           * @param ac the autocompleter
           * @param itemText the display string of the selected item
           */
          function getItemModelData(ac, itemText) {
            return angular.extend({text: itemText, code: ac.getItemCode(itemText)},
              ac.getItemExtraData())
          }


          /**
           *  Sets up a search list on the field.
           * @param pElem the element on which the autocompleter is to run
           * @param phrAutoOpts the options from the directive attribute
           */
          function searchList(pElem, phrAutoOpts) {
            var ac = new Def.Autocompleter.Search(pElem.id, phrAutoOpts.url, phrAutoOpts);
            Def.Autocompleter.Event.observeListSelections(pElem.name, function(eventData) {
              scope.$apply(function() {
                var item;
                if (!ac.multiSelect_) {
                  item = eventData.final_val;
                  scope.modelData = getItemModelData(ac, item);
                }
                else {
                  if (typeof scope.modelData !== 'object')
                    scope.modelData = [];
                  var selectedItems = scope.modelData;
                  if (eventData.removed) {
                    // The item was removed
                    var removedVal = eventData.final_val;
                    for (var i=0, len=selectedItems.length; i<len; ++i) {
                      if (removedVal === selectedItems[i].text) {
                        selectedItems.splice(i, 1);
                        break;
                      }
                    }
                  }
                  else {
                    selectedItems.push(getItemModelData(ac, item));
                  }
                }
              });
            });

            // Add a parser to convert from the field value to the object
            // containing value and (e.g.) code.
            controller.$parsers.push(function(value) {
              var rtn = value;
              if (typeof value === 'string') {
                var code = ac.getItemCode(value);
                if (code === null && phrAutoOpts.matchListValue === true)
                  rtn = undefined; // the signal that value is invalid
                else
                  rtn = {text: value, code: code};
              }
              return rtn;
            });

            return ac;
          }


          var initWidget = function () {
            // Because we created our own scope, we have to evaluate
            // attrs.phrAutocomplete in the parent scope.
            var phrAutoOpts = scope.$parent.$eval(attrs.phrAutocomplete);

            if (controller) { // ngModelController, from the "require"
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

              var ac = phrAutoOpts.url ? searchList(pElem, phrAutoOpts) :
                prefetchList(pElem, phrAutoOpts);

              // Also add a formatter to get the display string if the model is
              // changed.
              controller.$formatters.push(function(value) {
                var rtn = value;
                if (!ac.multiSelect_) {
                  if (typeof value === 'object')
                    rtn = value.text;
                }
                else
                  rtn = '';
                return rtn;
              });
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
