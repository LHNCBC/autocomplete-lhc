// This file contains auto-completer code for the Data Entry Framework project.

// These autocompleters are based on the Autocompleter.Base class defined
// in the Script.aculo.us controls.js file.

if (typeof Def === 'undefined')
  Def = {};


// Wrap the definitions in a function to protect our version of global variables
(function($, jQuery, Def) {
  Def.Autocompleter = { // Namespace for DEF autocompletion stuff
    // Variables related to autocompleters but independent of any particular
    // autocompleter go here.

    /**
     *  A variable to keep track of which autocomplete text field is using the
     *  shared autocompletion area.
     */
    currentAutoCompField_: -1,

    /**
     *  The suggestion mode constant that means rely on the statistics for
     *  the field's master table.  See the suggestionMode option in
     *  defAutocompleterBaseInit.
     */
    USE_STATISTICS: 2,

    /**
     *  The suggestion mode constant that means do not recommend one item from
     *  the returned list over the others.  See the suggestionMode option in
     *  defAutocompleterBaseInit.
     */
    NO_COMPLETION_SUGGESTIONS: 0,

    /**
     *  The suggestion mode constant that means the shortest match should
     *  recommended over other returned items.  See the suggestionMode option in
     *  defAutocompleterBaseInit.
     */
    SUGGEST_SHORTEST: 1,

    /**
     *  The screen reader log used by the autocompleter.
     */
    screenReaderLog_: new Def.ScreenReaderLog(),

    /**
     *  Sets global options for customizing behavior of all autocompleters.
     *  Currently, what is supported is the overriding (or supplying) of the
     *  functions found in this object.
     * @param options - a hash from one or more of this object's function names
     *  to a replacement function.
     */
    setOptions: function(options) {
      Object.extend(this, options);
    },


    /*
     *  Returns value of the given form field element.  (This may be overridden for
     *  special handling of values.)
     * @param field the form field from which the value is needed.
     */
    getFieldVal: function(field) {
      return field.value;
    },


    /**
     *  Sets the given form element's value to the given value. (This may be
     *  overridden for special handling of values.)
     * @param field the DOM field element.
     * @param val the new value, which should only be a string.
     * @param runChangeEventObservers (default true) whether the change
     *  event observers for the field (which includes the update for the data
     *  model and the running of rules) should be run after the value is set.
     */
    setFieldVal: function(field, val, runChangeEventObservers) {
      var fieldVal = this.getFieldVal(field);
      field.value = val;
      if (fieldVal !== val && runChangeEventObservers) {
        Element.simulate(field, 'change');
      }
    },


    /**
     *  Returns the field lookup key for the given field.  Lookup keys are used
     *  to store information about a particular field (or maybe a column of
     *  identical fields) and are also used to store/retrieve the associated
     *  fields themselves.  In systems where every field is unique, this can
     *  be the field's name attribute, but it can also be a key shared by fields
     *  that have the same supporting list.  If this is overridden, be sure to
     *  also override lookupFields.
     * @param field a DOM field element
     */
    getFieldLookupKey: function(field) {
      return field.name; // default implementation
    },


    /**
     *  Returns the fields matching the given lookup key.  (See getFieldLookupKey).
     *  If there is no match, an empty array will be returned.
     *  This should be overridden to match getFieldLookupKey if that is overridden.
     * @param lookupKey a key for finding matching elements.
     */
    lookupFields: function(lookupKey) {
      var rtn = [];
      for (var i=0, numForms=document.forms.length; i<numForms; ++i) {
        var match = document.forms[i].elements[lookupKey];
        if (match !== undefined)
          rtn.push(match);
      }
      return rtn;
    },


    /**
     *  Returns the fields matching otherFieldLookupKey (see getFieldLookupKey)
     *  which are associated in some way with "field".  This default implementation
     *  just returns all the fields matching otherFieldLookupKey.
     * @param field the field for which related fields are needed
     * @param otherFieldLookupKey the key for finding fields related to "field".
     *  (See getFieldLookupKey.)
     * @returns an array of matching fields.  The array will be empty if there
     *  are no matching fields.
     */
    findRelatedFields: function(field, otherFieldLookupKey) {
      return this.lookupFields(otherFieldLookupKey);
    },


    /**
     *  Returns the label text of the field with the given ID, or null if there
     *  isn't a label.  This default implementation just returns null.
     * @param fieldID the ID of the field for which the label is needed.
     */
    getFieldLabel: function(fieldID) {
      return null;
    },


    /**
     *  Sets off an alarm when a field is in an invalid state.
     * @param field the field that is invalid
     */
    setOffAlarm: function(field) {
       Def.FieldAlarms.setOffAlarm(field);
    },


    /**
     *  Cancels the alarm started by setOffAlarm.
     */
    cancelAlarm: function(field) {
       Def.FieldAlarms.cancelAlarm(field);
    },


    /**
     *  Logs a message for a screen reader to read.  By default, this
     *  uses an instance of Def.ScreenReaderLog.
     * @param msg the message to log
     */
    screenReaderLog: function(msg) {
      Def.Autocompleter.screenReaderLog_.add(msg);
    }
  };



  /**
   *  A base class for our Ajax and local autocompleters.
   */
  Def.Autocompleter.Base = function() {}; // Base class object


  /**
   *  Class-level stuff for Def.Autocompleter.Base.
   */
  Object.extend(Def.Autocompleter.Base, {

    /**
     *  The maximum number of items to show below a field if the user has not
     *  used the "see more" feature.
     */
    MAX_ITEMS_BELOW_FIELD: 7,

    /**
     *  Whether classInit() has been called.
     */
    classInit_:  false,

    /**
     *  Does one-time initialization needed by all autocompleters on the page.
     */
    classInit: function() {
      if (!this.classInit_) {
        Element.insert($(document.body),
           '<div id="searchResults" class="form_auto_complete"> \
           <div id="completionOptionsScroller">\
           <span class="auto_complete" id="completionOptions"></span> \
           </div> \
           <div id="moreResults">See more items (Ctl Ret)</div> \
           <div id="searchCount">Search Results<!-- place holder for result count, \
            needed for height calculation--></div> \
           <div id="searchHint">Search Hint<!--place holder--></div> \
           </div>');

        Event.observe('moreResults', 'mousedown', function(event) {
          var field = $(Def.Autocompleter.currentAutoCompField_);
          field.autocomp.handleSeeMoreItems(event);
          Def.Autocompleter.Event.notifyObservers(field, 'LIST_EXP',
          {list_expansion_method: 'clicked'});
        });

        Event.observe('completionOptionsScroller', 'mousedown', function(event) {
          if (event.target.id === 'completionOptionsScroller') {
            Event.stop(event);
            event.stopImmediatePropagation();
            Def.Autocompleter.completionOptionsScrollerClicked_ = true;
            if ($(Def.Autocompleter.currentAutoCompField_) != -1) {
              var field = $(Def.Autocompleter.currentAutoCompField_);
              setTimeout(function(){field.focus()}, 1);
            }
          }
        }.bind(this));
        this.classInit_ = true;
      }
    },


    /**
     * Provides a way to do a case-insensitive sort on a javascript array.
     * Simply specify this function as the parameter to the sort function,
     * as in myArray.sort(noCaseSort)
     */
    noCaseSort: function(a, b) {
      var al = a.toLowerCase() ;
      var bl = b.toLowerCase() ;
      if (al > bl) return 1 ;
      else if (al < bl) return -1 ;
      else return 0 ;
    },


    /**
     *  Escapes a string for safe use as an HTML attribute.
     * @param val the string to be escaped
     * @return the escaped version of val
     */
    escapeAttribute: function(val) {
      // Note:  PrototypeJS' escapeHTML does not escape quotes, and for
      // attributes quotes need to be escaped.
      // JQuery does not provide an API for this at all.
      //   (See:  http://bugs.jquery.com/ticket/11773)
      // Various implementations are benchmarked here:
      //   http://jsperf.com/htmlencoderegex
      // This one is the fastest (at least in Chrome).
      return val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g,
'&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },


    /**
     *  Reverses escapeAttribute.
     * @param escapedVal the string to be unescaped
     * @return the unescaped version of escapedVal
     */
    unescapeAttribute: function(escapedVal) {
      return escapedVal.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
  });


  // Extend Def.Autocompleter.Base from Autocompleter.Base, and then modify it
  // further.
  Object.extend(Def.Autocompleter.Base.prototype, Autocompleter.Base.prototype);

  // This is the definition for the Base instance methods.  We define it in
  // a temporary object to help NetBeans see it.
  var tmp = {
    /**
     *  The array of options passed to the constructor.
     */
    constructorOpts_: null,

    /**
     *  The HTML DOM input element holding the score field for this list.
     */
    scoreField_: null,

    /**
     *  Whether scoreField_ has been initialized.
     */
    scoreFieldInitialized_: false,

    /**
     *  A hash between list values and and the original unsorted list index,
     *  so that we can match up list values with arrays for codes and other
     *  data.
     */
    itemToDataIndex_: null,

    /**
     *  The codes of the currently selected items, stored as keys on a hash.
     */
    selectedCodes_: null,

    /**
     *  The currently selected items' display strings, stored as keys on a hash.
     *  Some might not have codes, and so there might be more entries here than in
     *  selectedCodes_.
     */
    selectedItems_: null,

    /**
     *  Whether the field value is required to be one from the list.
     */
    matchListValue_: null,

    /**
     *  Whether the field is invalid.
     */
    invalidStatus_: false,

    /**
     *  Whether the current field's value matches (even partially) one or more of
     *  the items in the list.  If the user types the first few leters of an
     *  item, it's matchStatus_ is true, even though the field value does
     *  not equal a complete list item value.
     */
    matchStatus_: true,

    /**
     *  Whether the field is responding to a focus event.
     */
    focusInProgress_: false,

    /**
     *  Whether the field is losing focus but will be refocused after a short
     *  delay.
     */
    refocusInProgress_: false,

    /**
     *  Whether or not the list will be shown below the field.
     */
    listBelowField_: true,

    /**
     *  The element that holds the selection list and search hit count
     *  information.
     */
    listContainer: null,

    /**
     *  A RecordDataRequester instance that will get used after list entry
     *  selection to pull back additional data.
     */
    recDataRequester_: null,

    /**
     *  Whether autocompletion is enabled.
     */
    enabled_: true,

    /**
     *  The value of the list's field before it was filled in by changing the
     *  default list selection (e.g. by arrowing into the list).
     */
    preFieldFillVal_: null,

    /**
     *  This is true when the field value is a list value.  This is initially null,
     *  which means we do not know anything about the current field value.  (A value
     *  of false means we know it is not a list value.)
     */
    fieldValIsListVal_: null,

    /**
     *  A hash from item indexes to heading levels, for the list items currently
     *  in the list shown to the user.  A level of 0 means
     *  the item is not a heading, level 1 means the item is a top-level
     *  heading, and level 2 means a sub-heading.
     */
    indexToHeadingLevel_: {},

    /**
     *  An integer specifying what type of suggestion should
     *  be offered based on what the user has typed.  For allowed values,
     *  see the suggestionMode option in defAutocompleterBaseInit.
     */
    suggestionMode_: this.SUGGEST_SHORTEST,

    /**
     *  A reference to the last scroll effect (used in positioning).
     */
    lastScrollEffect_: null,

    /**
     *  Whether or not multiple items can be selected from the list.
     */
    multiSelect_: false,

    /**
     *  The hash of "extra data" for the current list.  (This might only apply
     *  to search lists.)
     */
    listExtraData_: null,


    /**
     *  An initialization method for the base Def.Autocompleter class.  This
     *  should be called after the initialization done by an autocompleter's
     *  Scriptaculous autocompleter base class.
     * @param matchListValue Whether the field value is required to be one from
     *  the list
     * @param options A hash of optional parameters.  For the allowed keys see the
     *  subclasses.  The base class uses the following keys:
     *  <ul>
     *    <li>dataRequester - A DataRecordRequester for getting additional data
     *     after the user makes a selection from the completion list.  This may be
     *     null, in which case no request for additional data is made.</li>
     *    <li>suggestionMode - an integer specifying what type of suggestion
     *     should be offered based on what the user has typed.  If this is not
     *     specified, the default is [Def.Autocompleter.]SUGGEST_SHORTEST, which
     *     means "pick the shortest match."  A value of
     *     NO_COMPLETION_SUGGESTIONS means no suggestions, and a value of
     *     USE_STATISTICS means that the suggestion is based on statistics, and
     *     that we will rely on the server to return the best item as the first
     *     item in the list.</li>
     *    <li>maxSelect - (default 1) The maximum number of items that can be
     *     selected.  Use '*' for unlimited.</li>
     *  </ul>
     */
    defAutocompleterBaseInit: function(matchListValue, options) {

      if (options['suggestionMode'] !== undefined)
        this.suggestionMode_ = options['suggestionMode'];

      if (!options)
        options = {};
      if (options.maxSelect === undefined)
        options.maxSelect = 1;
      if (options.maxSelect === '*')
        options.maxSelect = Infinity;
      this.multiSelect_ = options.maxSelect !== 1;
      this.constructorOpts_ = options;

      this.selectedCodes_ = {};
      this.selectedItems_ = {};

      var dataRequester = options.dataRequester;
      var suggestionMode = options.suggestionMode;

      if (!Def.Autocompleter.Base.classInit_)
        Def.Autocompleter.Base.classInit();

      this.matchListValue_ = matchListValue;

      this.recDataRequester_ = dataRequester;

      // If this is a multiselect list, put the field into a span.
      if (options.maxSelect > 1) {
        var fieldDiv = jQuery('<span class="autocomp_selected"><ul></ul></span>')[0];
        var fieldParent = this.element.parentNode;
        fieldParent.replaceChild(fieldDiv, this.element);
        fieldDiv.appendChild(this.element);
        this.selectedList = fieldDiv.down();
      }

      // ARIA markup for screen readers
      // See http://test.cita.illinois.edu/aria/combobox/combobox2.php
      // for an example that works with JAWS + Firefox.  (It behaves
      // like a regular combobox, according to a JAWS user.)
      this.element.writeAttribute('role', 'combobox');
      // For aria-expanded, I am following the example at:
      // http://www.w3.org/TR/wai-aria/roles#combobox
      this.element.writeAttribute('aria-expanded', 'false');

      // Set up event handler functions.
      this.onHoverListener = this.onHover.bindAsEventListener(this);
      this.onMouseDownListener = this.onMouseDown.bindAsEventListener(this);
      Event.observe(this.element, 'change',
        this.onChange.bindAsEventListener(this));
      Event.observe(this.element, 'keypress',
        this.changeToFieldByKeys.bindAsEventListener(this));
      var fieldChanged = function() {this.typedSinceLastFocus_ = true;}.bind(this);
      Event.observe(this.element, 'paste', fieldChanged);
      Event.observe(this.element, 'cut', fieldChanged);

      // Store a reference to the element that should be positioned in order
      // to align the list with the field.
      this.listContainer = $('searchResults');

      // Make the this.showList and this.hideList available to onShow and onHide
      this.options.showList = this.showList.bind(this);
      this.options.hideList = this.hideList.bind(this);
      this.options.posAnsList = this.posAnsList.bind(this);

      // Undo the base class' hiding of the update element.  (We're hiding
      // the listContainer instead.)
      this.update.style.display="block";

      // Store a reference to the autocompleter in the field object, for
      // ease of accessing the autocompleter given the field.
      this.element.autocomp = this;

    },


    /**
     *  Used by the dupForField methods (defined in the subclasses) to
     *  duplicate the RecordDataRequester.
     * @param fieldID the ID of the field being assigned to the new RecordDataRequester
     *  this method creates.
     * @return the RecordDataRequester for the new autocompleter being
     *  constructed.  (The return value will be null if this autocompleter
     *  doesn't have a RecordDataRequester.)
     */
    dupDataReqForField: function(fieldID) {
      var dataReq = null;
      if (this.recDataRequester_)
        dataReq = this.recDataRequester_.dupForField(fieldID);
      return dataReq;
    },


    /**
     *  Returns the codes for the currently selected items or an empty array if there are none.
     */
    getSelectedCodes: function() {
      return Object.keys(this.selectedCodes_);
    },


    /**
     *  Returns the display strings for the currently selected items or an empty array if there are none.
     */
    getSelectedItems: function() {
      return Object.keys(this.selectedItems_);
    },


    /**
     *  Adds the code for the current item in the field to the list of selected
     *  codes, and does the same for the item text.  If this is not a multi-select
     *  list, the newly selected code will replace the others.
     */
    storeSelectedItem: function() {
      var itemText = this.element.value;
      var newCode = this.getItemCode(itemText);
      if (this.constructorOpts_.maxSelect === 1)
        this.selectedCodes_ = {};
      if (newCode !== null)
        this.selectedCodes_[newCode] = 1;
      this.selectedItems_[itemText] = 1;
    },


    /**
     *  Returns the code for the given item text, or null if there isn't one.
     */
    getItemCode: function(itemText) {
      if (!this.itemToDataIndex_)
        this.initItemToDataIndex();
      var dataIndex = this.itemToDataIndex_[itemText];
      var newCode = null;
      if (dataIndex !== undefined && this.itemCodes_)
        newCode = this.itemCodes_[dataIndex];
      return newCode;
    },


    /**
     *  Moves the current field string to the selected area.  After this,
     *  the field will be blank.
     */
    moveEntryToSelectedArea: function() {
      var escapedVal = Def.Autocompleter.Base.escapeAttribute(this.element.value);
      var li = jQuery('<li><button type="button" alt="'+escapedVal+
                      '"><span aria-hidden="true">&times;</span></button>'
                      +escapedVal+'</li>')[0];
      this.selectedList.appendChild(li);
      var span = li.childNodes[0];
      jQuery(span).click(jQuery.proxy(this.removeSelection, this));
      this.element.value = '';
      this.uneditedValue = '';
      Def.Autocompleter.screenReaderLog('Selected '+escapedVal);
      this.onFocus(); // show the list again
    },


    /**
     *  For a multi-select list, this is an event handler that removes an item
     *  from the selected area.
     * @param event the click event on the item to be removed.
     */
    removeSelection: function(event) {
      var li = event.target.parentNode;
      li.parentNode.removeChild(li);
      var itemText = li.childNodes[1].textContent;
      var itemCode = this.getItemCode(itemText);
      delete this.selectedCodes_[itemCode];
      delete this.selectedItems_[itemText];
      this.listSelectionNotification(itemText, true, true);
      Def.Autocompleter.screenReaderLog('Unselected '+itemText);
    },


    /**
     *  Returns true if the given text is one of the list items that
     *  has already been selected (for multi-select lists).
     */
    isSelected: function(itemText) {
      return this.selectedItems_ && this.selectedItems_[itemText] !== undefined;
    },


    /**
     *  Returns the score field for this list, or null if there isn't one
     */
    getScoreField: function() {
      if (!this.scoreFieldInitialized_) {
        this.scoreField_ = Def.Autocompleter.getScoreField(this.element);
        if(this.scoreField_)
          this.scoreFieldInitialized_ = true;
      }
      return this.scoreField_;
    },


    /**
     *  Listens to keypress events to determine if the user has typed into
     *  the field.
     * @param evt the key event
     */
    changeToFieldByKeys: function(evt) {
      // Only continue if we haven't already seen such an event.
      if (!this.typedSinceLastFocus_) {
        // Based on code from:
        // http://stackoverflow.com/a/4180715/360782
        var change = false;
        if (typeof evt.which === "undefined") {
          // This is IE, which only fires keypress events for printable keys
          change = true;
        }
        else if (typeof evt.which === "number" && evt.which > 0) {
          // In other browsers except old versions of WebKit, evt.which is
          // only greater than zero if the keypress is a printable key.
          // We need to filter out backspace and ctrl/alt/meta key combinations
          change = !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which !== 8;
        }
        this.typedSinceLastFocus_ = change;
      }
    },


    /**
     *  Sets up event listeners for the list elements.
     * @param element a list item DOM element.
     */
    addObservers: function(element) {
      // Listen for mousedown events (which arrive more quickly than
      // click events, presumably because click events probably have
      // to be distinguished from double-clicks.)
      Event.observe(element, "mousedown", this.onMouseDownListener);
    },


    /**
     *  Returns the value of a list item (minus any sequence number an
     *  separator.)
     * @param li a list item DOM element.
     */
    listItemValue: function(li) {
      return li.textContent; // decodes escaped HTML elements
    },


    /**
     *  Override the Scriptaculous version so we do *not* call scrollIntoView().
     *  This does not work well on our page, so we have to do the scrolling
     *  ourselves.
     */
    markPrevious: function() {
      if (this.preFieldFillVal_ === null) // save the value in case of ESC
        this.preFieldFillVal_ = this.element.value;

      // Move the index back and keep doing so until we're not on a heading (unless we
      // get back to where we started).
      var startIndex = this.index;
      do {
        if (this.index > 0)
          this.index--;
        else
          this.index = this.entryCount-1;
      } while (this.indexToHeadingLevel_[this.index] && this.index !== startIndex);


      var highlightedLITag = this.getEntry(this.index);
      this.scrollToShow(highlightedLITag, this.update.parentNode);

      // Also put the value into the field, but don't run the change event yet,
      // because the user has not really selected it.
      this.element.value = this.listItemValue(highlightedLITag);
      this.element.select();
    },


    /**
     *  Override the Scriptaculous version so we do *not* call scrollIntoView().
     *  This does not work well on our page, so we have to do the scrolling
     *  ourselves.
     */
    markNext: function() {
      if (this.preFieldFillVal_ === null) // save the value in case of ESC
        this.preFieldFillVal_ = this.element.value;

      // Move the index forward and keep doing so until we're not on a heading (unless we
      // get back to where we started).
      var startIndex = this.index;
      do {
        if (this.index < this.entryCount-1)
          this.index++;
        else
          this.index = 0;
      } while (this.indexToHeadingLevel_[this.index] && this.index !== startIndex);


      var highlightedLITag = this.getEntry(this.index);
      this.scrollToShow(highlightedLITag, this.update.parentNode);

      // Also put the value into the field, but don't run the change event yet,
      // because the user has not really selected it.
      this.element.value = this.listItemValue(highlightedLITag);
      this.element.select();
    },


    /**
     *  Hides the list container.
     */
    hideList: function() {
      if (Def.Autocompleter.currentAutoCompField_ === this.element.id) {
        // Check whether the list is hidden.  By default (via CSS) it is hidden,
        // so if style.visibility is blank, it is hidden.
        var hidden = this.listContainer.style.visibility !== 'visible';
        if (!hidden) {
          this.listContainer.style.visibility = 'hidden';
          this.listContainer.writeAttribute('aria-hidden', 'true');
          this.element.writeAttribute('aria-expanded', 'false');
        }
      }
    },


    /**
     *  Shows the list container.
     */
    showList: function() {
      var previouslyHidden = this.listContainer.style.visibility !== 'visible';
      this.listContainer.style.visibility = 'visible';
      this.listContainer.writeAttribute('aria-hidden', 'false');
      this.element.writeAttribute('aria-expanded', 'true');
      if (previouslyHidden && !this.temporaryHide_ && this.entryCount > 0) {
        Def.Autocompleter.screenReaderLog('A list has appeared below the '+
          this.getFieldName()+'.');
      }
    },


    /**
     *  Returns a field "name" like 'field "Drug Use Status"' for labeled fields,
     *  or just 'field' if there is no field label.
     */
    getFieldName: function () {
      if (this.fieldName_ === undefined) {
        var fieldLabel = Def.Autocompleter.getFieldLabel(this.element.id);
        this.fieldName_ =
          (fieldLabel === null) ? 'field' : 'field "'+fieldLabel+'"';
      }
      return this.fieldName_;
    },


    /**
     *  Scrolls the given item into view within its container.
     * @param item the item to scroll into view
     * @param container the scrollable container that has the item
     */
    scrollToShow: function(item, container) {
      if (item.offsetTop < container.scrollTop) {
        container.scrollTop = item.offsetTop;
      }
      else {
        var itemHeight = item.getHeight();
        // Get the height of the container, less border and scroll bar pixels
        var containerHeight = container.clientHeight;
        if (item.offsetTop + itemHeight - container.scrollTop > containerHeight) {
          container.scrollTop = item.offsetTop + itemHeight - containerHeight;
        }
      }
    },


    /**
     *  Pages the choice list (or table) up or down.
     * @param pageUp - true if it should try to page up, or false if it should
     *  try to page down.
     */
    pageOptionsUpOrDown: function(pageUp) {
      // Get the height of the search results, which might be constrained by
      // span tag (id completionOptions).
      var compOpts = $('completionOptions');
      var compOptHeight = compOpts.clientHeight; // the inner height, minus border
      var searchResHeight = compOpts.firstChild.getHeight();
      var newScrollTop;
      if (pageUp) {
        if (compOpts.scrollTop>0) {
          newScrollTop = compOpts.scrollTop - compOptHeight;
          if (newScrollTop < 0)
            newScrollTop = 0;
          compOpts.scrollTop = newScrollTop;
        }
      }
      else {
        // PAGE DOWN
        var maxScrollTop = searchResHeight - compOptHeight;
        if (maxScrollTop < 0)
          maxScrollTop = 0;
        if (compOpts.scrollTop < maxScrollTop) {
          newScrollTop = compOpts.scrollTop + compOptHeight;
          if (newScrollTop > maxScrollTop)
            newScrollTop = maxScrollTop;
          compOpts.scrollTop = newScrollTop;
        }
      }
    },


    /**
     *  Returns true if the given key event is a search request.
     */
    isSearchKey: function (event) {
      return event.keyCode === Event.KEY_RETURN && event.ctrlKey;
    },


    /**
     *  Override the onKeyPress method to incorporate our navigation key handling.
     *  Subclasses that wish to customize the Scriptaculous onKeyPress should
     *  instead override autocompKeyPress (for which a default implementation
     *  is given below).
     * @param event the event object from the keypress event
     */
    onKeyPress: function(event) {
      if (this.enabled_) {
        // Note:  Normal (i.e. not search or navigation) key strokes are handled
        // by Scriptaculous, which defers processing until a short time later
        // (specified by 'frequency').  This is important, because we are
        // catching a keyDown event, at which time the element's value has not
        // yet been updated.  (Nor can we contruct the new value, without knowing
        // the caret position in the field, and the current selection in the field.
        // Possible, but messy, for IE & Firefox.  Not sure about Safari.)

        // Check to see if this autocompleter knows how to search.
        var searcher = typeof this.fieldEventIsSearch !== 'undefined';
        var charCode = event.keyCode;

        if (searcher && this.fieldEventIsSearch(event)) {
          // This is the key combination for running a search in a field that is
          // also an autocompleter.
          this.autocompKeyPress(event); // might stop event
        }
        else if (this.active && charCode===Event.KEY_TAB) {
          // Change the Scriptaculous behavior and allow tab keys to move
          // to the next field following a selection.
          if (this.index>=0)
            this.selectEntry();
          if (this.observer)
            clearTimeout(this.observer);
          this.preFieldFillVal_ = null;
        }
        // Note:  The next two clauses were originally combined into one with
        // an "else if (this.active)".  In firefox, this resulted in the window
        // somehow getting the event, and in the case of a return key, the form
        // being submitted.  (At least, the form was submitted.)  This may
        // indicate a race condition, and more investigation would be a good idea.
        else if (this.active && this.index>=0 && !event.shiftKey &&
                 charCode===Event.KEY_RETURN) {
          // This is a completion key event, the autocompleter is active, and an
          // item is selected.
          this.autocompKeyPress(event); // might stop event
          this.preFieldFillVal_ = null;
        }
        else if ((charCode===Event.KEY_PAGEUP || charCode===Event.KEY_PAGEDOWN) &&
            this.active) {
          this.pageOptionsUpOrDown(charCode===Event.KEY_PAGEUP);
        }
        else if (!event.ctrlKey &&
         (charCode===Event.KEY_LEFT || charCode===Event.KEY_RIGHT) &&
            this.active && this.index>=0 &&
            this.update.hasClassName('multi_col')) {
          this.moveToOtherColumn(event);
        }
        else {
          if (charCode === Event.KEY_ESC && this.preFieldFillVal_!==null) {
            // Restore the field value
            this.element.value = this.preFieldFillVal_;
            Def.Autocompleter.Event.notifyObservers(this.element, 'CANCEL',
                {restored_value: this.preFieldFillVal_});
          }
          else if (charCode !== Event.KEY_DOWN && charCode !== Event.KEY_UP &&
                   charCode !== 17) { // 17 = control
            this.preFieldFillVal_ = null;  // reset on key strokes in field
          }
          // Ignore events that are only a shift or control key.  If we allow a
          // shift key to get processed (and e.g. show the list) then shift-tab
          // to a previous field can have trouble, because the autocompleter will
          // still be scrolling the page to show the list.
          if (charCode !== 16 && charCode !== 17) // 16 & 17 = shift & control
            this.autocompKeyPress(event);
        }
      }
    },


    /**
     *  A default implementation of autocompKeyPress, which just calls the
     *  Scriptaculous autocompleter onKeyPress method.
     * @param event the DOM event object
     */
    autocompKeyPress: function(event) {
      Autocompleter.Base.prototype.onKeyPress.apply(this, [event]);
    },


    /**
     *  Sets the indicator to let the user know the whether the field value
     *  (if present) matches a value in the field's list.
     * @param matchStatus the match status.  This should be true if the field
     *  value either matches a list item or is blank, and false otherwise.
     */
    setMatchStatusIndicator: function(matchStatus) {
      if (matchStatus) {
        if (this.element.hasClassName('no_match')) {
          this.element.removeClassName('no_match');
          Def.Autocompleter.screenReaderLog(
            'The field no longer contains a non-matching value.');
        }
      }
      else {
        this.element.addClassName('no_match');
        Def.Autocompleter.screenReaderLog(
          'The field\'s value does not match any items in the list.');
      }
      this.matchStatus_ = matchStatus;
    },


    /**
     *  Sets the indicator that marks a field as having an invalid value.  If
     *  the "invalid" parameter is set to false, the visual and permanent
     *  indicator an invalid value will be removed, but if animation and sound
     *  was in progress, that will run until completion.  (To interrupt that,
     *  use cancelInvalidValIndicator).
     * @param invalid true if the field is invalid.  (This is the reverse of
     *  the parameter to setMatchStatusIndicator, mostly because of the names
     *  of the two methods.)
     */
    setInvalidValIndicator: function(invalid) {
      if (invalid) {
        Def.Autocompleter.setOffAlarm(this.element);
        if (!this.invalidStatus_){
          this.element.addClassName('invalid');
          this.element.setAttribute('invalid', true);
        }
      }
      else {
        if (this.invalidStatus_){
          this.element.removeClassName('invalid');
          this.element.setAttribute('invalid', false);
        }
      }
      this.invalidStatus_ = invalid;
    },


    /**
     *  Halts any animation and sound associated with the invalid field value
     *  indicator.  This does not clear the permanent visual indicator.  To clear
     *  that, use setInvalidValIndicator(false).
     */
    cancelInvalidValIndicator: function() {
      Def.Autocompleter.cancelAlarm(this.element);
    },


    /**
     *  This is called to update the completion list area with new search results.
     *  We override this to change the default selection.
     * @param choices the HTML for a ul list.
     */
    updateChoices: function(choices) {
      // We no longer call controls.js' updateChoices because the autocompleteIndex
      // settings need to be made after we move the default selection.  However,
      // a good bit of this code is copied from there.
      this.index = -1;
      if (!this.changed && this.hasFocus) {
        this.update.innerHTML = choices;
        Element.cleanWhitespace(this.update);
        Element.cleanWhitespace(this.update.down());

        if(this.update.firstChild && this.update.down().childNodes) {
          this.entryCount = this.update.down().childNodes.length;
          if (this.suggestionMode_ !== Def.Autocompleter.NO_COMPLETION_SUGGESTIONS) {

            // Pick the default item and move it to the top of the list,
            // but not if the field is being focused, and not if the list
            // is numbered and the user typed a number, and not if the list uses
            // headings.
            var i;
            if (this.entryCount > 0 && !this.focusInProgress_) {
              if (this.add_seqnum && this.element.value.match(/^\d+$/)) {
                // Use the first non-heading entry (whose number should match what was typed)
                // as the default
                this.index = 0;
                for(; this.indexToHeadingLevel_[this.index] &&
                       this.index < this.entryCount; ++this.index);
              }
              else if (this.entryCount > 1 && !this.numHeadings_) {
                var useStats =
                  this.suggestionMode_ === Def.Autocompleter.USE_STATISTICS;
                var index = useStats ? 0 : this.pickDefaultItem();
                if (index > -1) {
                  var listTag = this.update.firstChild;
                  var listElements = listTag.childNodes;
                  var suggestion = listElements[index];
                  suggestion.addClassName('suggestion');
                  if (index > 0) {
                    listTag.insertBefore(suggestion, listElements[0]);
                  }
                }
              }
            }
          } // If we are making a suggestion

          for (i=0; i < this.entryCount; i++) {
            var entry = this.getEntry(i);
            entry.autocompleteIndex = i;
            this.addObservers(entry);
          }
        } else {
          this.entryCount = 0;
        }

        this.stopIndicator();

        if(this.entryCount===1 && this.options.autoSelect) {
          this.selectEntry();
          this.hide();
        } else {
          this.render();
        }

        // don't change the match indicator on a focus event.  (Prefetch
        // autocompleters show the whole list, no matter what is in the field.)
        if (!this.focusInProgress_) {
          // The field is in a non-matching state if the value is not empty
          // and there are no items in the list.
          this.setMatchStatusIndicator(this.entryCount > 0 ||
                               Def.Autocompleter.getFieldVal(this.element)==='');
        }
      }
    },


    /**
     *  Returns the index of the item in the currently displayed list (which
     *  is possibly a subset of the full list if the user has typed something)
     *  which should be highlighted as the default item.  The code here assumes
     *  the list is a standard list, and not a table such as used by
     *  autoCompTableSearch.js.
     * @return the index of the item, or -1 if no item should be highlighted.
     */
    pickDefaultItem: function() {
      // If there is something in the field, change the default hightlight to
      // 1) the shortest choice with the field value at the beginning, or
      // 2) the shortest choice with the field value somewhere, or
      // 3) the shortest choice
      var elemValue = this.element.value.trim().toLowerCase();
      var rtn = -1;

      if (elemValue.length > 0 && this.entryCount > 0) {
        var minLengthIndex = -1;
        var minLength = Infinity;
         // this.update.firstChild.childNodes[minLengthIndex].innerHTML.length;
        var beginMatchMinLengthIndex = -1;
        var beginMatchMinLength = minLength;
        var innerMatchMinLengthIndex = -1;
        var innerMatchMinLength = minLength;

        var listItemElems = this.update.firstChild.childNodes;
        for (var i=0; i<this.entryCount; ++i) {
          // Make sure the entry is not a header before considering it
          var headingLevel = this.indexToHeadingLevel_[i];
          if (!headingLevel) { // could be null or 0; either case is not a heading
            var elem = listItemElems[i];
            var elemText = this.listItemValue(elem).toLowerCase();
            // Also remove non-word characters from the start of the string.
            elemText = elemText.replace(/^\W+/, '');

            var matchIndex = elemText.indexOf(elemValue);
            var elemLength = this.update.firstChild.childNodes[i].innerHTML.length;
            if (matchIndex === 0) {
              // if searching by list item #, then ignore length and highlight
              // first element
              if ((/(^\d+$)/).test(elemValue)) {
                beginMatchMinLengthIndex = 0;
                beginMatchMinLength = 0;
              }
              else if (elemLength < beginMatchMinLength) {
                beginMatchMinLengthIndex = i;
                beginMatchMinLength = elemLength;
              }
            }
            else if (beginMatchMinLengthIndex === -1) { // no begin match found yet
              if (matchIndex > 0) {
                if (elemLength < innerMatchMinLength) {
                  innerMatchMinLengthIndex = i;
                  innerMatchMinLength = elemLength;
                }
              }
              else if (innerMatchMinLengthIndex === -1 && // no inner match yet
                       elemLength < minLength) {
                minLength = elemLength;
                minLengthIndex = i;
              }
            }
          }
        }

        if (beginMatchMinLengthIndex > -1)
          rtn = beginMatchMinLengthIndex;
        else if (innerMatchMinLengthIndex > -1)
          rtn = innerMatchMinLengthIndex;
        else
          rtn = minLengthIndex;
      } // if we have some entries

      return rtn;
    },


    /**
     *  Positions the answer list.
     */
    posAnsList: function() {
      this.posListBelowFieldInMultiCol();
      // If the list was already showing, made sure the currently selected item
      // is still in view after the repositioning (which sets the scrollTop
      // of the container back to 0.)
      if (this.index > 0)
        this.scrollToShow(this.getCurrentEntry(),  $('completionOptionsScroller'));
    },


    /**
     *  Positions the list below the field, using a multicolumn format if
     *  necessary and scrolling the document up to show the multicolumn list if
     *  necessary.  This is like the old "posListInMultiCol", but the list is
     *  always below the field.
     */
    posListBelowFieldInMultiCol: function() {
      var element = this.element;
      var update = this.update;
      update.style.height = '';  // Turn off height setting, if any

      var positionedElement = this.listContainer;

      // First put the list below the field as a single column list.
      // Element.clonePosition does not work in Prototype 1.7.2 when the parent
      // element is document.body.  This is yet another of many position bugs in
      // the 1.7.x Prototype, so I am switching to JQuery.
      var elemPos = jQuery(element).offset();
      positionedElement.style.left = elemPos.left + 'px';
      positionedElement.style.top = elemPos.top + element.offsetHeight + 'px';

      update.style.width = 'auto';
      this.listContainer.style.width = ''; // reset it
      $('completionOptionsScroller').style.height = '';

      var scrolledContainer = document.documentElement;
      var viewPortHeight = scrolledContainer.clientHeight;
      this.update.removeClassName('multi_col');
      var posElVPCoords = positionedElement.viewportOffset();
      var posElVPVertOffset = posElVPCoords[1];
      var maxListContainerBottom = viewPortHeight; // bottom edge of viewport
      var bottomOfListContainer = positionedElement.getBoundingClientRect().bottom;
      // If this list is not completely on the page, try making it a multi-column
      // list.
      if (bottomOfListContainer > maxListContainerBottom) {
        var tryMultiColumn = this.entryCount > 4; // otherwise it's too short
        if (tryMultiColumn) {
          // Try as a multi column list
          var firstEntry = this.getEntry(0);
          // For Chrome, but not Firefox, we need to set the width of the
          // list container; otherwise it will not adjust when the multiple
          // columns are turned on.
          // We set it to be twice the width of a list item plus 4 pixels for
          // the border.
          var newListWidth = firstEntry.offsetWidth * 2 + 4;
          // Make sure the new width will fit horizontally
          var viewPortWidth = scrolledContainer.clientWidth;
          if (newListWidth > viewPortWidth - posElVPCoords[0])
            tryMultiColumn = false;
          else {
            this.listContainer.style.width = newListWidth + 'px';
            this.update.addClassName('multi_col');
            bottomOfListContainer = positionedElement.getBoundingClientRect().bottom;
          }
        }
        // If the multi-column list is still not on the page, try scrolling the
        // page down (making the list go up).
        if (!tryMultiColumn || bottomOfListContainer > maxListContainerBottom) {
          // Cancel any active scroll effect
          if (this.lastScrollEffect_)
            this.lastScrollEffect_.cancel();

          var scrollDownAmount =
            bottomOfListContainer - maxListContainerBottom;
          var elementTop = element.viewportOffset()[1];
          var headerBar = $('fe_form_header_0_expcol');
          var topNavBarHeight = headerBar ? headerBar.offsetHeight : 0;
          var maxScroll = elementTop - topNavBarHeight;
          // Make sure we don't scroll the field out of view.
          if (scrollDownAmount > maxScroll) {
            scrollDownAmount = maxScroll;
            // Also constrain the height of the list, so the bottom is on the page
            // The maximum allowable space is the viewport hieght minus the field
            // height minus the top nav bar height minus the part of the list
            // container that is not for list items (e.g. "See more results")).
            this.setListHeight(viewPortHeight - element.offsetHeight -
              topNavBarHeight - this.listContainer.offsetHeight +
              this.update.offsetHeight - 15);
            bottomOfListContainer = positionedElement.getBoundingClientRect().bottom;
          }

          this.lastScrollEffect_ = new Effect.Scroll(scrolledContainer,
            {y: scrollDownAmount, duration: 0.4});

          // If the list is extending beyond the bottom of the page's normal
          // limits, increasing the page's length, extend the spacer div to make
          // sure the size does not diminish.  This should prevent the "bouncing"
          // effect we were getting when typing into the field, where the page
          // would first scroll up to accomodate a large list, and then as more
          // keystrokes were enterd the list got smaller, so the page scrolled
          // back down.  (The browser does that automatically when the page
          // shrinks.)
          var spacerDiv = $('spacer');
          if (!spacerDiv) {
            spacerDiv = document.createElement('div');
            spacerDiv.setAttribute('id', 'spacer');
            document.body.appendChild(spacerDiv);
          }
          var spacerCoords = spacerDiv.viewportOffset();
          var bottomOfSpacer = spacerCoords[1] + spacerDiv.offsetHeight;
          if (bottomOfListContainer > bottomOfSpacer) {
            spacerDiv.style.height =
              bottomOfListContainer - spacerCoords[1] + 'px';
          }
        }
      }
    },


    /**
     *  Constrains the height of the completion options list.
     * @param height the height for the list options (an integer, a number of
     *  pixels, but without the 'px' string).
     */
    setListHeight: function(height) {
      // This will usually be called when the list needs to scroll.
      // First make the list wider to allow room for the scrollbar (which will
      // mostly likely appear) and to avoid squeezing and wrapping the list items.
      this.listContainer.style.width = this.listContainer.offsetWidth +
        20 + 'px';
      // Multi-column lists typical scroll/overflow to the right, so we have put
      // $('completionOptions') in a container, $('completionOptionsScroller')
      // and set the height on that instead.  This allows the list to be
      // scrolled vertically instead of horizontally (with lots of short
      // columns).
      $('completionOptionsScroller').style.height = height + 'px';
    },


    /**
     *  Since we aren't using the tokenizing stuff (which allows more than
     *  one selection from the list) we are overriding getToken to just
     *  return the element's full value.
     */
    getToken: function() {
      return this.element.value;
    },


    /**
     *  Since we aren't using the tokenizing stuff (which allows more than
     *  one selection from the list) we are overriding getTokenBounds to just
     *  return the bounds of the element's full value.
     */
    getTokenBounds: function() {
      return [0, this.element.value.length];
    },


    /**
     *  A copy constructor, for a new field (e.g. another field in a new row
     *  of a table).  This method must be overridden by subclasses.
     * @param fieldID the ID of the field being assigned to the new autocompleter
     *  this method creates.
     * @return a new autocompleter for field field ID
     */
    dupForField: function(fieldID) {
      throw 'dupForField must be overridden by autocompleter subclasses.';
    },


    /**
     *  Initializes the itemToDataIndex_ map.  This should be overridden by
     *  subclasses.
     */
    initItemToDataIndex: function() {
      throw 'initItemToDataIndex must be overridden by autocompleter classes that '+
       'need it';
    },


    /**
     *  Runs the stuff that needs to be run when the field changes.  (This assumes
     *  that the field has changed.)
     */
    propagateFieldChanges: function() {
      // If this autocompleter has a record data requester, run it or clear
      // the output fields.  This will make sure the output fields are clear
      // before the change event observers run for this field, in case one of
      // the change observers wants to use the data model's copy of the output
      // fields.  (If it does, it can wait for the record data requester's
      // latestPendingAjaxRequest_ variable to be null.)
      if (this.recDataRequester_) {
        if (this.matchStatus_ && this.element.value.trim() !== '')
          this.recDataRequester_.requestData();
        else // no data, or no data from list
          this.recDataRequester_.clearDataOutputFields();
      }
    },


    /**
     *  Notifies event observers of an attempted list selection (which might
     *  actually have just been the user typing a value rather than picking it
     *  from the list).
     * @param valTyped The value the user actually typed in the field (which might
     *  have just been the first few characters of the final list value).
     * @param onList whether the final value was on the list
     * @param removed For multi-select lists, this indicates whether the
     *  selection was actual an unselection, removing the named item from the
     *  list of selected items.  When true, valTyped is the removed value.
     *  (Optional; default false)
     */
    listSelectionNotification: function(valTyped, onList, removed) {
      var finalVal;
      if (removed === undefined)
        removed = false;
      else if (removed) {
        // For this case, we are passing in the removed value via valTyped
        finalVal = valTyped;
        valTyped = '';
      }
      if (finalVal === undefined)
        finalVal = this.element.value;
      var inputMethod = this.clickSelectionInProgress_ ? 'clicked' :
        this.preFieldFillVal_ === null ? 'typed' : 'arrows';

      var usedList = inputMethod !== 'typed' && onList;
      var newCode = this.getItemCode(finalVal);

      Def.Autocompleter.Event.notifyObservers(this.element, 'LIST_SEL',
        {input_method: inputMethod, val_typed_in: valTyped,
         final_val: finalVal, used_list: usedList,
         list: this.rawList_, on_list: onList, item_code: newCode, removed: removed});
    },


    /**
     *  Attempts to select an item from the list, if possible.  If successful,
     *  this will take care of updating the code field, and running rules.
     * @return true if an item was successfully selected (i.e. the list was active
     *  and the item was on the list), and false if not.
     */
    attemptSelection: function() {
      var canSelect = false;

      var valTyped = this.preFieldFillVal_ === null ? this.element.value :
          this.preFieldFillVal_;

      if (this.active) {
        if (this.index === -1) {
          var elemVal = this.element.value.trim().toLowerCase();
          // Allow the selection if what the user typed
          // exactly matches an item in the list, except for case.
          for (var i=0; i<this.entryCount && !canSelect; ++i) {
            if (elemVal===this.listItemValue(this.getEntry(i)).toLowerCase()) {
              canSelect = true;
              this.index = i;
            }
          }
        }
        else
          canSelect = this.entryCount > 0;

        this.fieldValIsListVal_ = canSelect;
        if (canSelect) {
          Autocompleter.Base.prototype.selectEntry.apply(this);
          this.storeSelectedItem();

          // Queue the list selection event before doing further processing,
          // which might trigger other events (i.e. the duplication warning event.)
          if (Def.Autocompleter.Event.callbacks_ !== null)
            this.listSelectionNotification(valTyped, true);

          // Now continue with the processing of the selection.
          this.uneditedValue = this.element.value;
          this.setMatchStatusIndicator(true);
          this.setInvalidValIndicator(false);
          this.propagateFieldChanges();
          if (this.constructorOpts_.maxSelect !== 1)
            this.moveEntryToSelectedArea();
        }
        // Don't hide the list if this is a multi-select list.
        if (!this.multiSelect_) {
          this.active = false;
          this.hide();
        }
      }

      // Send a list selection notification for non-matching values too, but
      // only if non-matching values are allowed.
      if (!canSelect && !this.matchListValue_ && Def.Autocompleter.Event.callbacks_ !== null)
        this.listSelectionNotification(valTyped, false);

      return canSelect;
    },


    /**
     *  Overrides the base selectEntry to handle the updating of the code field,
     *  etc.  This function assumes that the caller knows there is something
     *  to select.
     */
    selectEntry: function() {
      this.attemptSelection();  // should always succeed (per pre-conditions).
    },


    /**
     *  Takes appropriate action when the user enters something in the field
     *  that is not a list item.
     */
    handleNonListEntry: function() {
      // Set the match status to false, so the propagateFieldChanges will do
      // the right thing.
      this.matchStatus_ = false;
      this.propagateFieldChanges();

      // Blank values should not look different than values that haven't been
      // filled in.  They are okay-- at least until a submit, at which point
      // blank required fields will be brought to the user's attention.
      if (Def.Autocompleter.getFieldVal(this.element) === '') {
        this.setMatchStatusIndicator(true);
        this.setInvalidValIndicator(false);
        // Send a list selection event for this case.
        if (Def.Autocompleter.Event.callbacks_ !== null)
          this.listSelectionNotification('', false);
      }
      else {
        if (this.enabled_) // i.e. if there is a list that should be matched
          this.setMatchStatusIndicator(false);
        // If the element is not blank, and if a match is required, we set the
        // invalid value indicator.
        if (this.matchListValue_) {
          Def.Autocompleter.screenReaderLog(
            'For this field your entry must match an item from the suggestion list.');
          this.setInvalidValIndicator(true);
          // Refocus the field.  We have to wait until after the pending
          // focus event (for whatever element might be getting the focus) is
          // processed.  Waiting the smallest amount of time should be sufficient
          // to push this after the pending events.
          this.refocusInProgress_ = true;
          setTimeout(function() {
            this.element.focus();
            this.element.select(); // select the text
          }.bind(this), 1);
        }
        else {
          // See if we can find some suggestions for what the user typed.
          if (this.findSuggestions) {
            // Use a timeout to let the event that triggered this call finish,
            // before we bring up a dialog box which might change the focus
            // state and interfere with subsequent event handlers after this one.
            // (This was to fix issue 4569, in which the drug use status field's
            // list showed up on top of the dialog box, even though the field
            // had lost focus.  What happened there is that the showing of the
            // dialog box came before the navigation code's attempt to focus
            // the status field, and then when focus() was called the dialog
            // somehow called blur() on the field (perhaps using event capturing)
            // before the autocompleter's focus event handler ran.)
            setTimeout(function() {this.findSuggestions();}.bind(this), 1);
          }
        }
      }
    },


    /**
     *  An event function for when the field changes.
     * @param event the DOM event object for the change event
     */
    onChange: function (event) {
      if (!Def.Autocompleter.completionOptionsScrollerClicked_) {
        // The field might have a tool tip if it is empty, so do not access
        // element.value directly.
        var elemVal = Def.Autocompleter.getFieldVal(this.element);

        // We used to only process the change if this.enabled_ was true.  However,
        // if the list field is changed by a RecordDataRequester, it will not
        // be active and might have an empty list.

        // If the user has changed the value since the last entry/selection,
        // try to use the value to select an item from the list.
        // Don't attempt to make a selection if the user has cleared the field.
        if (this.uneditedValue !== elemVal && (elemVal === "" ||
                !this.attemptSelection())) {
          if (elemVal === "")
            this.fieldValIsListVal_ = false;
          this.handleNonListEntry();
        }

        // Note that attemptSelection might have changed the element value, so
        // we call getFieldVal again.
        this.valueOnChange_ = Def.Autocompleter.getFieldVal(this.element);
        if (!this.refocusInProgress_)  // if not refocusing (for an invalid value)
          this.uneditedValue = this.valueOnChange_;
      }
    },


    /**
     *  An event function for when the field loses focus.
     * @param event the DOM event object for the blur event
     */
    onBlur: function(event) {
      // Ignore blur events on the completionOptionsScroller.
      if (Def.Autocompleter.completionOptionsScrollerClicked_ === true) {
        Def.Autocompleter.completionOptionsScrollerClicked_ = false;
      }
      else {
        // If the did not type in the field but the value is different from the
        // value when the field was focused (such as via down arrow or a click)
        // we need to simulate the change event.
        var elemVal = Def.Autocompleter.getFieldVal(this.element);
        if (elemVal !== this.valueOnChange_)
          Element.simulate(this.element, 'change');

        if (this.enabled_ &&
                !(this.refocusInProgress_))
        {
          // The scriptaculous autocompleter uses click events on the list,
          // and so has to do its hide() call via a timeout.  We're using
          // mousedown events, which means the field never loses focus when a list
          // item is clicked, so we can just make the call directly.  For this
          // reason, we don't call the base onBlur.
          // Autocompleter.Base.prototype.onBlur.apply(this, [event]);
          this.hide();
          this.hasFocus = false;
          this.active = false;

          // If the field is invalid and not being refocused (as it would be if the
          // user changed the field value to something invalid) clear the field
          // value.
          // Since the empty field is not an invalid field, we need to set the
          // invalid indicator to false
          if (this.invalidStatus_){
            //this.element.value = '';
            Def.Autocompleter.setFieldVal(this.element, '');
            this.setInvalidValIndicator(false);
            // Also clear the match status flag, because a blank value is okay
            // (except for required fields when the form submits).
            this.setMatchStatusIndicator(true);
            // If the field was not originally blank, send a list selection
            // event.
            if (this.uneditedValue != '')
              this.listSelectionNotification('', false);
          }
          else {
            // If the user retyped a non-list value that was in the field, and that
            // value that matches part of an entry but not completely, and the field
            // allows non-list values, then the no-match indicator will have been
            // turned off and no change event will get fired.  We turn it back on
            // here.
            // However, another case is where the user makes a saved row editable, clicks
            // in the new prefetched field (e.g. the strength field) and clicks out again
            // leaving the old value there.  In that case, we do not know whether the field
            // value is in the list or not, because the user has not changed the value.  We
            // could check each item in the list for prefetched lists but not for search lists;
            // however it seems okay to leave the match status indicator alone in this case.  In
            // this case fieldValIsListVal_ will be null (neither true nor false).
            //
            // A third case:  If the user types an invalid value into a field,
            // then erases it and leaves the field, the field is now empty and
            // should have the no-match indicator removed.  In all cases where
            // the field is blank, the no-match indicator should be removed.
            if (Def.Autocompleter.getFieldVal(this.element) === '')
              this.setMatchStatusIndicator(true);
            else if (this.fieldValIsListVal_ === false)
              this.setMatchStatusIndicator(false);
          }
        }
      }
    },


    /**
     *  A method that gets called when the field gains the focus.
     * @param event the DOM event object for the focus event
     */
    onFocus: function(event) {
      Def.Autocompleter.currentAutoCompField_ = this.element.id;
      this.valueOnChange_ = Def.Autocompleter.getFieldVal(this.element);
      if (!this.refocusInProgress_)
        this.uneditedValue = this.valueOnChange_;

      this.refocusInProgress_ = false;
      this.preFieldFillVal_ = null;
      Def.Autocompleter.Event.notifyObservers(this.element, 'FOCUS',
        {start_val: this.uneditedValue});

      // If this is a multi-select list, announce any items in the selected
      // area.
      if (this.multiSelect_) {
        var selectedItems = Object.getOwnPropertyNames(this.selectedItems_);
        var numSelected = selectedItems.length;
        if (numSelected > 0) {
          var msg = 'Above this multi-select field are deselection buttons for '+
            'each selected item.  Currently selected:'+selectedItems.join(', ');
          Def.Autocompleter.screenReaderLog(msg);
        }
      }
    },


    /**
     *  Handles click events on the option list.
     * @param event the DOM event object for the mouse event
     */
    onMouseDown: function(event) {
      // Call the superclass' method.
      var liElement = Event.findElement(event, 'LI');
      var listItemClicked = !this.indexToHeadingLevel_[liElement.autocompleteIndex];
      if (listItemClicked) {
        this.clickSelectionInProgress_ = true;
        Autocompleter.Base.prototype.onClick.apply(this, [event]);
        this.clickSelectionInProgress_ = false;
        // Refocus the field.
        Event.stop(event);
        this.element.focus();
        // Reshow the list if this is a multi-select list.
        if (this.multiSelect_)
          this.showList();
      }
    },


    /**
     *  Gets called when the list needs to be shown.
     * @param element the autocompleter's field
     * @param update the DOM element that gets updated with the list
     */
    onShow: function(element, update) {
      element.autocomp.showList();
    },


    /**
     *  Gets called when the list needs to be hidden.
     * @param element the autocompleter's field
     * @param update the DOM element that gets updated with the list
     */
    onHide: function(element, update) {
      element.autocomp.hideList();
    },


    /**
     *  Moves the selected item to the other column, if there are two columns
     *  in the list.  (This is called when the user hits the right or left arrow.)
     *  This method assumes that the list is active and there is a selected item
     *  in the list (i.e., that the user has arrowed down into the list).
     * @param event the event that triggered this.  If moving to the other
     *  column is possible, the event will be stopped.
     */
    moveToOtherColumn: function(event) {
      // This is designed to work whether the number of items is odd or even.
      // If the number of items is odd and the current index is the middle
      // value, then there is no item in the other column so we don't move it.
      // Note that the index starts at zero (so 0 to 6 for 7 items).
      var numItems = this.update.firstChild.childNodes.length;
      var half = Math.floor(numItems/2);  // e.g. 3 if numItems == 6 or 7
      var shift = Math.ceil(numItems/2.0);  // e.g. 4 if numItems == 7
      var newIndex = this.index;
      if (this.index < half) // e.g. 0, 1, or 2 if numItems == 6 or 7
        newIndex = this.index + shift;
      else if (this.index >= shift) // e.g. >= 4 if numItems == 7
        newIndex = this.index - shift;

      // Make sure the new index is not a header item.  If so, don't move.
      if (newIndex !== this.index && !this.indexToHeadingLevel_[newIndex]) {
        // Put the value into the field, but don't run the change event yet,
        // because the user has not really selected it.
        this.index = newIndex;
        var highlightedLITag = this.getEntry(this.index);
        this.element.value = this.listItemValue(highlightedLITag);
        this.element.select();
        this.render();
        Event.stop(event);
      }
    },


    /**
     *  This gets called when the "See more items" link is clicked.  It should
     *  be overridden by subclasses as appropriate.  This default implementation
     *  does nothing.
     * @param event the click event on the link
     */
    handleSeeMoreItems: function(event) {},


    /**
     *  "Reads" the searchCount and moreResults divs via the ScreenReaderLog.
     */
    readSearchCount: function() {
      var rtn = false;
      if ($('searchCount').style.display !== 'none') {
        Def.Autocompleter.screenReaderLog('Showing '+ $('searchCount').innerHTML+ '.');
        if ($('moreResults').style.display !== 'none') {
          Def.Autocompleter.screenReaderLog('Pressing control+return will expand the list.');
        }
        rtn = true;
      }
      return rtn;
    },


    /**
     *  This can be called when an autocompleter is no longer needed.
     *  It performs any needed cleanup of field references and event listeners.
     *  Most sub-classes should not override this directly, but override
     *  stopObservingEvents and detachFromDOM instead.
     */
    destroy: function() {
      //Def.Logger.logMessage(['in autoCompBase.destroy, this.element.id = ',
      //                       this.element.id]) ;
      this.stopObservingEvents();
      this.detachFromDOM();
    },


    /**
     *  This can be called to detach an autocompleter's event listeners.
     */
    stopObservingEvents: function() {
      this.element.stopObserving();
    },


    /**
     *  Frees any references this autocompleter has to DOM objects.
     */
    detachFromDOM: function() {
      this.element.autocomp = null ;
      this.element = null;
      this.update = null;
      this.listContainer = null;
      this.recDataRequester_ = null; // has DOM references
    }


  };  // end Def.Autocompleter.Base class

  Object.extend(Def.Autocompleter.Base.prototype, tmp);
  tmp = null;
})($, jQuery, Def);
