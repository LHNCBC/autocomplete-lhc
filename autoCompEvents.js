// Wrap the definitions in a function to protect our version of global variables
(function($, jQuery, Def) {
  /*
   *  This contains code for the custom "events" the autocompleter generates.
   *  Other code can use one of the "observe" methods to register to be notified
   *  when a certain type of event occurs.
   */
  Def.Autocompleter.Event = {
    /**
     *  Registers a callback for when the list is expanded.
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     *  The function will be called with the argument
     *  {list_expansion_method: 'CtrlRet'} if it was expanded with the keyboard,
     *  and {list_expansion_method: 'clicked'} if it was expanded with
     *  the mouse.
     */
    observeListExpansions: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'LIST_EXP', callback);
    },


    /**
     *  Registers a callback for when an item is selected from the list, or if
     *  the user enters a non-list value (for lists that support that).
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     *  The function will be called with a hash argument with the following keys:
     *  1) val_typed_in (what the user actually typed in);
     *  2) final_val (the final value for the field);
     *  3) final_val_from_list (boolean indicating whether or not final was
     *     selected from a list;
     *  4) input_method ('clicked', 'arrows', or 'typed')
     *  5) short_list - the list values the user saw (if the list was not expanded)
     *  6) item_data - associated data for the selected item.  For prefetched
     *     autocompleters, this is the data passed into the constructor (e.g.
     *     an item code), and for search autocompleters is the data returned
     *     from the server along with the item.
     */
    observeListSelections: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'LIST_SEL', callback);
    },


    /**
     *  Registers a callback for when a list field receives focus.
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     *  The function will be called with an the following argument:
     *  - start_val (the value already in the field)
     */
    observeFocusEvents: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'FOCUS', callback);
    },


    /**
     *  Registers a callback for when users cancel the list (by pressing
     *  the escape key).  This closes the list and restores the field's value.
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     *  The function will be called with an the following argument:
     *  - restored_value (the value that was restored to the field)
     */
    observeCancelList: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'CANCEL', callback);
    },


    /**
     *  Registers a callback for when a suggestions dialog is shown to the
     *  user.
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     *  The function will be called with an the following argument:
     *  - suggestion_list (an array of the values in the list shown to the user,
     *    or an empty array if no suggestions were found)
     */
    observeSuggestionsShown: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'SUGGESTIONS', callback);
    },


    /**
     *  Registers a callback for when a user accepts a suggestion from
     *  the suggestion dialog.
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     */
    observeSuggestionUsed: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'SUGGESTION_USED', callback);
    },


    /**
     *  For prefetched lists only, this registers a callback for when the
     *  list is changed via setListAndField but the field value does NOT change.
     *  (If the field value is changed, a change event is sent.)
     * @param fieldKey the lookup key from Def.Observer.lookupKey(field) for which
     *  the given callback will be called.  Fields whose lookupKey value matches
     *  fieldKey will trigger the callback for this event.  The
     *  idea is that there might be multiple fields (perhaps of an unknown number)
     *  that are related for which the callback should receive notifications.
     * @param callback the function to be called when the list is expanded.
     */
    observeListAssignments: function(fieldKey, callback) {
      this.storeCallback(fieldKey, 'LIST_ASSIGNMENT', callback);
    },


    /**
     *  Registers a callback for when a record data requester (any one) clears
     *  fields.
     * @param callback the function to be called.  It will get the following
     *  argument:
     *  - updatedFields: an array of DOM field elements for the fields that
     *    were cleared
     */
    observeRDRClearing: function(callback) {
      this.storeCallback(null, 'RDR_CLEARING', callback);
    },


    /**
     *  Registers a callback for when a record data requester (any one) assigns
     *  values to fields.
     * @param callback the function to be called.  It will get a hash containing
     *  the following key/value pairs:
     *  - updatedFields: an array of DOM field elements for the fields that
     *    were cleared
     *  - updatedFieldIDToVal: a hash of field IDs to the updated values
     *  - listField - the field whose list had the record data requester.
     */
    observeRDRAssignment: function(callback) {
      this.storeCallback(null, 'RDR_ASSIGNMENT', callback);
    }
  };

  Object.extend(Def.Autocompleter.Event, Def.Observable);
})($, jQuery, Def);
