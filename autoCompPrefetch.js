// This file contains auto-completer code for the Data Entry Framework project.

// These autocompleters are based on the Autocompleter.Base class defined
// in the Script.aculo.us controls.js file.

(function($, jQuery, Def) {
  /**
   *  A prefetched list autocompleter.  This is extended from the Scriptaculous
   *  local autocompleter, and then from our autocompleter base class (so
   *  our settings override those of the Scriptaculous autocompleter).
   */
  Def.Autocompleter.Prefetch = Class.create();
  Def.Autocompleter.Prefetch.constructor = Def.Autocompleter.Prefetch;
  Object.extend(Def.Autocompleter.Prefetch.prototype,
    Autocompleter.Local.prototype);
  Object.extend(Def.Autocompleter.Prefetch.prototype,
    Def.Autocompleter.Base.prototype);
  Def.Autocompleter.Prefetch.prototype.className = 'Def.Autocompleter.Prefetch' ;
  // Define a temporary object for extending the Prefetch.prototype, which we
  // will do below.  This helps NetBeans find the methods and constants.
  var tmp = {

    /**
     * The HTML that goes before the sequence number (if used).
     */
    SEQ_NUM_PREFIX: '<span class="listNum">',


    /**
     *  The separator between the sequence number (if used) and the list item.
     *  (Note:  The </span> matches an opening <span> before the sequence number.
     */
    SEQ_NUM_SEPARATOR: ':</span>&nbsp; ',


    /**
     *  Whether the field failed validation the last time validation was
     *  run.
     */
    validationFailed_: false,

    /**
     *  Whether or not the list has been changed since construction.
     */
    listIsOriginal_: true,

    /**
     *  The list of options before the addition of item numbers.  Items in this
     *  list will match the value of the field after an item is selected.
     */
    rawList_: null,

    /**
     *  An array of the codes for the items in the list.
     */
    itemCodes_: null,

    /**
     *  Keeps track of whether the autocompleter has made an attempt to
     *  retrieve its list using a RecordDataRequester.
     */
    listLoadAttempted_: false,

    /**
     *  This is set to true when the user clicks on the "see more items" link.
     */
    seeMoreItemsClicked_: false,


    /**
     *  Whether the list shown to the user should be based on matches with
     *  the current field value.
     */
    matchListItemsToField_: false,

    /**
     *  The default selection index for this list when the field is empty.
     */
    defaultSelectionIndex_: null,

    /**
     *  If true, the field will be filled in with
     *  the list's value if there is just one item in the list.
     */
    autoFill_: true,

    /**
     *  A hash from item indexes to heading levels for all items in the complete
     *  list (as opposed to a subset of the list that matches the field value
     *  -- for that see indexToHeadingLevel_ in autoCompBase.js).  A level of 0
     *  means the item is not a heading, level 1 means the item is a top-level
     *  heading, and level 2 means a sub-heading.
     */
    fullIndexToHeadingLevel_: {},


    /**
     *  The constructor.  (See Prototype's Class.create method.)
     *
     * @param id the ID of the form field for which the list is displayed
     * @param listItems the array of completion options (list values).  If not
     *  specified here, the list will be supplied later by a call to the
     *  setListAndField function.  An example of this would be a list that
     *  contains values from the current form, such as the group headers
     *  list.  The list contents are not actually retrieved until the
     *  field receives focus, so that all currently defined group header
     *  fields are included on the list.
     * @param options A hash of optional parameters.  The allowed keys and their
     *  values are:
     *  <ul>
     *    <li>addSeqNum - whether sequence numbers should be added to the items
     *        in the prefetched answer list (default true).</li>
     *    <li>codes - the array of codes for the list values in "listItems"</li>
     *    <li>dataRequester - A DataRecordRequester for getting additional data
     *     after the user makes a selection from the completion list.  This may be
     *     null, in which case no request for additional data is made.</li>
     *    <li>matchListValue - whether the field should validate its value
     *      against the list (default: false)</li>
     *    <li>autoFill - If true, the field will be filled in with
     *      the list's value if there is just one item in the list.</li>
     *    <li>updateDiv - the form div that is the container for the
     *      list/options.  If unspecified, a default container will be
     *      used.)</li>
     *    <li>suggestionMode - an integer specifying what type of suggestion
     *      should be offered based on what the user has typed.  For values, see
     *      defAutocompleterBaseInit in autoCompBase.js.
     *    <li>itemToHeading - a hash of item codes to codes of item headings,
     *     where both items and headings appear in the listItems array.  This
     *     parameter requires that the codes parameter also be supplied.</li>
     *    <li>defaultValue - Either the code or the item text of the default value
     *     for this list's field.</li>
     *    <li>maxSelect - (default 1) The maximum number of items that can be
     *     selected.  Use '*' for unlimited.</li>
     *  </ul>
     */
    initialize: function(id, listItems, options) {
      if (!options)
        options = {};
      var addSeqNum = options['addSeqNum'];
      this.add_seqnum = addSeqNum===undefined ? true : addSeqNum;

      var autoFill = options['autoFill'];
      if (autoFill !== undefined)
        this.autoFill_ = autoFill;

      // Call the base class' initialize method.  We do this via the "apply"
      // function, which lets us specify the "this" object plus an array of
      // arguments to pass in to the method.
      var updateDiv = options['updateDiv'];
      if (!Def.Autocompleter.Base.classInit_)
        Def.Autocompleter.Base.classInit();
      if (updateDiv) {
        Autocompleter.Local.prototype.initialize.apply(this, [id,
          updateDiv, [], {frequency: 0.01, partialChars: 1}]);
      }
      else {
        Autocompleter.Local.prototype.initialize.apply(this, [id,
          'completionOptions', [], {frequency: 0.01, partialChars: 1,

          onShow: this.onShow,

          onHide: this.onHide,

          selector: this.selector
          }]);
      }

      // Set up event observers.  The "bind" stuff specifies what "this"
      // should be inside the event callbacks.
      Event.observe(id, 'focus', this.onFocus.bind(this));
      // The base class sets up one for a "blur" event.

      this.onMouseMoveListener = this.onMouseMove.bindAsEventListener(this);
      var matchListValue = options['matchListValue'];
      if (matchListValue === null)
        matchListValue = false;
      this.defAutocompleterBaseInit(matchListValue, options);
      this.initHeadings(options);
      var codes = options['codes'];
      this.setList(listItems, codes);
      this.listIsOriginal_ = true; // reset this after calling setList
      this.originalCodes_ = codes;
      this.options.minChars = 0; // do autocompletion even if the field is blank
      this.splitAutocomp_ = false;
      this.element.addClassName('ansList');
    },


    /**
     *  Used by dupForField to duplicate the item to codes map when creating a
     *  copy of this autocompleter for another field.  The map will not be
     *  copied if this autocompleter is not using its original list.  (The
     *  idea is that for fields that are given a list to begin with it makes
     *  sense to copy the item to codes map when duplicating, but for fields that
     *  are assigned lists from other actions, it does not make sense to copy
     *  the map.)
     * @param dupAutoComp the duplciate autocompleter instance.
     */
    dupItemToCode: function(dupAutoComp) {
      if (this.listIsOriginal_) {
        // Give the copy our hashmap of list items to codes.
        if (!this.itemToCode_)
          this.initItemToCode(); // so each copy doesn't have to do it
        dupAutoComp.itemToCode_ = this.itemToCode_;
      }
    },


    /**
     *  A copy constructor, for a new field (e.g. another field in a new row
     *  of a table).
     * @param fieldID the ID of the field being assigned to the new autocompleter
     *  this method creates.
     * @return a new autocompleter for field field ID
     */
    dupForField: function(fieldID) {
      var dataReq = this.dupDataReqForField(fieldID);
      var opts = Object.clone(this.constructorOpts_);
      opts['dataRequester'] = dataReq;
      var rtn = new Def.Autocompleter.Prefetch(fieldID, this.rawList_, opts);
      this.dupItemToCode(rtn);
      return rtn;
    },


    /**
     *  Initializes data structures needed to support headings.
     * @param options the options parameter passed into the constructor.
     */
    initHeadings: function(options) {
      var codes = options['codes'];
      var itemToHeading = options['itemToHeading'];
      if (itemToHeading) {
        // Remove this from the options so we don't re-do this part if we
        // duplicate the field.
        options['itemToHeading'] = null;
        // Initialize indexToHeadingLevel_
        var headingCodeLevels = {};
        var indexToHeadingLevel = {};
        for (var i=0, max=codes.length; i<max; ++i) {
          var itemCode = codes[i];
          var headingCode = itemToHeading[itemCode];
          if (headingCode) { // else this item has no heading
            var hcLevel = headingCodeLevels[headingCode];
            if (!hcLevel) {
              // See if this heading has a parent heading, and make this heading's
              // level one more than the parent's level.
              // Assume the parent heading would have been processed ealier,
              // which it would have been if the list items were in order.
              var phCode = itemToHeading[headingCode];
              hcLevel = phCode ? headingCodeLevels[phCode] + 1 : 1;
              headingCodeLevels[headingCode] = hcLevel;
            }
          }
        }
        for (i=0, max=codes.length; i<max; ++i) {
          hcLevel = headingCodeLevels[codes[i]];
          indexToHeadingLevel[i] = hcLevel ? hcLevel : 0;
        }

        this.fullIndexToHeadingLevel_ = indexToHeadingLevel;
        options['indexToHeadingLevel'] = indexToHeadingLevel;

        this.numHeadings_ = $H(headingCodeLevels).keys().length;
        options['numHeadings'] = this.numHeadings_;
      }
      else if (options['indexToHeadingLevel']) {
        this.fullIndexToHeadingLevel_ = options['indexToHeadingLevel'];
        this.numHeadings_ = options['numHeadings'];
      }
    },


    /**
     *  Initializes itemToCode_, based on the current values of this.itemCodes_
     *  and this.options.array.
     */
    initItemToCode: function() {
      this.itemToCode_ = {};
      if (this.itemCodes_) {
        for (var i=0, max=this.rawList_.length; i<max; ++i) {
          this.itemToCode_[this.rawList_[i]] = this.itemCodes_[i];
        }
      }
    },


    /**
     *  Generates the list of items that match the user's input.  This was
     *  copied from the Scriptaculous controls.js Autocompleter.Local.prototype
     *  and modified (initially to allow matches at word boundaries).
     *  For focus events that are not due to a mouse click selection, we show
     *  the full list.
     * @param instance the autocompleter instance
     *
     * @return the HTML for the list.
     */
    selector: function(instance) {
      var ret       = []; // Beginning matches
      var partial   = []; // Inside matches
      var entry     = instance.getToken();
      var totalCount     = 0;
      var useFullList =
        !instance.matchListItemsToField_ || instance.element.value.trim() === '';

      // If the user selected "See More Items", find all the matches.
      // Otherwise, limit the find to the maximum number of items we
      // show in the regular list (*2 because we allow two columns).
      var maxReturn = instance.seeMoreItemsClicked_ ? Infinity :
        Def.Autocompleter.Base.MAX_ITEMS_BELOW_FIELD*2;

      var maxItemsPerHeading = useFullList && !instance.seeMoreItemsClicked_ ?
        Math.floor(maxReturn/instance.numHeadings_) : Infinity;
      if (maxItemsPerHeading < 1)
        maxItemsPerHeading = 1;
      var countForLastHeading = 0; // number of items for the last header

      var rtnBuffer = ['<ul>'];
      var lastHeading = null;
      var lastHeadingLevel = null;
      var foundItemForLastHeading = false;
      var headerCount = 0;
      var subListIndex = 0; // an index into the list we're building
      instance.indexToHeadingLevel_ = {};
      if (instance.options.ignoreCase)
        entry = entry.toLowerCase();
      for (var i=0, max=instance.rawList_.length; i<max; ++i) {
        var tmp = instance.fullIndexToHeadingLevel_[i];
        if (tmp) {
          lastHeading = instance.rawList_[i];
          lastHeadingLevel = tmp;
          foundItemForLastHeading = false;
          ++headerCount;
        }
        else {
          var itemText = null;
          // Find all of the matches, even though we don't return them all,
          // so we can give the user a count.
          // This part does not yet support multi-level headings
          var elem = instance.rawList_[i];
          if (useFullList) {
            ++totalCount;
            itemText = elem;
          }

          // We need to be careful not to match the HTML we've put around the
          // list numbers.
          // See if the entry matches a number.
          var itemNumStr = null;
          var matchesItemNum = false;
          if (instance.add_seqnum) {
            itemNumStr = (i+1-headerCount)+'';
            if (!useFullList && itemNumStr.indexOf(entry) === 0) {
              ++totalCount;
              if (totalCount < maxReturn) {
                itemNumStr = '<strong>' + itemNumStr.substr(0, entry.length) +
                  '</strong>' + itemNumStr.substr(entry.length);
                matchesItemNum = true;
                itemText = instance.SEQ_NUM_PREFIX + itemNumStr +
                           instance.SEQ_NUM_SEPARATOR+ elem;
              }
            }
          } // if we're adding sequence numbers to this list

          if (!matchesItemNum && !useFullList) {
            // See if it matches the item at the beginning
            var foundMatch = false;
            var elemComp = elem;
            if (instance.options.ignoreCase)
              elemComp = elem.toLowerCase();
            var foundPos = elemComp.indexOf(entry);
            while (!foundMatch && foundPos !== -1) {
              if (totalCount < maxReturn) {
                if (foundPos === 0) {
                  ++totalCount;
                  itemText = '<strong>' + elem.substr(0, entry.length)+
                    '</strong>' + elem.substr(entry.length);
                  foundMatch = true;
                }
                else { // foundPos > 0
                  // See if the match is at a word boundary
                  if (instance.options.fullSearch ||
                    /(.\b|_)./.test(elemComp.substr(foundPos-1,2))) {
                    ++totalCount;
                    var prefix = elem.substr(0, foundPos);
                    itemText = prefix + '<strong>' +
                      elem.substr(foundPos, entry.length) + '</strong>' +
                      elem.substr(foundPos + entry.length);
                    foundMatch = true;
                  }
                }
              } // if we haven't exceeded maxReturn
              if (!foundMatch)
                foundPos =  elemComp.indexOf(entry, foundPos+1);
            } // while we haven't found a match at a word boundary
          } // if it didn't match the item number

          // For multi-select lists, filter out currently selected items.
          // Then, only add it if we haven't exceeded the limit.
          if ((!instance.multiSelect_ || !instance.isSelected(elem)) &&
              itemText && (totalCount <= maxReturn ||
                            (instance.numHeadings_>0 && useFullList))) {
            if (lastHeading && !foundItemForLastHeading) {
              foundItemForLastHeading = true;
              rtnBuffer.push('<li class="heading">');
              rtnBuffer.push(lastHeading);
              rtnBuffer.push('</li>');
              instance.indexToHeadingLevel_[subListIndex++] = lastHeadingLevel;
              countForLastHeading = 0;
            }
            if (!useFullList || !instance.numHeadings_ ||
                countForLastHeading < maxItemsPerHeading) {
              if (!matchesItemNum && instance.add_seqnum) {
                itemText = instance.SEQ_NUM_PREFIX + itemNumStr +
                  instance.SEQ_NUM_SEPARATOR + itemText;
              }
              rtnBuffer.push('<li>');
              rtnBuffer.push(itemText);
              instance.indexToHeadingLevel_[subListIndex++] = 0;
              rtnBuffer.push('</li>');
              if (useFullList)
                ++countForLastHeading;
            }
          }
        } // else this is not a heading
      } // for each item

      if (totalCount > maxReturn) {
        $('searchCount').innerHTML = maxReturn + ' of ' + totalCount +
          ' items total';
        $('moreResults').style.display = 'block';
        $('searchCount').style.display = 'block';
      }
      else {
        $('moreResults').style.display = 'none';
        $('searchCount').style.display = 'none';
      }

      if (useFullList || totalCount > 0) {
        rtnBuffer.push('</ul>');
        var rtnStr = rtnBuffer.join('');
      }
      else
        rtnStr = '<ul></ul>';
      return rtnStr;
    },


    /**
     *  Sets the list of items.
     * @param listItems an array of strings to use for the list
     * @param itemCodes an array of codes corresponding to the items in listItems
     */
    setList: function(listItems, itemCodes) {
      //Def.Logger.logMessage(['in setList, listItems = [', listItems.join(', '),
      //                       '] and itemCodes = [', itemCodes.join(', '), ']'])
      //Def.Logger.logMessage(['this.element.id = ',
      //                       this.element.id])
      // Copy the list of options for future reference, and also make a hash
      // of the values for checking whether the field's value matches the list.
      // Also trim the list items before using them.
      // Some values (e.g. the strengths in the drug strength and form field)
      // have padding in front to help with the sorting.  However, once we are
      // putting them into the list, we don't need to sort them further.
      this.listIsOriginal_ = false;
      var numItems = listItems.length;
      this.rawList_ = new Array(numItems);
      for (var r=0, max=listItems.length; r<max; ++r) {
        this.rawList_[r] = listItems[r].trim();
      }

      var displayList = new Array(numItems);
      for (var i=0; i<numItems; ++i) {
        displayList[i] = (this.rawList_[i]).escapeHTML();
        // preprocess option list to add a serial number in the beginning of the
        // each item in the list, except for list headers
        if (this.add_seqnum === true && !this.indexToHeadingLevel_[i]) {
          displayList[i] = this.SEQ_NUM_PREFIX + (i+1)+
            this.SEQ_NUM_SEPARATOR + displayList[i];
        }
      }
      this.options.array = displayList;

      this.itemCodes_ = itemCodes;
      this.itemToCode_ = null; // to be built later

      // Turn off autocomplete listeners  when we don't have a list
      this.enabled_ = listItems.length > 0;

      // Add a class to the field if there is more than 1 item in the list
      // (so that CSS can add a small arrow-shaped background image).
      if (listItems.length > 1)
        this.element.addClassName('ac_multiple');
      else
        this.element.removeClassName('ac_multiple')

      // If the field has focus, call onFocus to re-render and decide what
      // to do about displaying the list.
      if (this.hasFocus || document.activeElement === this.element)
        this.onFocus();
    },


    /**
     *  Sets the field value to a known list value.  No checking is done
     *  on the value; it is assumed that the caller knows it is a valid
     *  list value.
     */
    setFieldToListValue: function(newVal) {
      var field = this.element;
      field.value = newVal;
      this.storeSelectedItem();
      // Set this value as the "unedited value", so that when we send a change
      // event below, the autocompleter does not try to select the value from the
      // list (which can fail if the list is not active, e.g. when the value
      // is being set programattically, as in via selectByCode()).
      this.uneditedValue = field.value;
      // Queue the list selection event before doing further processing,
      // which might trigger other events (i.e. the duplication warning event.)
      this.listSelectionNotification('', true);

      this.setMatchStatusIndicator(true);
      this.setInvalidValIndicator(false);
      this.propagateFieldChanges();

      Element.simulate(field, 'change');
    },


    /**
     *  Sets the list of items.  If there is just one value in the list, the
     *  field value is set to that value too.  If there is more than one value
     *  in the list, the field value is set to blank, because the user should
     *  select a new value if the field now has a new list.
     *
     *  This is invoked when the list is populated based on the value
     *  specified in a different field.  For example, and specifically, the
     *  PHR form has a drug field (e.g. aspirin), and has a field for the
     *  combined strength and form (e.g. 325 MG Tabs).  The list of applicable
     *  strength and form values is not built until the user specifies the
     *  drug.  When that happens, the autocompleter for the drug field
     *  gets and passes the strength and form list to this TablePrefetch
     *  autocompleter.  It's called from the assignDataToFields function -
     *  see Def.Autcompleter.Base.
     *
     * @param listItems an array of strings to use for the list
     * @param itemCodes an array of codes corresponding to the items in listItems
     * @param fieldAlreadySet an optional flag that indicates whether or not
     *  the caller has taken care of updating the field value and its
     *  associated code field.  (Default is FALSE, in which case the field
     *  and code will be updated by this method.)
     * @param pickFirstItem an optional flag that indicates whether or not to set
     *  the field value with the first item in the list, even if the list is
     *  longer than 1.
     */
    setListAndField: function(listItems, itemCodes, fieldAlreadySet,
                              pickFirstItem) {
      if (fieldAlreadySet === undefined)
        fieldAlreadySet = false;

      if (pickFirstItem === undefined)
        pickFirstItem = false;

      this.setList(listItems, itemCodes);

      Def.Autocompleter.Event.notifyObservers(this.element, 'LIST_ASSIGNMENT',
          {});

      // Reset the contents of the field unless the fieldAlreadySet flag
      // is set to false
      var oldValue = this.element.value;
      var lenList = listItems.size();
      var newVal;
      if (fieldAlreadySet === false) {
        if (this.autoFill_ && (lenList === 1 || (lenList > 1 && pickFirstItem)))
          newVal = this.assembleValue(listItems[0]);
        else
          newVal = '';
        // We can set the value directly (rather than through Def.setFieldVal),
        // because the element is always an input field, and we are handling
        // the running of rules, etc., below.
        this.element.value = newVal;
        this.fieldValIsListVal_ = true;
      }


      // If the value changed, update stuff that needs updating.
      if (!fieldAlreadySet && oldValue !== newVal) {
        this.setFieldToListValue(newVal);
      }

      // Clear the no_match and invalid indicators, if they are set.
      // (Presumably, we have corrected the problem by setting the field value.)
      this.setInvalidValIndicator(false);
      this.setMatchStatusIndicator(true);

      if (this.options.afterUpdateElement)
        this.options.afterUpdateElement();
    },


    /**
     *  Used by setListAndField to construct an element value from one of the
     *  list items passed in.
     * @param listItem One of the list items given to setListAndField (or in
     *  the same format.
     * @return the value for the field.
     */
    assembleValue: function(listItem) {
      return listItem.trim();
    },


    /**
     *  Override the observer event function (called after a small delay following
     *  a key stroke) so that the list position gets updated.
     */
    onObserverEvent: function() {
      // First, hide the list so we don't see the list update and then move
      this.temporaryHide_ = true;
      this.hideList();
     // $('searchCount').style.display = 'none';
     // $('searchHint').style.display = 'none';

      // Now call the base class' onObserverEvent
      Autocompleter.Local.prototype.onObserverEvent.apply(this, []);
      this.posAnsList() ;
      this.showList();
      // Dan Clark of Freedom Scientific reported that the search count made
      // the output for JAWS to verbose, so I am commenting out this call.
      // this.readSearchCount();
      this.temporaryHide_ = false;
    },


    /**
     *  Override some of the key event handling.
     * @param event the DOM event object
     */
    autocompKeyPress: function(event) {
      if(this.active) {
        switch(event.keyCode) {
          case Event.KEY_RETURN:
            if (event.ctrlKey) {
              this.handleSeeMoreItems(event);
              Def.Autocompleter.Event.notifyObservers(this.element, 'LIST_EXP',
                {list_expansion_method: 'CtrlRet'});
              event.stopImmediatePropagation();
            }
            else {
              // Only try to select an entry if the index is not -1 (to which
              // it is set when the field first gets the focus).
              if (this.index >= 0) {
                Event.stop(event);
                this.selectEntry();
                if (!this.multiSelect_)
                  this.hide(); // this didn't used to be necessary.
              }
            }
            return;
          case 17: // control, by itself
            break; // ignore it
          case Event.KEY_ESC:
            // Use escape to clear the list highlight
            this.index = -1;
            this.render();
            this.hide();
            this.active = false;
            Event.stop(event);
            return;
          default:
            // Call the base class method
            this.matchListItemsToField_ = true;
            this.onKeyPressWrapper(event);
        }
      }
      else {
         // Call the base class method.  We still require a match to the field
         // content in this case, because if the user selected an item with the
         // mouse, the field will still have focus (though the list will not be
         // active), and the user can keep typing.
         this.matchListItemsToField_ = true;
         this.onKeyPressWrapper(event);
      }
    },


    /**
     *   Calls the base class onkeypress if the control key isn't down.
     */
    onKeyPressWrapper: function(event) {
      // Skip calling the base onkeypress if control key is down, so that the list does not
      // respon to control + arrow.
      if (!event.ctrlKey)
        Autocompleter.Local.prototype.onKeyPress.apply(this, [event]);
    },


    /**
     *  Attempts to find a RecordDataRequester that it can use to retrieve
     *  the list for this autocompleter.  (This method assumes this autocompleter
     *  does not already have a list.)
     *
     *  @param outputFieldID - optional parameter that provides the name of
     *   the field that is to receive the list.  The default is the current
     *   element's id, which is used when this is not supplied.  This is used
     *   in those cases where the output field did/does not exist on the form
     *   and we are getting the list after the field has been created.  The
     *   use case for this is combo fields whose lists are dependent on values
     *   chosen from other (possibly combo) field lists.  An example is the
     *   drug_strength_form "field" on the fetch rule form, whose contents are
     *   dependent on a name_and_route value previously chosen.
     *
     *  @param triggerFieldID - the (also) optional parameter that provides
     *   the name of a field whose current contents are set up as a condition
     *   that later determines whether or not the autocompleter for the current
     *   or output field should be updated when the list being loaded changes.
     *   I know.  That's really convoluted.  I don't know yet how to simplify
     *   it.  lm, 10/2009.
     */
    loadList: function(outputFieldID, triggerFieldID) {

      //    Def.Logger.logMessage(['in pac.loadList, this.element.id = ' ,
      //                           this.element.id, '; outputFieldID = ' ,
      //                           outputFieldID, '; triggerFieldID = ' ,
      //                           triggerFieldID]) ;

      // Set the targetField based on whether or not an outputFieldID was
      // specified
      if (outputFieldID === undefined)
        outputFieldID = this.element.id ;
      var targetField = Def.Autocompleter.getFieldLookupKey(this.element);

      // Now try to get the RecordDataRequester for the output field
      this.listLoadAttempted_ = true;
      var listRdr = Def.RecordDataRequester.getOutputFieldRDR(outputFieldID);

      // If we got a RecordDataRequester, try to re-use the a prior data
      // request's data.  If we don't get anything for that, try to issue a new
      // request.
      if (listRdr) {
        var listData = listRdr.getFieldData(targetField);
        if (listData) {
          // Use setListAndField, because that takes care of running rules, etc.
          this.setListAndField(listData[0], listData[1], true, false);
        }
        else {// maybe the RecordDataRequester hasn't run yet
          listRdr.assignListData();
        }
        // If we passed in an outputFieldID, it means that we're loading a list
        // into an autocompleter whose list comes from the RecordDataRequester
        // of another autocompleter.   Add this field to that
        // RecordDataRequester's list of fields to be updated if the value
        // chosen from its list changes.  That's because if the value chosen
        // from its list changes, it will change the list that the current
        // autocompleter should be using.
        if (outputFieldID !== this.element.id) {
          var triggerField = $(triggerFieldID) ;
          var update_condition = [triggerFieldID, 'EQ',
                                  Def.Autocompleter.getFieldVal(triggerField)] ;
          listRdr.addFieldsToUpdateList(outputFieldID, this, update_condition);
        }
      } // end if we got an rdr
    }, // end loadList


    /**
     *  Returns true if the list is empty.  (May be overridden by a subclass.)
     */
    listIsEmpty: function() {
      return this.options.array.length === 0;
    },


    /**
     *  Returns the initial selection index for the list for when it is
     *  first shown (e.g. on a focus event).  This currently only works
     *  for cases where the number of items in the list does not exceed
     *  MAX_ITEMS_BELOW_FIELD.  (Otherwise, it just returns -1.)
     */
    getInitialSelectionIndex: function() {
      // Set the selection index to -1, so that initially nothing is selected,
      // unless there is a field default and the field is blank, in which case
      // we use the index of the default.
      var index = -1; // default (no selection)
      if (this.element.value == '') {
        if (!this.defaultSelectionIndex_) {
          // Find the default index
          var targetField = Def.Autocompleter.getFieldLookupKey(this.element);
          var defaultVal = this.constructorOpts_.defaultValue;
          if (defaultVal) {
            if (this.itemCodes_) {
              // the default value should be a code
              for (var i=0, max=this.itemCodes_.length; i<max; ++i) {
                if (this.itemCodes_[i]==defaultVal)
                  index = i;
              }
            }
            if (index === -1) {
              // Look for the value in the list itself.
              for (var r=0, maxlen=this.rawList_.length; r<maxlen; ++r) {
                if (this.rawList_[r]==defaultVal)
                  index = r;
              }
            }
          }
          // If the index is less than the number of items we show below
          // the field, use it; otherwise we won't use the default, because we
          // can't show it selected in the list if it isn't visible.
          if (index >= Def.Autocompleter.Base.MAX_ITEMS_BELOW_FIELD*2)
            index = -1;
          this.defaultSelectionIndex_ = index;
        }
        else
          index = this.defaultSelectionIndex_;
      }
      return index;
    },


    /**
     *  A method that gets called when the field gains the focus.
     */
    onFocus: function() {
      // Ignore blur events on the completionOptionsScroller.
      if (Def.Autocompleter.completionOptionsScrollerClicked_ === true) {
        Def.Autocompleter.completionOptionsScrollerClicked_ = false;
      }
      else {
        this.matchListItemsToField_ = false;
        // See if we should try to load the list.  Do not try if this is a combo
        // field, because in that case the field does not get its list from a
        // record data requester (it gets its type changed by it).
        if (!this.listLoadAttempted_ && this.listIsEmpty() &&
                !this.element.comboField) {
          this.loadList();
        }

        if (this.enabled_) {
          this.listBelowField_ = true;
          this.focusInProgress_ = true;
          this.hideList(); // while we reposition
          Def.Autocompleter.Base.prototype.onFocus.apply(this);
          this.element.shakeCanceled = false;

          this.activate();  // determines what is in the list

          this.index = this.getInitialSelectionIndex(); // for field defaults
          // Also put the value at "index" in the field
          if (this.index >= 0) {
            this.selectEntry();
            this.element.select(); // select the text
            // Simulate a change event (e.g. so that rules can run)
            Element.simulate(this.element, 'change');
          }
          this.render();

          //show the list based on following rules.
          var blnShowList = false;
          if (this.add_seqnum == false) {
            //show list if number of choices > 0 and no sequence number added
            if (this.entryCount > 0 ) {
              blnShowList = true;
            }
            //don't show list if number of choices <= 0 and no sequence number added
            else {
              blnShowList = false;
            }
          }
          else {
            //show list if number of choices > 1 and sequence number added
            if (this.entryCount > 1) {
              blnShowList = true;
            }
            //check if the list item value matches seqnum + " - " + field value
            else if (this.entryCount == 1) {
              var value = this.listItemValue(this.update.firstChild.childNodes[0]);

              if (value == this.uneditedValue) {
                blnShowList = false;
              }
              else {
                blnShowList = true;
              }
            }
            else {
              blnShowList = false;
            }
          }

          if (blnShowList == true ) {
            // This sets the top for the initial list displayed
            // when the field first gets focus
            this.posAnsList();
            this.showList();
            this.readSearchCount();
            if (!this.doNotCountHover) {
              // If the mouse happens to be positioned over the list that just
              // appeared, do not count its presence as a "hover" event that would
              // highlight an item in the list.
              this.doNotCountHover = true;

              // Also add a mouse move listener.  If the mouse moves, we want to
              // clear this.doNotCountHover so that the user can select an item.
              Event.observe(document, "mousemove", this.onMouseMoveListener);
            }
          }

          this.focusInProgress_ = false;
        } // if enabled
      }
    },


    /**
     *  Highlight an item in the list, unless doNotCountHover is set.
     */
    onHover: function(event) {
      if (!this.doNotCountHover) {
        Autocompleter.Local.prototype.onHover.apply(this, [event]);
      }
    },


    /**
     *  Puts the focus into the field.
     */
    focusField: function() {
       this.element.focus();
    },

    /**
     *  In response to a mouse movement, this clears the "doNotCountHover"
     *  flag so that the user's mouse over event can be counted.
     */
    onMouseMove: function(event) {
      this.doNotCountHover = false;
      // Also reset this event listener.
      Event.stopObserving(document, "mousemove", this.onMouseMoveListener);
    },


    /**
     *  Returns the value of a list item (minus any sequence number an
     *  separator.)
     * @param li the list item DOM element.
     */
    listItemValue: function(li) {
      var value = li.innerHTML;

      if (this.add_seqnum) {
        // Check to see if browser is IE.
        // All versions of IE convert lower case tag names to upper case - anantha (11/17/09)
        if (Prototype.Browser.IE)
          value = value.replace( "SPAN", "span" );

        var index = value.indexOf(this.SEQ_NUM_SEPARATOR);
        value = value.substring(index + this.SEQ_NUM_SEPARATOR.length);
      }
      return value.stripTags().unescapeHTML();
    },


    /** updateElement. remove the sequence # from the selected item in the list
     *
     */
    updateElement: function(selectedElement) {

      if (this.options.updateElement) {
        this.options.updateElement(selectedElement);
        return;
      }
      // The Scriptaculous autocompleters allow you to autocomplete more than
      // once in a field and select more than one value from the list.  We're
      // not doing that, so we don't do the getTokenBounds() stuff.
      this.element.value = this.listItemValue(selectedElement);
      // Do not use setFieldVal for the above; after this gets called,
      // propagateFieldChanges is called, and that takes care of running
      // change event handlers.

      this.oldElementValue = this.element.value;
      // this.element.focus(); // we no longer want to refocus after a
                               // selection via keyboard

      if (this.options.afterUpdateElement)
        this.options.afterUpdateElement(this.element, selectedElement);
    },


    /**
     *  Returns true if the given key event (from the input field) is a request
     *  for seeing the full list.  We are borrowing the key syntax for running
     *  a search in the search autocompleter, and reusing code (and hence the
     *  function name).
     */
    fieldEventIsSearch: function(event) {
      return event.keyCode===Event.KEY_RETURN && event.ctrlKey;
    },


    /**
     *  This gets called when the "See more items" link is clicked (or when
     *  control + return is pressed, which is another way of making the same
     *  request).
     * @param event the click event on the link
     */
    handleSeeMoreItems: function(event) {
      this.seeMoreItemsClicked_ = true;
      $('searchHint').style.display='none'
      this.listBelowField_ = false;
      this.getUpdatedChoices();
      this.posAnsList() ;
      this.seeMoreItemsClicked_ = false;
      this.splitAutocomp_ = false;
      Event.stop(event);
    },


    /**
     *  Returns the index of the item matching the given code.
     */
    findItemIndexByCode: function(code) {
      // Find the index of the code in the list.
      var codeIndex = null;
      for (var i=0, max=this.itemCodes_.length; i<max && !codeIndex; ++i) {
        if (code == this.itemCodes_[i])
          codeIndex = i;
      }
      return codeIndex;
    },


    /**
     *  Selects an item from the list by its code value.  Both the list field and
     *  the code field are set as a result.
     * @param code the code value for the list item
     */
    selectByCode: function(code) {
      var codeIndex = this.findItemIndexByCode(code);
      if (codeIndex != null) {
        this.setFieldToListValue(this.rawList_[codeIndex]);
     }
    },


    /**
     *  "Reads" the searchCount and moreResults divs via the ScreenReaderLog.
     * @return true if the search count was read.
     */
    readSearchCount: function() {
      var rtn = Def.Autocompleter.Base.prototype.readSearchCount.apply(this);
      if (!rtn && this.entryCount > 0) {
        Def.Autocompleter.screenReaderLog('Showing '+this.entryCount+' of '+
          this.rawList_.length+' items.');
        rtn = true;
      }
      return rtn;
    }

  };  // end Def.Autocompleter.Prefetch class

  Object.extend(Def.Autocompleter.Prefetch.prototype, tmp);
  tmp = null; // prevent other code here from accidentally using it
})($, jQuery, Def);
