'use strict';
// An AngularJS directive (optional; for use if you are using AngularJS)
//
// Example:
// <input name="myfield" autocomplete-lhc="opts" ng-model="selectedVal">
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
// 1) listItems - (required) This is the list item data.  It should be an array,
//    and each element in the array should have a "text" property which is the
//    display string the user sees.  The object containing that text property
//    is what will get stored on the model you have associated via ng-model
//    (selectedVal, in the example above).
// 2) maxSelect - (default: 1) the maximum number of items that can be selected
//    from the list.  If this is '*', an unlimited number can be selected.  When
//    more than one item can be selected, selected items are stored in an array
//    on the model (e.g., selectedVal becomes an array).
// 3) defaultValue - The default value for the field.  This setting also exists in
//    the non-directive prefetch lists, but there are two differences here:
//    a) defaultValue can either be one of the list item display strings (the
//       "text" property), or it can be a hash like {code: 'AF-5'}, where "code" is
//       a key on the list item object, and 'AF-5' is the value of that key
//       to select the item as the default.  This is to allow the default value
//       to be specified not just by the display string, but by other attributes
//       of the list item object.
//    b) the default list item is loaded into the field when the autocompletion
//       is set up.
// 4) Any other parameters used by the Def.Autocomp.Prefetch constructor defined in
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
  angular.module('autocompleteLhcMod', [])

    .directive('autocompleteLhc', ['$timeout', function (autocompleteConfig, $timeout) {
      'use strict';
      return {
        require:'?ngModel',
        scope: {
          modelData: '=ngModel' // the ng-model attribute on the tag
        },
        link:function (scope, element, attrs, controller) {
          // Set the update options to 'none' so only the autocompleter code
          // updates the model.
          if (!controller.$options)
            controller.$options = {};
          controller.$options.updateOn = 'none';
          controller.$options.updateOnDefault = false;

          /**
           *  Sets up a prefetched list on the field.
           * @param pElem the element on which the autocompleter is to run
           * @param autoOpts the options from the directive attribute
           */
          function prefetchList(pElem, autoOpts) {
            var itemText = [];
            var itemTextToItem = {};
            var itemLabel;

            // See if we have a default value, unless the model is already
            // populated.
            var defaultKey = null; // null means not using a default
            var defaultValueSpec = autoOpts.defaultValue;
            var defaultKeyVal = null; // the value in defaultValueSpec corresponding to defaultKey
            if (defaultValueSpec !== undefined &&
                (scope.modelData === undefined || scope.modelData === null)) {
              if (typeof defaultValueSpec === 'string') {
                defaultKey = 'text';
                defaultKeyVal = defaultValueSpec;
              }
              else { // an object like {code: 'AL-23'}
                defaultKey = Object.keys(defaultValueSpec)[0];
                defaultKeyVal = defaultValueSpec[defaultKey];
              }
            }

            // "listItems" = list item data.
            var modelDefault = null;
            for (var i=0, numItems=autoOpts.listItems.length; i<numItems; ++i) {
              var item = autoOpts.listItems[i];
              itemLabel = item.text;
              itemText[i] = itemLabel;
              itemTextToItem[itemLabel] = item;
              if (defaultKey && item[defaultKey] === defaultKeyVal)
                modelDefault = item;
            }

            var ac = new Def.Autocompleter.Prefetch(pElem.id, itemText, autoOpts);
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

            // If we have a default value, assign it to the model.
            if (modelDefault !== null)
              scope.modelData = modelDefault;

            return ac;
          }


          /**
           *  Returns the model data structure for a selected item in a search
           *  list.
           * @param ac the autocompleter
           * @param itemText the display string of the selected item
           */
          function getItemModelData(ac, itemText) {
            var rtn = {text: itemText};
            var code = ac.getItemCode(itemText);
            if (code !== null)
              rtn.code = code;
            return angular.extend(rtn, ac.getItemExtraData(itemText))
          }


          /**
           *  Sets up a search list on the field.
           * @param pElem the element on which the autocompleter is to run
           * @param autoOpts the options from the directive attribute
           */
          function searchList(pElem, autoOpts) {
            var ac = new Def.Autocompleter.Search(pElem.id, autoOpts.url, autoOpts);
            Def.Autocompleter.Event.observeListSelections(pElem.name, function(eventData) {
              scope.$apply(function() {
                var itemText = eventData.final_val;
                if (!ac.multiSelect_) {
                  scope.modelData = getItemModelData(ac, itemText);
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
                    selectedItems.push(getItemModelData(ac, itemText));
                  }
                }
              });
            });

            return ac;
          }


          var initWidget = function () {
            // Because we created our own scope, we have to evaluate
            // attrs.autocompleteLhc in the parent scope.
            var autoOpts = scope.$parent.$eval(attrs.autocompleteLhc);

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

              // See if there is an existing model value for the field (and do
              // it before prefetchList runs below, which might store a default
              // value in the model).
              var md = scope.modelData;
              var hasPrepoluatedModel = md !== undefined;

              var ac = autoOpts.url ? searchList(pElem, autoOpts) :
                prefetchList(pElem, autoOpts);

              // If there is a already a model value for this field, load it
              // into the autocompleter.
              if (hasPrepoluatedModel) {
                if (ac.multiSelect_) {  // in this case md is an array
                  for (var i=0, len=md.length; i<len; ++i) {
                    var text = md[i].text;
                    ac.storeSelectedItem(text, md[i].code);
                    ac.addToSelectedArea(text);
                  }
                  // Clear the field value for multi-select lists
                  ac.element.value = '';
                }
                else {
                  ac.storeSelectedItem(md.text, md.code);
                  ac.element.value = md.text;
                }
              }

              // Add a parser to convert from the field value to the object
              // containing value and (e.g.) code.
              controller.$parsers.push(function(value) {
                // Just rely on the autocompleter list selection event to manage
                // model updates.  Here we will just return the model object, to
                // prevent any change to the model from the parsers.
                var rtn = scope.modelData;
                // Returning "undefined" means the value is invalid and will cause
                // the ng-invalid-parse class to get added.  Switch to null.
                if (rtn === undefined)
                  rtn = null;
                return rtn;
              });

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
