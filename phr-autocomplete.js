'use strict';
// An AngularJS directive (optional; for use if you are using AngularJS)
if (typeof angular !== 'undefined') {
  angular.module('autocompPhr', [])

    .constant('phrAutocompleteConfig', {})

    .directive('phrAutocomplete', ['phrAutocompleteConfig', '$timeout', function (phrAutocompleteConfig, $timeout) {
      'use strict';
      var options;
      options = {};
      angular.extend(options, phrAutocompleteConfig);
      return {
        require:'?ngModel',
        scope: {
          modelData: '=ngModel'
        },
        link:function (scope, element, attrs, controller) {
          var getOptions = function () {
            // Because we created our own scope, we have to evaluate
            // attrs.phrAutocomplete in the parent scope.
            return angular.extend({}, phrAutocompleteConfig, scope.$parent.$eval(attrs.phrAutocomplete));
          };

          var initWidget = function () {
            var phrAutoOpts = getOptions();

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
                  var finalVal = eventData.final_val;
                  var item = itemTextToItem[finalVal] ||
                    {value: finalVal, id: finalVal, label: finalVal};
                  scope.modelData = item;
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
                if (typeof value === 'object')
                  rtn = value.label;
                return rtn;
              });

              // if we have a default value, go ahead and select it
              if (phrAutoOpts.defaultValue !== undefined) {
                scope.modelData = itemTextToItem[phrAutoOpts.defaultValue];
              }
            } // if controller
          };

          // Run initWiget once after the name attribute has been filled in
          scope.$watch({}, initWidget, true); // i.e. run once
        }
      };
    }]
  );
}
