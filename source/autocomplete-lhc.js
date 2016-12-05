// An AngularJS directive (optional; for use if you are using AngularJS)
//
// Example:
// <input id="myfield" autocomplete-lhc="opts" ng-model="selectedVal">
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


// Wrap the definitions in a function to protect our version of global variables
(function(Def) {
  "use strict";

  /**
   *  Updates (replaces) the list selection event handler for a field.
   * @param field the field with the autocompleter
   * @param handler the list selection event handler to be assigned
   */
  function updateListSelectionHandler(field, handler) {
    var fieldKey = Def.Observable.lookupKey(field);
    var eh = Def.Autocompleter.directiveListEventHandlers;
    var oldHandler = eh[field.id];
    if (oldHandler) {
      Def.Autocompleter.Event.removeCallback(fieldKey, 'LIST_SEL',
        oldHandler);
    }
    Def.Autocompleter.Event.observeListSelections(fieldKey,
      handler);
    eh[field.id] = handler;
  }


  /**
   *  Returns model data for the field value "finalVal", with the "text" attribute
   *  trimmed.
   * @param finaVal the field value after list selection.  This is the
   *  trimmed "text" value, which will be in the returned model object.
   * @param itemTextToItem a hash of list values to model data objects
   */
  function getTrimmedModelData(finalVal, itemTextToItem) {
    var item = itemTextToItem[finalVal];
    if (item) {
      item = Object.assign({}, item); // avoid modifying the original
      // item.text might be a padded value.  Replace it with the trimmed
      // version.  Otherwise, Angular tries to put the padded version into the
      // field, which won't "match" the list.
      item.text = finalVal;
    }
    else
      item = {text: finalVal};
    return item;
  }


  // Keep track of created list event handlers.  This is a hash of field IDs to
  // handler functions.
  Def.Autocompleter.directiveListEventHandlers = {};

  if (typeof angular !== 'undefined') {
    angular.module('autocompleteLhcMod', [])

      .directive('autocompleteLhc', ['$timeout', function (autocompleteConfig, $timeout) {
        return {
          restrict: 'A',
          require:'?ngModel',
          scope: {
            modelData: '=ngModel', // the ng-model attribute on the tag
            acOpts: '=autocompleteLhc'
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
                var trimmedLabel = itemLabel.trim();
                itemTextToItem[trimmedLabel] = item;
                if (defaultKey && item[defaultKey].trim() === defaultKeyVal)
                  modelDefault = getTrimmedModelData(trimmedLabel, itemTextToItem);
              }

              var ac = new Def.Autocompleter.Prefetch(pElem, itemText, autoOpts);
              addNameAttr(pElem);
              updateListSelectionHandler(pElem, function (eventData) {
                scope.$apply(function() {
                  var finalVal = eventData.final_val;
                  // finalVal is a trimmed version of the text.  Use that for
                  // the model data.
                  if (!ac.multiSelect_) {
                    scope.modelData =
                      getTrimmedModelData(finalVal, itemTextToItem);
                  }
                  else {
                    if (!scope.modelData)
                      scope.modelData = [];
                    var selectedItems = scope.modelData;
                    if (eventData.removed) {
                      // The item was removed
                      var removedVal = eventData.final_val;
                      for (var i = 0, len = selectedItems.length; i < len; ++i) {
                        if (removedVal === selectedItems[i].text) {
                          selectedItems.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else {
                      selectedItems.push(
                        getTrimmedModelData(finalVal, itemTextToItem));
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
             *  Assigns a name to the field if it is missing one.
             *  Names are used to register listeners.  We don't do this in the
             *  autocompleter base class to avoid polluting submitted form data
             *  with unintended fields.
             * @param pElem the field for which the name attribute will be
             *  needed.
             */
            function addNameAttr(pElem) {
              // If the element does not have a name, use the ID.  The name
              // to register listeners.
              if (pElem.name === '')
                pElem.name = pElem.id;
            }


            /**
             *  Sets up a search list on the field.
             * @param pElem the element on which the autocompleter is to run
             * @param autoOpts the options from the directive attribute
             */
            function searchList(pElem, autoOpts) {
              var ac = new Def.Autocompleter.Search(pElem, autoOpts.url, autoOpts);
              addNameAttr(pElem);
              updateListSelectionHandler(pElem, function(eventData) {
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
                      for (var i = 0, len = selectedItems.length; i < len; ++i) {
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


            var initWidget = function (options) {

              var autoOpts = options;

              if (controller) { // ngModelController, from the "require"
                var pElem = element[0];

                // if there's an autocomp already
                if (pElem.autocomp) {
                  // If the URL is changing, clear the cache, if this was a
                  // search autocompleter.
                  if (pElem.autocomp.clearCachedResults &&
                      pElem.autocomp.url !== options.url)
                    pElem.autocomp.clearCachedResults();
                  // Destroy the existing autocomp
                  pElem.autocomp.destroy();
                  // clean up the modal data
                  scope.modelData = null;
                }

                // See if there is an existing model value for the field (and do
                // it before prefetchList runs below, which might store a default
                // value in the model).
                var md = scope.modelData;
                var hasPrepoluatedModel = (md !== undefined) && (md !== null);

                var ac = autoOpts.hasOwnProperty('url') ?
                 searchList(pElem, autoOpts) : prefetchList(pElem, autoOpts);

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
                    if (md.text !== undefined) {
                      ac.storeSelectedItem(md.text, md.code);
                      ac.element.value = md.text;
                    }
                    else // handle the case of an empty object as a model
                      ac.element.value = '';
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
                  var rtn = '';
                  if (!ac.multiSelect_) {
                    if (typeof value === 'string')
                      rtn = value;
                    else if (value !== null && typeof value === 'object' &&
                             typeof value.text === "string") {
                      rtn = value.text;
                    }
                  }
                  else
                    rtn = '';
                  return rtn;
                });
              } // if controller
            };

            // Re-initialize the autocomplete widget whenever the options change
            scope.$watch("acOpts", initWidget, true);
          }
        };
      }]
    );
  }
})(Def);
