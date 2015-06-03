// This file contains auto-completer code for the Data Entry Framework project.

// These autocompleters are based on the Autocompleter.Base class defined
// in the Script.aculo.us controls.js file.

// Patch for IE 9 Bug.  See:
// http://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
Ajax.Request.prototype.respondToReadyState_orig =
  Ajax.Request.prototype.respondToReadyState;
Ajax.Request.prototype.respondToReadyState = function(readyState) {
  // Catch the exception, if there is one.
  try {
    this.respondToReadyState_orig(readyState);
  }
  catch(e) {
    this.dispatchException(e);
  }
};


(function($, jQuery, Def) {
  /**
   *  An Ajax completer that provides list options when the user clicks
   *  on a search button.
   */
  Def.Autocompleter.Search = Class.create();

  // This is the definition for the Search class methods.  We define it in
  // a temporary object to help NetBeans see it.
  var ctmp = {
    /**
     *  A cache for result objects.  The key is the target field field name,
     *  and the value is a cache for that target field name.  (In a repeating
     *  line table, the cache gets shared across rows.)
     */
    fieldToCache_: {},

    /**
     *  The index into the resultCache_ (an instance variable) for the part
     *  of the cache used to store autocompletion results (which are generally
     *  fewer than the search results, which can be up to 500.)
     */
    RESULT_CACHE_AUTOCOMP_RESULTS: 1,

    /**
     *  The index into the resultCache_ (an instance variable) for the part
     *  of the cache used to store search results (which generally have many
     *  more returned hits than the autcompletions results.)
     */
    RESULT_CACHE_SEARCH_RESULTS: 0,

    /**
     *  The maximum number of characters in the field for which we will send
     *  an autocompletion request.  If the field value is longer than this,
     *  we will truncate it when sending the request.
     */
    MAX_VALUE_SIZE_FOR_AUTOCOMP: 25,

    /**
     *  The constructor function.
     */
    constructor: Def.Autocompleter.Search,

    /**
     * The superclass.
     */
    superclass: Def.Autocompleter.Base.prototype,

    /**
     *  If the list items returned by the AJAX search call consist of multiple
     *  strings (fields) each, this is the string used to join together each list
     *  item's fields to produce the list item string the user sees in the list.
     */
    LIST_ITEM_FIELD_SEP: ' - '
  };
  Object.extend(Def.Autocompleter.Search, ctmp);
  ctmp = null;

  Object.extend(Def.Autocompleter.Search.prototype,
    Ajax.Autocompleter.prototype);
  Object.extend(Def.Autocompleter.Search.prototype,
    Def.Autocompleter.Base.prototype);
  Def.Autocompleter.Search.prototype.className = 'Def.Autocompleter.Search' ;

  // This is the definition for the Search instance methods.  We define it in
  // a temporary object to help NetBeans see it.
  var tmp = {
    /**
     *  The pending Ajax request (if any).
     */
    lastAjaxRequest_: null,

    /**
     *  A reference to the search result cache for this autocompleter.  The
     *  results cache is an array of two hashes, where the index is the value of
     *  the "autocomp" parameter in the AJAX request, i.e, the 0th hash is
     *  the hash for the non-autocomp request (e.g. control+return to see
     *  an expanded results list) and the hash at index 1 is the hash for
     *  autocompletion results.  Each hash is a hash from the search string
     *  to the results of the AJAX call.  (Example: resultCache_[1]['pro'] =
     *  the autocompletion results for the string 'pro'.)
     */
    resultCache_: null,

    /**
     *  Whether we are using search result caches in this autocompleter.
     *  It might not be a good idea for all fields, but for now the default
     *  is to use it.
     */
    useResultCache_: true,

    /**
     *  The data for the suggestion list that appears when the user leaves a
     *  non-matching field value in a field for which matching values are not
     *  required.  (This could also be used for suggestions when a matching value
     *  is required, but we would need to change the message the user sees to
     *  handle that case.)
     */
    suggestionList_: null,


    /**
     *  The constructor.  (See Prototype's Class.create method.)
     * @param fieldID the ID of the field for which the list is displayed
     * @param url for getting the completion list.  The website answering the
     *  URL is expected to understand the following parameters:
     *  <ul>
     *    <li>terms - the text from the field.  This should be used to find
     *     matching list items.</li>
     *    <li>autocomp - whether this is an autocompletion event, or a request
     *     for a large list of search results (e.g. by using the "see more" link
     *     on the list).  If autocomp==1, that means this is an autocompletion
     *     request and the server should return a short list (e.g. 7 items) as
     *     quickly as possible.</li>
     *    <li>authenticity_token - (optional) This is an anti-CSRF parameter.
     *     If the page has a value in window._token, it will get sent in this
     *     parameter.</li>
     *    <li>suggest - (optional) User input that does not match a list value
     *     will trigger a request for suggestions that are close to what the
     *     user typed.  A "suggest" parameter value of "1" means the request
     *     is for suggestions.</li>
     *    <li>field_val - When "suggest"==1, this contains the value the user
     *     typed.</li>
     *  </ul>
     *  The URL's response should be an array.  For a non-suggestion request
     *  (suggest != '1'), it should have the following elements:
     *  <ul>
     *    <li>position 0 - the total search result count (including the ones not
     *     returned, if autocomp==1).</li>
     *    <li>position 1 - the list of codes for the list items (if the items are
     *     coded)</li>
     *    <li>position 2 - A hash of extra data about the list items (e.g.
     *     an extra set of codes), or null if there is none.
     *     The keys in the hash should be names for the
     *     data elements, and the values should be an array of values, one for
     *     each returned item.  Configuration for what gets returned here is out
     *     of scope of this class; this search autocompleter just sends the
     *     parameters above.  The extra data for the selected item (when the
     *     user makes a selection) can get be retrieved with
     *     getSelectedItemData().</li>
     *    <li>position 3 - the list item data; each item is an array of display
     *     string fields which will be joined together.  (At a mimimum, each item
     *     should be an array of one string.)</li>
     *    <li>position 4 - if present, this indicates that display strings
     *     (position 3) contain span tags for highlighting matched sub-strings.
     *     (This affects the routine used to sort the strings.)</li>
     *  </ul>
     *  For a suggest request, the response should have the following elements:
     *  <ul>
     *    <li>position 0 - the list of codes for the suggested items (if the
     *     items have codes)</li>
     *    <li>position 1 - the list of display strings (an array of strings, not
     *     of arrays) for the suggested items.</li>
     *    <li>position 2 - A hash of extra data about the list items (the same
     *     as position 2 for the non-suggestion request above.)
     *  </ul>
     * @param options A hash of optional parameters.  The allowed keys and their
     *  values are:
     *  <ul>
     *    <li>matchListValue - Whether the field value is required to be one from
     *     the list (default: false).  When this field is false, for a
     *     non-matching value a dialog will be shown with a list of suggestions
     *     that are on the list.</li>
     *    <li>buttonID - the ID of the button (if there is one)</li>
     *    <li>autocomp - a boolean that controls whether the field should
     *     also autocomplete as the user types.  When this is false, the user
     *     won't see an autocompletion list until they hit return.  (Default:  true)</li>
     *    <li>dataRequester - A RecordDataRequester for getting additional data
     *     after the user makes a selection from the completion list.  This may be
     *     null, in which case no request for additional data is made.</li>
     *    <li>suggestionMode - an integer specifying what type of suggestion
     *     should be offered based on what the user has typed.  For values, see
     *     defAutocompleterBaseInit in autoCompBase.js.
     *    <li>useResultCache - (default: true) Whether or not the results
     *     should be cached.  The same cache is used for all fields that share
     *     the same target_field name.</li>
     *    <li>maxSelect - (default 1) The maximum number of items that can be
     *     selected.  Use '*' for unlimited.</li>
     *    <li>scrolledContainer - the element that should be scrolled to bring
     *     the list into view if it would otherwise extend below the edge of the
     *     window. The default is document.documentElement (i.e. the whole
     *     window).  This may be null if no scrolling is desired (e.g. if the
     *     list field is in a fixed position on the window), but in that
     *     case the list element might be unusually short.
     *     Note:  At present the only tested cases of this parameter are the
     *     default value and null.</li>
     *    <li>nonMatchSuggestions - (default: true) Whether the user should be
     *     given a list of suggestions if they enter a non-matching value.
     *     This only applies when matchListValue is false.</li>
     *  </ul>
     */
    initialize: function(fieldID, url, options) {
      if (!options)
        options = {};

      if (!Def.Autocompleter.Base.classInit_)
        Def.Autocompleter.Base.classInit();

      // Call the Scriptaculous class' initialize method.  We do this via the
      // "apply" function, which lets us specify the "this" object plus an array
      // of arguments to pass in to the method.
      Ajax.Autocompleter.prototype.initialize.apply(this,
       [fieldID, 'completionOptions', url,
       {frequency: 0.01, minChars: 2, partialChars: 2,
        onHide: function(element, update) {
          $('searchCount').style.display = 'none';
          $('moreResults').style.display = 'none';
          Def.Autocompleter.Base.prototype.hideList.apply(this);
        }.bind(this),


        onShow: function(element, update) {
          // Make the search count display before adjusting the list position.
          $('searchCount').style.display='block';
          $('moreResults').style.display = 'block';

          Def.Autocompleter.Base.prototype.showList.apply(this);
        }.bind(this)
      }]);

      this.defAutocompleterBaseInit(options);

      this.autocomp = options['autocomp'];
      if (this.autocomp === undefined)
        this.autocomp = true;  // default
      else if (!this.autocomp) {
        // Disable autocompletion by setting it to run once every year.
        // Note:  This used to be 1000 years, but the Linux version of Firefox
        // was treating such a large timeout value as zero.
        this.options.frequency = 365 * 86400; // seconds
      }

      if (options['useResultCache']!==null && options['useResultCache']===false)
        this.useResultCache_ = false; // default is true-- see declaration

      // Do not use the synchronous request option.  On Windows and Firefox,
      // if you use synchronous, and hit control+enter to run a search, the
      // Firefox Downloads window opens.  I don't know why.  See my post
      // (Paul Lynch) to the Prototype & Scriptaculous Google group, dated
      // 2008/2/5 for a test case.
      // Also, the Prototype library recommends not to use synchronous requests.
      //   this.options.asynchronous = false;

      // Set up event observers.  The "bind" stuff specifies what "this"
      // should be inside the event callbacks.
      Event.observe(fieldID, 'focus', this.onFocus.bind(this));
      // The base class sets up one for a "blur" event.

      var buttonID = options['buttonID'];
      this.buttonID = buttonID;
      // buttonID might be "null", see line 3 of _search_field_autocomp.rhtml.
      if (buttonID && buttonID !== 'null') {
        // We need to use mousedown for the button.  We cannot wait for a
        // mouseup or click event because we have no idea how long that might
        // take, and we need to handle the blur event (which could be the result
        // or a click or of something else.)  Handling the mousedown event
        // also has the nice side-effect of preventing the blur from ever
        // occuring -- though I don't understand why.  (If I comment out the
        // Ajax.Request, the blur event occurs, but if I uncomment that and
        // comment out the onComplete code, it does not.)
        Event.observe(buttonID, 'mousedown', this.buttonClick.bind(this));
        Event.observe(buttonID, 'keypress', this.buttonKeyPress.bind(this));
      }
      this.element.addClassName('search_field');
    },


    /**
     *  Initializes the itemToDataIndex_ map.
     */
    initItemToDataIndex: function() {
      // For the search list, itemToDataIndex_ gets populated when we get an
      // autocompletion list.  However, it needs to have a non-null value for
      // cases where lookups are done for non-matching field values which did
      // not bring back any list (or single-character values when did not
      // trigger an autocompletion event).
      this.itemToDataIndex_ = {};
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
      return new Def.Autocompleter.Search(fieldID, this.url, opts);
    },


    /**
     *  Runs the search (asynchronously).  This gets called when the search
     *  button is clicked.  When the search completes, onComplete
     *  will be called to update the choice list.
     */
    runSearch: function() {
      // Cancel the previous search/AJAX request, if there is one pending.
      // This might free up a thread for the browser, but it does not help
      // the server any.
      if (this.lastAjaxRequest_ && this.lastAjaxRequest_.transport)
        this.lastAjaxRequest_.abort();

      this.searchInProgress = true;
      this.searchStartTime = new Date().getTime();

      // See if the search has been run before.
      var searchStr = this.element.value;
      var results = null;
      if (this.useResultCache_) {
        results = this.getCachedResults(searchStr,
                            Def.Autocompleter.Search.RESULT_CACHE_SEARCH_RESULTS);
        if (results)
          this.onComplete(results, null, true);
      }
      if (!results) { // i.e. if it wasn't cached
        // Run the search
        var paramData = {
          authenticity_token: window._token || '',
          terms: searchStr
        }
        var options = {
          data: paramData,
          complete: this.options.onComplete
        }
        this.changed = false;
        this.hasFocus = true;
        this.lastAjaxRequest_ = jQuery.ajax(this.url, options);
        this.lastAjaxRequest_.requestParamData_ = paramData;
      }
    },


    /**
     *  Returns the cached search results (in the form of an AJAX response object
     *  for a request initiated by runSearch or getUpdatedChoices)
     *  for the given search string, or null if there are no cached results.
     * @param str the search string
     * @param autocomp RESULT_CACHE_AUTOCOMP_RESULTS if the results were for an
     *  autocompletion request (as opposed to a search request, which returns a
     *  much longer list of results), and RESULT_CACHE_SEARCH_RESULTS if they were
     *  for a search request.
     */
    getCachedResults: function(str, autocomp) {
      if (!this.resultCache_) {
        var targetField = Def.Autocompleter.getFieldLookupKey(this.element);
        this.resultCache_ = Def.Autocompleter.Search.fieldToCache_[targetField];
        if (!this.resultCache_) {
          this.resultCache_ = [{}, {}];
          Def.Autocompleter.Search.fieldToCache_[targetField] = this.resultCache_;
        }
      }
      return this.resultCache_[autocomp][str];
    },


    /**
     *  Stores search results for the given search string, for later re-use
     *  via getCachedResults.
     * @param str the search string
     * @param autocomp RESULT_CACHE_AUTOCOMP_RESULTS if the results were for an
     *  autocompletion request (as opposed to a search request, which returns a
     *  much longer list of results), and RESULT_CACHE_SEARCH_RESULTS if they were
     *  for a search request.
     * @param results the AJAX response object for a search initiated by
     *  runSearch or getUpdatedChoices.
     */
    storeCachedResults: function(str, autocomp, results) {
      if (!this.resultCache_) {
        var targetField = Def.Autocompleter.getFieldLookupKey(this.element);
        this.resultCache_ = Def.Autocompleter.Search.fieldToCache_[targetField];
        if (!this.resultCache_) {
          this.resultCache_ = [{}, {}];
          Def.Autocompleter.Search.fieldToCache_[targetField] = this.resultCache_;
        }
      }
      this.resultCache_[autocomp][str] = results;
    },


    /**
     *  Returns true if the given key event (from the input field) is a request
     *  for showing the expanded list.
     * @param event the key event
     */
    fieldEventIsBigList: function(event) {
       return event.keyCode===Event.KEY_RETURN && (event.ctrlKey ||
           (!this.autocomp &&
           this.element.value !== this.uneditedValue &&
           this.element.value.trim() !== ''));
    },


    /**
     *  This gets called when the user presses a key on the search button.
     * @param event the key event
     */
    buttonKeyPress: function(event) {
      if (event.keyCode === Event.KEY_RETURN) {
        this.runSearch();
      }
    },


    /**
     *  Processes a returned set of choices in preparation for building
     *  the HTML for the update (choices) area.
     * @param listItemData the list items received from the AJAX call
     * @param codes the codes for the list items
     * @param highlighting true if highlighting of matches is being used.
     * @return the processed list items, ready for being put into the HTML
     *  (escaped as needed).
     */
    processChoices: function(listItemData, codes, highlighting) {
      var listItems;
      if (highlighting)
        listItems = this.sortHighlightedResults(listItemData);
      else
        listItems = this.sortResults(listItemData);
      return listItems;
    },


    /**
     *  Builds and returns the HTML for the selection area.
     * @param responseData the array of data received from by onComplete.
     */
    buildUpdateHTML: function(responseData) {
      this.itemCodes_ = responseData[1];
      this.listExtraData_ = responseData[2];
      var listItemData = responseData[3];
      var highlighting = responseData[4];
      var listItems = this.processChoices(listItemData, this.itemCodes_, highlighting);
      this.rawList_ = listItems;

      var output;
      if (listItemData.length > 0) {
        output = '<ul><li>' + listItems.join('</li><li>') + '</li></ul>';
      }
      else {
        output = '<ul></ul>';
      }
      return output;
    },


    /**
     *  This gets called when an Ajax request returns.  (See Prototype's
     *  Ajax.Request and callback sections.)
     * @param xhrObj A jQuery-extended XMLHttpRequest object
     * @param textStatus A jQuery text version of the status of the request
     *  (e.g. "success")
     * @param fromCache whether "response" is from the cache (optional).
     */
    onComplete: function(xhrObj, textStatus, fromCache) {
      if (this.lastAjaxRequest_ === xhrObj) {
        this.lastAjaxRequest_ = null;
      }
      if (xhrObj.status === 200) { // 200 is the "OK" status
        var reqParams = xhrObj.requestParamData_;
        var searchStr = reqParams['terms'];
        var autocomp = reqParams['autocomp'];
        var searchAC = Def.Autocompleter.Search;

        if (!fromCache && this.useResultCache_) {
          var resultCacheIndex = autocomp ?
            searchAC.RESULT_CACHE_AUTOCOMP_RESULTS :
            searchAC.RESULT_CACHE_SEARCH_RESULTS;
          this.storeCachedResults(searchStr, resultCacheIndex, xhrObj);
        }

        // The search string is a truncated version of the field value for
        // autocompletion requests.  Compute what the search string would be
        // if it were sent for the current field value.
        var searchStrForFieldVal = autocomp ?
          this.element.value.substr(0, searchAC.MAX_VALUE_SIZE_FOR_AUTOCOMP) :
          this.element.value;

        // If the user is not in the field, don't try to display the returned
        // results.   (Note:  Refocusing does not work well, because it
        // confuses the field validation code which happens on change.)
        // Also, if this response is not for the text that is currently in the
        // field, don't do anything with it.
        if ((this.hasFocus || this.refocusInProgress_) &&
            searchStrForFieldVal === searchStr) {

          // Retrieve the response data, which is in JSON format.
          var responseData = xhrObj.responseJSON || JSON.parse(xhrObj.responseText);
          var totalCount = responseData[0];
          if (totalCount > 0) {
            var shownCount = responseData[3].length;
            var resultStr = shownCount + ' of ' + totalCount + ' total';
            $('searchCount').innerHTML = resultStr;
            $('searchCount').style.display='block';
          }
          this.updateChoices(this.buildUpdateHTML(responseData));

          this.searchInProgress = false;

          var eleOpt = $('completionOptions');

          // Show "see more" link depending on whether this was an autocompletion
          // event and whether there are more items to see.
          if (this.entryCount < totalCount && reqParams['autocomp'])
            $('moreResults').style.display ='block';
          else {
            $('moreResults').style.display ='none';
          }
          // Dan Clark of Freedom Scientific reported that the search count made
          // the output for JAWS too verbose, so I am commenting out this call.
          // this.readSearchCount();

          // Now display the counts and the elapsed time
          var timestamp = new Date();
          // In computing the elapsed time, add the delay from the last keystroke,
          // so the user gets the total time from that point.
          var elapsed_time = timestamp.getTime() - this.searchStartTime +
            this.options.frequency*1000 + '';


          // bytes count of the total response data
          var bytes = xhrObj.responseText.length + '';

          var resultInfo = '; ' + bytes + ' bytes in ' + elapsed_time + ' ms';
          // Add some padding so the string stays roughly the same size
          if (elapsed_time.length < 3)
            resultInfo += '&nbsp;';
          if (bytes.length < 3)
            bytes += '&nbsp;';

          $('searchCount').innerHTML += resultInfo;

          // If the number of list items is too large, use the split area, otherwise
          // put the list below the field.
          this.listBelowField_ = this.entryCount <=
            Def.Autocompleter.Base.MAX_ITEMS_BELOW_FIELD;

          // Now position the answer list.  We would like to do that before, so we
          // could include the position time in the above time measurement, but the
          // time and byte count string can affect the position.
          this.posAnsList();
        }
      }
    },


    /**
     *  Returns a hash of extra data (returned with AJAX autocompletion request)
     *  for a selected list item.
     *  Currently, this assumes that itemText was present in the last list shown
     *  for this field; it subsequent autocompletion requests take place in
     *  which itemText is not present, the return value will be empty.
     * @param itemText the display string of the selected item.
     */
    getItemExtraData: function(itemText) {
      var itemData = {};
      if (this.listExtraData_) {
        var dataIndex = this.itemToDataIndex_[itemText];
        if (dataIndex != null) {  // if it is on the list
          var keys = Object.keys(this.listExtraData_);
          for (var k=0, numKeys = keys.length; k<numKeys; ++k) {
            var key = keys[k];
            itemData[key] = this.listExtraData_[key][dataIndex];
          }
        }
      }
      return itemData;
    },


    /**
     *  Returns a list of sorted search result items based on the returned
     *  data from the AJAX search request.  In the process, it also initializes
     *  this.itemToDataIndex_.  This method assumes that highlighting is
     *  off.  For sorting hightlighted search results, use
     *  sortHightlightedResults.
     * @param listItemData an array of item data arrays (one for each seach
     *  result), in the format returned by the get_search_res_list AJAX call.
     * @param extraData the extra data for each item returned with the
     *  autocompletion AJAX request.  For the format, see "position 2" in the
     *  initialize method's comments.
     */
    sortResults: function(listItemData) {
      var numItems = listItemData.length;
      this.itemToDataIndex_ = {};
      var joinStr = Def.Autocompleter.Search.LIST_ITEM_FIELD_SEP;
      // Filter out already selected items for multi-select lists
      var filteredItems = [];
      for (var i=0; i<numItems; ++i) {
        var item = listItemData[i].join(joinStr);
        this.itemToDataIndex_[item] = i; // unescaped item string
        if (!this.multiSelect_ || !this.isSelected(item)) {
          filteredItems.push(item.escapeHTML());
        }
      }
      var listItems = filteredItems;
      var useStats = this.suggestionMode_ === Def.Autocompleter.USE_STATISTICS;
      if (useStats) {
        // For this kind of suggestion, we want to rely on the statistical
        // ordering of results returned by the server, which provides the
        // statistically best option at the top, so we work to keep this
        // item at the top of the list when sorting.
        var topItem = listItems[0];
        // Set the top item to '', so it will sort to the top of the list.
        // That way, after the sort, we don't have to push it into the top
        // of the list.  (It should be faster this way.)
        listItems[0] = '';
      }
      listItems = listItems.sort(Def.Autocompleter.Base.noCaseSort);
      if (useStats)
        listItems[0] = topItem;
      return listItems;
    },


    /**
     *  Returns a list of sorted search result items based on the returned
     *  data from the AJAX search request.  In the process, it also initializes
     *  this.itemToDataIndex_.  This method assumes that highlighting is
     *  ON.  For sorting unhightlighted search results, use
     *  sortResults.
     * @param listItemData an array of item data arrays (one for each seach
     *  result), in the format returned by the get_search_res_list AJAX call.
     */
    sortHighlightedResults: function(listItemData) {
      var numItems = listItemData.length;
      this.itemToDataIndex_ = {};
      var taglessItems = [];
      var taglessItemToOriginal = {};
      var joinStr = Def.Autocompleter.Search.LIST_ITEM_FIELD_SEP;
      for (var i=0; i<numItems; ++i) {
        var item = listItemData[i].join(joinStr);
        this.itemToDataIndex_[item] = i; // unescaped item string
        item = item.escapeHTML();
        // Decode the span tags, and create a version of the string without
        // the tags so we can sort it.  Also keep a map so that after the
        // sorting we can get back to the original item that has the tags.
        item = item.replace(/&lt;(\/)?span&gt;/g, '<$1span>');
        // Filter out already selected items.
        if (!this.multiSelect_ || !!this.isSelected(item)) {
          var taglessItem = item.replace(/<\/?span>/g, '');
          taglessItemToOriginal[taglessItem] = item;
          taglessItems.push(taglessItem);
        }
      }

      // Sort the "tagless" results.
      var useStats = this.suggestionMode_ === Def.Autocompleter.USE_STATISTICS;
      if (useStats) {
        // (See sortResults for an explanation.)
        var topItem = taglessItems[0];
        taglessItems[0] = '';
      }
      taglessItems = taglessItems.sort(Def.Autocompleter.Base.noCaseSort);
      if (useStats)
        taglessItems[0] = topItem;

      // Now get the original version of the list items (the ones with tags)
      // in the order of the sorted taglessItems array.
      numItems = taglessItems.length; // might have changed due to filtering done above
      var listItems = [];
      for (i=0; i<numItems; ++i)
        listItems.push(taglessItemToOriginal[taglessItems[i]]);

      return listItems;
    },


    /**
     *  This gets called to show the list.
     */
    show: function() {
      // The base class' show only calls onShow if the "update" element
      // has "display: none" set.  Since we are hiding the list container
      // instead, we need to explicitly call onShow here.
      // Only do this if the list is not already being shown.  For some reason,
      // in addition to checking whether the list container's visibility style is
      // "hidden", we also need to check for no value, because (at least in
      // Firefox) it doesn't have a value initially.
      if (this.listContainer.style.visibility === 'hidden'
          || this.listContainer.style.visibility === '') {
        this.options.onShow(this.element, this.update);
      }
    },


    /**
     *  This to hide the list. (e.g. after a selection).
     */
    hide: function() {
      if (!this.searchInProgress) {
        Def.Autocompleter.Search.superclass.hide.apply(this);
      }
    },


    /**
     *  Handles the click on the search button.
     * @param event the event object
     */
    buttonClick: function(event) {
      // If there is a timeout from a key event, clear it.  (The user might have
      // hit one character, and then hit the search button, and if we don't clear
      // it, the timeout will hide the list because the input length is less
      // than the minimum number of characters.
      if (this.observer)
        clearTimeout(this.observer);

      // This runs on mouse down, and we stop the event so the focus never
      // leaves the field.
      this.searchInProgress = true;

      this.runSearch();
      Event.stop(event);
    },


    /**
     *  This gets called when the "See more items" link is clicked.
     * @param event the click event on the link
     */
    handleSeeMoreItems: function(event) {
      this.buttonClick(event);
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
        if (!this.refocusInProgress_) {
          // Hide the list, which might be showing from another autocompleter.
          // (On blur events, autocompleters set a timeout for hiding the list
          // so click events will work, but if the autocompleter isn't the current
          // one when the timeout runs, it doesn't know whether it should really
          // hide the list, so it doesn't.)
          this.hide();

          // Reset rawList_, which might have data from a prior use of the field,
          // and which is used by attemptSelection for list selection observers.
          this.rawList_ = [];
        }

        // The base onFocus resets refocusInProgress_, so we call it after the above
        // check.
        Def.Autocompleter.Base.prototype.onFocus.apply(this);
        this.hasFocus = true;
      }
    },


    /**
     *  This gets called when the field loses focus.
     * @param event the DOM event object
     */
    onBlur: function(event) {
      // Do nothing if we're refocusing the field.
      if (!this.refocusInProgress_ && !Def.Autocompleter.completionOptionsScrollerClicked_) {
        Def.Autocompleter.Base.prototype.onBlur.apply(this, [event]);
        if (!this.searchInProgress) {
          this.active = false;
        }
      }
    },


    /**
     *  Overrides the method in the Scriptaculous superclass to change the
     *  parameters that are posted.
     */
    getUpdatedChoices: function() {
      if (this.lastAjaxRequest_ && this.lastAjaxRequest_.transport)
        this.lastAjaxRequest_.abort();

      this.searchStartTime = new Date().getTime() ;

      var results = null;
      var autocompSearch =  Def.Autocompleter.Search;
      var fieldVal = this.element.value;
      // Truncate fieldVal to some maximum length so we limit the number of
      // autocompletion requests that get generated if a user sets a book on the
      // keyboard.
      if (fieldVal.length > autocompSearch.MAX_VALUE_SIZE_FOR_AUTOCOMP)
        fieldVal = fieldVal.substr(0, autocompSearch.MAX_VALUE_SIZE_FOR_AUTOCOMP);

      if (this.useResultCache_) {
        // See if the search has been run before.
        results = this.getCachedResults(fieldVal,
                                    autocompSearch.RESULT_CACHE_AUTOCOMP_RESULTS);
        if (results)
          this.onComplete(results, null, true);
      }
      if (!results) {
        // Run the search
        var paramData = {
          authenticity_token: window._token || '',
          terms: fieldVal,
          autocomp: 1
        };
        var options = {
          data: paramData,
          dataType: 'json',
          complete: this.options.onComplete
        }
        this.lastAjaxRequest_ = jQuery.ajax(this.url, options);
        this.lastAjaxRequest_.requestParamData_ = paramData;
      }
    },


    /**
     *  Starts an AJAX call to find suggestions for a field value that does
     *  not match the list.
     */
    findSuggestions: function() {
      var paramData = {
        authenticity_token: window._token || '',
        field_val: this.element.value,
        suggest: 1
      };
      var options = {
        data: paramData,
        complete: this.onFindSuggestionComplete.bind(this)
      };
      var suggestionDialog = Def.Autocompleter.SuggestionDialog.getSuggestionDialog();
      suggestionDialog.resetDialog();
      suggestionDialog.show();
      $('suggestionFieldVal').innerHTML = this.element.value.escapeHTML();

      jQuery.ajax(this.url, options);
    },


    /**
     *  Handles the return of the AJAX call started in findSuggestions.
     *  (See Prototype's Ajax.Request and callback sections for a description
     *  of the parameter and how this works.)
     * @param response the jQuery-extended XMLHttpRequest object
     */
    onFindSuggestionComplete: function(response) {
      if (response.status === 200) { // 200 is the "OK" status
        // Retrieve the response data, which is in JSON format.
        var responseData = response.responseJSON || JSON.parse(response.responseText);
        var codes = responseData[0];
        var eventData = [];
        var suggestionDialog = Def.Autocompleter.SuggestionDialog.getSuggestionDialog();
        suggestionDialog.prepareSuggestionDialogForList(this.element);
        var foundMatch = false;
        if (codes.length > 0) {
          // Put up a dialog box with the suggestions, unless one of the
          // suggestions matches what was typed (in which case we just accept
          // that item as the selection).
          var listItems = responseData[1];
          this.suggestionList_ = responseData;
          var lowerCaseFieldVal = this.element.value.toLowerCase();
          var fieldSep = Def.Autocompleter.Search.LIST_ITEM_FIELD_SEP;
          for (var i=0, max=listItems.length; !foundMatch && i<max; ++i) {
            // The suggestion comes as an array (for the different fields that
            // might be displayed).  Fix that, and store it in hopes of
            // helping acceptSuggstion.
            listItems[i] = listItems[i].join(fieldSep);
            if (listItems[i].toLowerCase() === lowerCaseFieldVal) {
              foundMatch = true;
              suggestionDialog.hide();
              if (this.observer)
                clearTimeout(this.observer); // stop the autocompletion
              this.acceptSuggestion(i);
            }
          }
          if (!foundMatch) {
            eventData = listItems;
            suggestionDialog.showSuggestions(listItems, this.element);
          }
        }
        else {
          suggestionDialog.showNotFoundMsg(this.element);
        }
        // Do not notify if we found a match and are not actually showing
        // the suggestion dialog message.
        if (!foundMatch) {
          Def.Autocompleter.Event.notifyObservers(this.element, 'SUGGESTIONS',
            {suggestion_list: eventData});
        }
      }
    },


    /**
     *  Handles the user's request to accept a suggestion as a replacement for
     *  the field value.
     * @param index the index (in the suggestionList_ codes and values)
     *  of the suggestion that was accepted.
     */
    acceptSuggestion: function(index) {
      // We stored the last suggestion list data in suggestionList_.  Look
      // for "code".
      var codes = this.suggestionList_[0];
      var listItems = this.suggestionList_[1];
      var valTyped = this.element.value;
      this.element.value = listItems[index];
      // Mark the field as having a valid value, and reset uneditedValue.
      this.setMatchStatusIndicator(true);
      this.uneditedValue = this.element.value;
      this.fieldValIsListVal_ = true;

      this.propagateFieldChanges();

      Def.Autocompleter.Event.notifyObservers(this.element, 'SUGGESTION_USED',
                                          {suggestion_used: this.element.value});
      // Also send a list selection notification (so that that event can be
      // used as a change event for the field).  Also, the suggestion was from
      // the list.
      this.itemCodes_ = codes; // used by listSelectionNotification
      this.itemToDataIndex_ = {};
      this.itemToDataIndex_[listItems[index]] = index;
      this.listExtraData_ = this.suggestionList_[2];
      this.listSelectionNotification(valTyped, true); // not typed, on list

      // No field is focused at the moment (because of the dialog).
      // Put the focus back into the field we just updated.
      this.element.focus();
    }
  };
  Object.extend(Def.Autocompleter.Search.prototype, tmp);
  tmp = null;
})($, jQuery, Def);
