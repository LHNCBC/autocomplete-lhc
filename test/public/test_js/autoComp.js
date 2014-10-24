var fe_strength_and_form_1_autoComp =
 new Def.Autocompleter.Prefetch('fe_strength_and_form_1', [],
   {'matchListValue': false, 'codes': []});

var fe_other_list_field_autoComp =
 new Def.Autocompleter.Prefetch('fe_other_list_field',
   ['oranges and apples', 'apples', 'pears and (apples)', 'bananas', 'spinach'],
   {'matchListValue': false, 'addSeqNum': false,
    'codes': ['oa', 'a', 'pa', 'b', 's'], 'dataRequester':
        new Def.RecordDataRequester($('fe_other_list_field'),
         '/someurl', ['fe_record_id'], ['fe_code', 'fe_pseudonym'])});

// A list where a match is required
var fe_other_list_field2_autoComp =
 new Def.Autocompleter.Prefetch('fe_other_list_field2',
   ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
   {'addSeqNum': false, 'codes': ['a', 'oa', 'pa', 'b'],
    'matchListValue': true});

// A prefetch list that has more than the maximum number of items to show
var fe_big_list_autoComp =
 new Def.Autocompleter.Prefetch('fe_big_list',
   ['a one', 'a two', 'a three', 'a four', 'a five', 'a six', 'a seven',
    'a eight', 'a nine', 'a ten', 'a eleven', 'a twelve', 'a thirteen',
    'a fourteen', 'a fifteen', 'sixteen'],
   {'matchListValue': false, 'addSeqNum': false});

// A list that adds sequence numbers
var fe_seq_num_list_autoComp =
 new Def.Autocompleter.Prefetch('fe_seq_num_list',
   ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
   {'codes': ['a', 'oa', 'pa', 'b']});

// A Search autocompleter
var fe_search_test_autoComp = new Def.Autocompleter.Search('fe_search_test',
   {'matchListValue': true, 'url': '/someURL'});

var aspirin_table = [['Caps', '325 MG'].join(' - '),
                       ['Chewable Tabs',' 65 MG'].join(' - '),
                       ['Chewable Tabs', '75 MG'].join(' - '),
                       ['Chewable Tabs', '81 MG'].join(' - '),
                       ['Chewable', '81 MG'].join(' - '),
                       ['Disintegrating Tabs', '81 MG'].join(' - '),
                       ['Tabs', '81 MG'].join(' - '),
                       ['Tabs', '325 MG'].join(' - '),
                       ['Tabs', '800 MG'].join(' - '),
                       ['Tabs', '650 MG'].join(' - '),
                       ['Tabs', '165 MG'].join(' - '),
                       ['Tabs', '300 MG'].join(' - '),
                       ['Tabs', '486 MG'].join(' - '),
                       ['Tabs', '500 MG'].join(' - ')] ;
var fe_strength_and_form_2_autoComp =
  new Def.Autocompleter.Prefetch('fe_strength_and_form_2',
   aspirin_table,
   {'addSeqNum': false, 'matchListValue': true,
    'codes': ['1','2','3','4','5','6','7','8','9','10','11','12','13','14']});

var listSelectionItemData_ = {};
Def.Autocompleter.Event.observeListSelections(null, function(data) {
  listSelectionItemData_ = data;
});

var testFunctions = {

    setup: function() {

    },

    teardown: function() {

    },


    /**
     *  Tests dupItemToCode.
     */
    testDupItemToCode: function() {with(this) {
      var otherAutoComp =
        new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
           ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
           {'addSeqNum': false});

      fe_other_list_field2_autoComp.dupItemToCode(otherAutoComp);
      assertNotNull(otherAutoComp.itemToCode_);

      // If a list isn't the original one, itemToCode should not get copied.
      otherAutoComp =
        new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
           ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
           {'addSeqNum': false});
      otherAutoComp.setList(['one', 'two'], ['1', '2']);
      var anotherAC =
        new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
           ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
           {'addSeqNum': false});

      otherAutoComp.dupItemToCode(anotherAC);
      assertNull(anotherAC.itemToCode_);
    }},


    /**
     *  Tests dupDataReqForField
     */
    testDupDataReqForField: function() {with(this) {
      // The return value should be a RecordDataRequester unless
      // the original autocompleter didn't have one, in which case the return
      // should be null.
      var dup = fe_other_list_field_autoComp.dupDataReqForField(
        AutoCompTestUtil.createInputElement().id);
      assertNotNull(dup);
      dup = fe_other_list_field2_autoComp.dupDataReqForField(
        AutoCompTestUtil.createInputElement().id);
      assertNull(dup);
    }},


    /**
     *  Tests dupForField
     */
    testDupForField: function() {with(this) {
      // Test the prefetch autocompleter
      var dup = fe_other_list_field2_autoComp.dupForField(
        AutoCompTestUtil.createInputElement().id);
      assertNotNull(dup);
      assertNotNull(dup.itemToCode_);
      assertNotNull(dup.itemToCode_['apples']);

    }},


    /**
     *  Tests pickDefaultItem.
     */
    testPickDefaultItem: function() {with(this) {
      // Test a case with matches at the beginning.
      var list = '<ul><li>apples</li><li>arc</li><li>one two</li>'+
       '<li>one three</li><li>zz</li></ul>';
      fe_other_list_field_autoComp.update.innerHTML = list;
      fe_other_list_field_autoComp.entryCount = 5;
      fe_other_list_field_autoComp.element.value='a';
      assertEqual(1, fe_other_list_field_autoComp.pickDefaultItem());
      // Test a case with matches inside
      fe_other_list_field_autoComp.element.value='t';
      assertEqual(2, fe_other_list_field_autoComp.pickDefaultItem());
      // Test a case with no match (e.g. a match due to a synonym)
      fe_other_list_field_autoComp.element.value='q';
      assertEqual(4, fe_other_list_field_autoComp.pickDefaultItem());
      // Fix the autocompleter for future tests
      fe_other_list_field_autoComp.element.value='';
      fe_other_list_field_autoComp.hasFocus = true;
      fe_other_list_field_autoComp.getUpdatedChoices();
    }},


    /**
     *  Tests setMatchStatusIndicator.
     */
    testSetMatchStatusIndicator: function() {with(this) {
      fe_other_list_field_autoComp.setMatchStatusIndicator(false);
      // Currently, this method works by setting a CSS class name on the field.
      // If the implementation changes, this test will need to change.
      assert(fe_other_list_field_autoComp.element.hasClassName('no_match'));
      fe_other_list_field_autoComp.setMatchStatusIndicator(true);
      assert(!fe_other_list_field_autoComp.element.hasClassName('no_match'));
    }},


    /**
     *  Tests setInvalidValIndicator.
     */
    testSetInvalidValIndicator: function() {with(this) {
      fe_other_list_field2_autoComp.setInvalidValIndicator(true);
      assert(fe_other_list_field2_autoComp.element.hasClassName('invalid'));
      fe_other_list_field2_autoComp.setInvalidValIndicator(false);
      assert(!fe_other_list_field2_autoComp.element.hasClassName('invalid'));
    }},


    /**
     *  Tests handleNonListEntry.
     */
    testHandleNonListEntry: function() {with(this) {
      // Test for a field that does not require a match.  For this field,
      // the invalid value indicator should not be set.
      fe_other_list_field_autoComp.element.value = 'carrot';
      $('fe_code').value = 'abc';
      $('fe_pseudonym').value = 'abc';
      fe_other_list_field_autoComp.handleNonListEntry();
      // Check that the indicators are set appropriately.
      assert(fe_other_list_field_autoComp.element.hasClassName('no_match'),
        "fe_other_list_field should have had 'no_match' set");
      assert(!fe_other_list_field_autoComp.element.hasClassName('invalid'),
        "fe_other_list_field should NOT have had 'invalid' set");
      // Check that the code and data_req_output fields are cleared.
      wait(1, function() {
        assertEqual('', $('fe_code').value,
          'Field "fe_code" should have been cleared');
        assertEqual('', $('fe_pseudonym').value,
          'Field "fe_pseudonym" should have been cleared');

        // Test that an empty value is okay.  (No indicators should be set.)
        fe_other_list_field_autoComp.element.value = '';
        $('fe_code').value = 'abc';
        $('fe_pseudonym').value = 'abc';
        fe_other_list_field_autoComp.handleNonListEntry();
        assert(!fe_other_list_field_autoComp.element.hasClassName('no_match'),
          "fe_other_list_field should NOT have had 'no_match' set");
        assert(!fe_other_list_field_autoComp.element.hasClassName('invalid'),
          "fe_other_list_field should NOT have had 'invalid' set");
        // Check that the code and data_req_output fields are cleared.
        wait(1, function() {
          assertEqual('', $('fe_code').value,
            'Field "fe_code" should have been cleared again');
          assertEqual('', $('fe_pseudonym').value,
            'Field "fe_pseudonym" should have been cleared again');

          // Tests for a field that does require a match.  For this field,
          // the invalid value indicator should be set.
          fe_other_list_field2_autoComp.element.value = 'carrot';
          fe_other_list_field2_autoComp.handleNonListEntry();
          assert(fe_other_list_field2_autoComp.element.hasClassName('invalid'),
            "fe_other_list_field2 should have had 'invalid' set");
           // Test that an empty value is okay.  (No indicators should be set.)
          fe_other_list_field2_autoComp.element.value = '';
          fe_other_list_field2_autoComp.handleNonListEntry();
          assert(!fe_other_list_field2_autoComp.element.hasClassName('invalid'),
            "fe_other_list_field2 should NOT have had 'invalid' set");
        });
      });
    }},


    /**
     *  Tests attemptSelection.
     */
    testAttemptSelection: function() {with(this) {
      // If there are no matches, selection shouldn't happen.
      fe_other_list_field_autoComp.element.value = 'xyz';
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      fe_other_list_field_autoComp.active = true;
      fe_other_list_field_autoComp.show();
      fe_other_list_field_autoComp.getUpdatedChoices();
      fe_other_list_field_autoComp.attemptSelection();
      assertEqual('xyz', fe_other_list_field_autoComp.element.value);

      // If there is a match, selection should pick the default item.
      fe_other_list_field_autoComp.element.value = 'ap';
      fe_other_list_field_autoComp.setMatchStatusIndicator(false);
      fe_other_list_field_autoComp.setInvalidValIndicator(true);
      // Set hasFocus so getUpdatedChoices will work
      fe_other_list_field_autoComp.hasFocus = true;
      fe_other_list_field_autoComp.getUpdatedChoices();
      fe_other_list_field_autoComp.index = 0; // pick the first

      fe_other_list_field_autoComp.attemptSelection();
      assertEqual('apples', fe_other_list_field_autoComp.element.value);

      // Also check that the other things that should happen happened.
      assert(!fe_other_list_field_autoComp.element.hasClassName('no_match'),
        "fe_other_list_field should NOT have had 'no_match' set");
      assert(!fe_other_list_field_autoComp.element.hasClassName('invalid'),
        "fe_other_list_field should NOT have had 'invalid' set");
      wait(1, function() {
        assertEqual('a', listSelectionItemData_.item_code,
          'item code should have been set to "a"');
      });
    }},


    /**
     * Test the matching of text in a prefetch list.
     */
    testPrefetchListMatching: function() {with(this) {
      $('fe_other_list_field').value = 'apple';
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      var htmlList = fe_other_list_field_autoComp.selector(
                                                 fe_other_list_field_autoComp);
      // Confirm that the list contains the correct values.  There should be 3.
      var vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(3, vals.size(), 'first vals list size not as expected');
      var expectedList = ['oranges and <strong>apple</strong>s',
                          '<strong>apple</strong>s',
                          'pears and (<strong>apple</strong>s)'];
      assertEnumEqual(expectedList, vals,
                      'first vals list values not as expected');

      // Confirm that we don't match things like span tags we've inserted
      // (on the JavaScript side) for formatting of list numbers.
      fe_other_list_field_autoComp.add_seqnum = true;
      // Reset the list to turn on the numbering
      fe_other_list_field_autoComp.setList(
        fe_other_list_field_autoComp.rawList_,
        fe_other_list_field_autoComp.itemCodes_);

      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      $('fe_other_list_field').value = 's';
      htmlList = fe_other_list_field_autoComp.selector(
                                                 fe_other_list_field_autoComp);
      // Confirm that the list contains the correct values.  There should be 1.
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(1, vals.size(), 'second vals list size not as expected');
      var expectedList = [
        '<span class="listNum">5:</span>&nbsp; <strong>s</strong>pinach'];
      assertEnumEqual(expectedList, vals,
                      'second vals list values not as expected');

      // Try picking by number.
      $('fe_other_list_field').value = '5';
      htmlList = fe_other_list_field_autoComp.selector(
                                                 fe_other_list_field_autoComp);
      // Confirm that the list contains the correct values.  There should be 1.
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(1, vals.size(), 'third vals list size not as expected');
      expectedList = [
        '<span class="listNum"><strong>5</strong>:</span>&nbsp; spinach'];
      assertEnumEqual(expectedList, vals,
                      'third vals list values not as expected');


      // Reset the list back to what it was, for the other tests.
      fe_other_list_field_autoComp.add_seqnum = false;

      // Test a large list that has more than the maximum number of items
      // to show.
      htmlList = fe_big_list_autoComp.selector(fe_big_list_autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(14, vals.length, 'big list should initially show 14 items');
      // Now let the user hit "see more"
      fe_big_list_autoComp.seeMoreItemsClicked_ = true;
      htmlList = fe_big_list_autoComp.selector(fe_big_list_autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(fe_big_list_autoComp.options.array.length, vals.length,
         'big list should now show all items');
      // Now type something in the field
      $('fe_big_list').value = 'a';
      fe_big_list_autoComp.matchListItemsToField_ = true;
      htmlList = fe_big_list_autoComp.selector(fe_big_list_autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(15, vals.length, 'big list should be showing all 15 matches');
      // Turn the "see more" flag back off
      fe_big_list_autoComp.seeMoreItemsClicked_ = false;
      htmlList = fe_big_list_autoComp.selector(fe_big_list_autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(14, vals.length, 'big list should be showing 14 matches');
    }},


    /**
     *  Tests the updateChoices function in autoCompBase.js.
     */
    testUpdateChoices: function() {with(this) {
      // Test the part of updateChoices that decides whether a recommended
      // items should be moved to the top of the list.
      // Lists with headings should not have the default item moved.
      var headingListComp = AutoCompTestUtil.createListWithHeadings();
      Event.simulate(headingListComp.element, 'focus');
      headingListComp.matchListItemsToField_ = true; // would normally be set when the user types
      headingListComp.element.value = 'ca';
      headingListComp.getUpdatedChoices();
      var listVals =
        AutoCompTestUtil.extractListVals(headingListComp.update.innerHTML);
      assertEqual('Food allergies', listVals[0]);
      assertEqual(
        '<span class="listNum">17:</span>&nbsp; Cochineal extract (<strong>Ca</strong>rmine) red dye',
        listVals[1]);

      // For a list without headings, a default should be moved to the top
      // of the list.
      fe_other_list_field_autoComp.element.focus();
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      fe_other_list_field_autoComp.element.value = 'app';
      fe_other_list_field_autoComp.getUpdatedChoices();
      var listVals = AutoCompTestUtil.extractListVals(
        fe_other_list_field_autoComp.update.innerHTML);
      assertEqual('<strong>app</strong>les', listVals[0]);
      assertEqual('oranges and <strong>app</strong>les', listVals[1]);
    }},


    /**
     *  Tests initItemToCode.
     */
    testInitItemToCode: function() {with(this) {
      // Clear the itemToCode_ hash and re-initialize it.
      fe_other_list_field2_autoComp.itemToCode_ = null;
      fe_other_list_field2_autoComp.initItemToCode();
      assertEqual('pa',
        fe_other_list_field2_autoComp.itemToCode_['pears and (apples)']);

      // Also test a list that adds sequence numbers to its items
      fe_seq_num_list_autoComp.itemToCode_ = null;
      fe_seq_num_list_autoComp.initItemToCode();
      assertEqual('pa',
        fe_seq_num_list_autoComp.itemToCode_['pears and (apples)']);
    }},


    /**
     *  Tests the the encoding/escaping of list items.
     */
    testListItemEncoding: function() {with(this) {
      // A prefetch list.
      var prefetch =
        new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
          ['<b>hi</b>'], {'addSeqNum': false, 'codes': ['one']});
      assertEqual('&lt;b&gt;hi&lt;/b&gt;', prefetch.options.array[0],
        'prefetch');
      prefetch.setListAndField(['<i>hi</i>'], ['two']);
      assertEqual('&lt;i&gt;hi&lt;/i&gt;', prefetch.options.array[0],
        'prefetch');
      assertEqual('<i>hi</i>', prefetch.element.value, 'prefetch');
      assertEqual('two', prefetch.getItemCode(), 'prefetch');

      // A search autocompleter.
      // Search autocompleters call processChoices prior to constructing
      // the HTML for the update area.  (Unlike prefetch autocompleters, they
      // don't save the choice data, except in itemToCode_.)
      var processed = fe_search_test_autoComp.processChoices(
                 [['<span><b>hi</b></span>']], ['one'], false);
      assertEqual('&lt;span&gt;&lt;b&gt;hi&lt;/b&gt;&lt;/span&gt;',
                  processed[0]);
      processed = fe_search_test_autoComp.processChoices(
                 [['<span><b>hi</b></span>']], ['one'], true);
      assertEqual('<span>&lt;b&gt;hi&lt;/b&gt;</span>',
                  processed[0]);
    }},


    /**
     *  Tests setListAndField (for Prefetch)
     */
    testSetListAndField: function() {with(this) {
      // Tests with multiple codes and values
      // While we are doing this, we will also test that the invalid and
      // no_match flags get cleared when the list is set.  Additionally, we
      // will check that the code field gets set/cleared.
      fe_other_list_field2_autoComp.setMatchStatusIndicator(false);
      fe_other_list_field2_autoComp.setInvalidValIndicator(true);
      listSelectionItemData_ = {item_code: 'Hi'};  // just putting something there
      assert(fe_other_list_field2_autoComp.element.hasClassName('no_match'),
        "Precondition for fe_other_list_field2 (multiple values): should have "+
        "class no_match");
      assert(fe_other_list_field2_autoComp.element.hasClassName('invalid'),
        "Precondition for fe_other_list_field2 (multiple values): should have "+
        "class invalid");
      $('fe_other_list_field2').value = 'hello';
      fe_other_list_field2_autoComp.setListAndField(['one', 'two'], ['1', '2']);
      assertEnumEqual(['one', 'two'], fe_other_list_field2_autoComp.rawList_);
      assertEnumEqual(['1', '2'], fe_other_list_field2_autoComp.itemCodes_);
      assertEqual('', $('fe_other_list_field2').value,
        'fe_other_list_field2 should have been cleared');
      $('fe_strength_and_form_2').value = 'hello';
      // Match sure the no_match and invalid status has been cleared
      assert(!fe_other_list_field2_autoComp.element.hasClassName('no_match'),
       "fe_other_list_field2 (multiple values): should NOT have "+
       "class no_match");
      assert(!fe_other_list_field2_autoComp.element.hasClassName('invalid'),
       "fe_other_list_field2 (multiple values): should NOT have "+
       "class invalid");
      // Make sure the code field was cleared.
      wait(1, function() {
        assertEqual(undefined, listSelectionItemData_.item_code,
          'item_code should have been cleared');

        // Tests with one code and value
        fe_other_list_field2_autoComp.setMatchStatusIndicator(false);
        fe_other_list_field2_autoComp.setInvalidValIndicator(true);
        listSelectionItemData_.item_code = '';
        assert(fe_other_list_field2_autoComp.element.hasClassName('no_match'),
          "Precondition for fe_other_list_field2 (one value): should have "+
          "class no_match");
        assert(fe_other_list_field2_autoComp.element.hasClassName('invalid'),
          "Precondition for fe_other_list_field2 (one value): should have "+
          "class invalid");
        $('fe_other_list_field2').value = 'abc - 123';
        fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
        assertEnumEqual(['one'], fe_other_list_field2_autoComp.rawList_);
  	    assertEnumEqual(['1'], fe_other_list_field2_autoComp.itemCodes_);
  	    assertEqual('one', $('fe_other_list_field2').value);
  	    assert(!fe_other_list_field2_autoComp.element.hasClassName('no_match'),
  	      "fe_other_list_field2 (one value): should NOT have "+
  	      "class no_match");
        assert(!fe_other_list_field2_autoComp.element.hasClassName('invalid'),
          "fe_other_list_field2 (one value): should NOT have "+
          "class invalid");
        wait(1, function() {
          assertEqual('1', listSelectionItemData_.item_code,
            'item_code should have been set');

          // Test that if autoFill is set to false, the field in not filled in
          // by setListAndField.
          fe_other_list_field2_autoComp.autoFill_ = false;
          fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
          assertEqual('', $('fe_other_list_field2').value);
        });
      });
    }},


    /**
     *  Tests enabling disabling of prefetch (and table prefetch)
     *  autocompleters.
     */
    testDisable: function() {with(this) {
      // Tests for Prefetch
      fe_other_list_field2_autoComp.setListAndField([], []);
      assertEqual(false, fe_other_list_field2_autoComp.enabled_);
      fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
      assertEqual(true, fe_other_list_field2_autoComp.enabled_);
      fe_other_list_field2_autoComp.setListAndField([], []);
      assertEqual(false, fe_other_list_field2_autoComp.enabled_);
    }},


    /**
     *   Tests the selectByCode function in Prefetch.
     */
    testSelectByCode: function() {with(this) {
      fe_other_list_field_autoComp.selectByCode('oa');
      assertEqual('oa', fe_other_list_field_autoComp.getItemCode());
      assertEqual('oranges and apples', $('fe_other_list_field').value);
      wait(1, function() {
        listSelectionItemData_.item_code = '';
        fe_other_list_field_autoComp.selectByCode('a');
        wait(1, function() {
          assertEqual('a', listSelectionItemData_.item_code);
          assertEqual('apples', $('fe_other_list_field').value);
        });
      });
    }},

    // ---------------- Tests for the Prefetch class --------------
    /**
     *  Tests listItemValue.
     */
    testListItemValue: function() {with(this) {
      var liContainer = $('testListItemValue');
      // Test without a sequence number or HTML character.
      liContainer.innerHTML = '<li>hello</li>';
      assertEqual('hello',
        fe_other_list_field_autoComp.listItemValue(liContainer.down()));
      // Test without a sequence number but with an HTML character
      liContainer.innerHTML = '<li>hello &gt;</li>';
      assertEqual('hello >',
        fe_other_list_field_autoComp.listItemValue(liContainer.down()));
      // Test with a sequence number and an HTML character
      liContainer.innerHTML =
        '<li><span class="listNum">4:</span>&nbsp; GTE (&gt;=)</li>';
      assertEqual('GTE (>=)',
        fe_seq_num_list_autoComp.listItemValue(liContainer.down()));
    }},


    /**
     *  Tests which items appear in a list with headings.
     */
    testListWithHeadings: function() {with(this) {
      var autoComp = AutoCompTestUtil.createListWithHeadings();
      autoComp.element.value = '';
      var htmlList = autoComp.selector(autoComp);
      // Confirm that the list contains the correct values.  There should be 12
      // plus 4 headers (16 total);
      var vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(16, vals.length);
      assertEqual(4, autoComp.numHeadings_);
      assertEqual('Food allergies', vals[0]);
      assertEqual('<span class="listNum">1:</span>&nbsp; Chocolate', vals[1]);
      assertEqual('<span class="listNum">2:</span>&nbsp; Crab', vals[2]);
      assertEqual('<span class="listNum">3:</span>&nbsp; Egg', vals[3]);
      assertEqual('Environmental allergies', vals[4]);
      assertEqual('<span class="listNum">20:</span>&nbsp; Cat', vals[5]);

      // Check what happens when the list is expanded
      autoComp.seeMoreItemsClicked_ = true;
      var htmlList = autoComp.selector(autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(139, vals.length); // 135 items + 4 headers
      assertEqual('Food allergies', vals[0]);
      assertEqual('<span class="listNum">1:</span>&nbsp; Chocolate', vals[1]);
      assertEqual('<span class="listNum">2:</span>&nbsp; Crab', vals[2]);
      assertEqual('<span class="listNum">3:</span>&nbsp; Egg', vals[3]);
      assertEqual('<span class="listNum">4:</span>&nbsp; Fish', vals[4]);

      // Try a field value (without "see more")
      autoComp.seeMoreItemsClicked_ = false;
      autoComp.element.value = 'ac';
      autoComp.matchListItemsToField_ = true;
      var htmlList = autoComp.selector(autoComp);
      vals = AutoCompTestUtil.extractListVals(htmlList);
      assertEqual(5, vals.length); // 3 items + 2 headers
      assertEqual('Medication class allergies', vals[0]);
      assertEqual('<span class="listNum">36:</span>&nbsp; <strong>AC</strong>E Inhibitors', vals[1]);
      assertEqual('Medication allergies', vals[2]);
      assertEqual('<span class="listNum">80:</span>&nbsp; DEPAKOTE ER (Valproic <strong>Ac</strong>id)', vals[3]);
      assertEqual('<span class="listNum">126:</span>&nbsp; TYLENOL (<strong>Ac</strong>etaminophen)', vals[4]);
    }},


    // ---------------- Tests for the Search class ---------------------
    /**
     *  Tests the sortResults function.
     */
    testSortResults: function() {with(this) {
      var listItemData = [['two', 'one'], ['one', 'one two']];
      var codes = ['1', '2'];
      var expectedList = ['one - one two', 'two - one'];
      assertEnumEqual(expectedList,
        fe_search_test_autoComp.sortResults(listItemData, codes));

      // Also check the item to code map.
      assertEqual('2', fe_search_test_autoComp.itemToCode_['one - one two']);
      assertEqual('1', fe_search_test_autoComp.itemToCode_['two - one']);
    }},


    /**
     *  Tests the sortHighlightedResults function.
     */
    testSortHighlightedResults: function() {with(this) {
      var listItemData = [['<span>tw</span>o', 'one'],
        ['one', 'one <span>tw</span>o']];
      var codes = ['1', '2'];
      var expectedList = ['one - one <span>tw</span>o',
        '<span>tw</span>o - one'];
      assertEnumEqual(expectedList,
        fe_search_test_autoComp.sortHighlightedResults(listItemData, codes));

      // Also check the item to code map.
      assertEqual('2',
        fe_search_test_autoComp.itemToCode_['one - one <span>tw</span>o']);
      assertEqual('1',
        fe_search_test_autoComp.itemToCode_['<span>tw</span>o - one']);
    }}

};

// new Test.Unit.Runner(testFunctions, "testlog");


/**
 *  Utility methods for the autocompletion tests.
 */
AutoCompTestUtil = {
  /**
   *  Extracts the <li> values (without the tags) from a <ul> list, and
   *  returns them.
   * @param listHTML the HTML for the list
   */
  extractListVals: function(listHTML) {
    var vals = [];
    var re = /<li[^>]*>(.*?)<\/li>/g;
    var matchData;
    while (matchData = re.exec(listHTML)) {
      vals.push(matchData[1]);
    }
    return vals;
  },


  /**
   *  Creates an input element with a unique ID.  The new element will be
   *  added to the page.
   * @return the element
   */
  createInputElement: function() {
    var rtnEle = document.createElement('input');
    rtnEle.setAttribute('type', 'text');
    var id = 'fe_e';
    var idCtr = 1;
    while ($(id) != null)
      id += ++idCtr;
    rtnEle.setAttribute('id', id);
    document.body.appendChild(rtnEle);
    return rtnEle;
  },


  /**
   *  Creates a field with a list with headings.
   * @return the autocompleter for the list.
   */
  createListWithHeadings: function() {
    var element = this.createInputElement();
    var opts = {};
    opts['matchListValue']=false;
    opts['codes']=["26812","FOOD-2","FOOD-22","FOOD-4","FOOD-5","FOOD-7","FOOD-19","FOOD-16","FOOD-9","FOOD-10","FOOD-18","FOOD-12","FOOD-21","FOOD-13","FOOD-14","FOOD-17","FOOD-20","FOOD-22","FOOD-23","FOOD-24","26813","OTHR-18","OTHR-4","OTHR-5","OTHR-17","OTHR-6","OTHR-7","OTHR-1","OTHR-2","OTHR-8","OTHR-9","OTHR-10","OTHR-19","OTHR-11","OTHR-12","OTHR-13","OTHR-3","26814","DRUG-CLASS-1","DRUG-CLASS-2","DRUG-CLASS-3","DRUG-CLASS-4","DRUG-CLASS-5","DRUG-CLASS-6","DRUG-CLASS-7","DRUG-CLASS-8","DRUG-CLASS-9","DRUG-CLASS-10","DRUG-CLASS-11","DRUG-CLASS-12","DRUG-CLASS-13","DRUG-CLASS-14","DRUG-CLASS-15","DRUG-CLASS-16","DRUG-CLASS-24","DRUG-CLASS-17","DRUG-CLASS-18","DRUG-CLASS-19","DRUG-CLASS-20","DRUG-CLASS-21","DRUG-CLASS-22","DRUG-CLASS-23","26815","MED-57","MED-2","MED-97","MED-6","MED-7","MED-8","MED-55","MED-9","MED-10","MED-11","MED-13","MED-16","MED-99","MED-18","MED-19","MED-20","MED-21","MED-22","MED-23","MED-52","MED-88","MED-26","MED-28","MED-29","MED-30","MED-31","MED-32","MED-33","MED-35","MED-37","MED-64","MED-41","MED-42","MED-43","MED-44","MED-45","MED-46","MED-47","MED-48","MED-49","MED-50","MED-51","MED-36","MED-59","MED-98","MED-96","MED-61","MED-62","MED-65","MED-67","MED-68","MED-70","MED-71","MED-53","MED-72","MED-73","MED-74","MED-66","MED-75","MED-77","MED-79","MED-15","MED-82","MED-83","MED-84","MED-85","MED-86","MED-25","MED-87","MED-89","MED-90","MED-91","MED-92","MED-93","MED-94","MED-95"];
    opts['itemToHeading']={"FOOD-2":"26812","FOOD-22":"26812","FOOD-4":"26812","FOOD-5":"26812","FOOD-7":"26812","FOOD-19":"26812","FOOD-16":"26812","FOOD-9":"26812","FOOD-10":"26812","FOOD-18":"26812","FOOD-12":"26812","FOOD-21":"26812","FOOD-13":"26812","FOOD-14":"26812","FOOD-17":"26812","FOOD-20":"26812","FOOD-23":"26812","FOOD-24":"26812","OTHR-18":"26813","OTHR-4":"26813","OTHR-5":"26813","OTHR-17":"26813","OTHR-6":"26813","OTHR-7":"26813","OTHR-1":"26813","OTHR-2":"26813","OTHR-8":"26813","OTHR-9":"26813","OTHR-10":"26813","OTHR-19":"26813","OTHR-11":"26813","OTHR-12":"26813","OTHR-13":"26813","OTHR-3":"26813","DRUG-CLASS-1":"26814","DRUG-CLASS-2":"26814","DRUG-CLASS-3":"26814","DRUG-CLASS-4":"26814","DRUG-CLASS-5":"26814","DRUG-CLASS-6":"26814","DRUG-CLASS-7":"26814","DRUG-CLASS-8":"26814","DRUG-CLASS-9":"26814","DRUG-CLASS-10":"26814","DRUG-CLASS-11":"26814","DRUG-CLASS-12":"26814","DRUG-CLASS-13":"26814","DRUG-CLASS-14":"26814","DRUG-CLASS-15":"26814","DRUG-CLASS-16":"26814","DRUG-CLASS-24":"26814","DRUG-CLASS-17":"26814","DRUG-CLASS-18":"26814","DRUG-CLASS-19":"26814","DRUG-CLASS-20":"26814","DRUG-CLASS-21":"26814","DRUG-CLASS-22":"26814","DRUG-CLASS-23":"26814","MED-57":"26815","MED-2":"26815","MED-97":"26815","MED-6":"26815","MED-7":"26815","MED-8":"26815","MED-55":"26815","MED-9":"26815","MED-10":"26815","MED-11":"26815","MED-13":"26815","MED-16":"26815","MED-99":"26815","MED-18":"26815","MED-19":"26815","MED-20":"26815","MED-21":"26815","MED-22":"26815","MED-23":"26815","MED-52":"26815","MED-88":"26815","MED-26":"26815","MED-28":"26815","MED-29":"26815","MED-30":"26815","MED-31":"26815","MED-32":"26815","MED-33":"26815","MED-35":"26815","MED-37":"26815","MED-64":"26815","MED-41":"26815","MED-42":"26815","MED-43":"26815","MED-44":"26815","MED-45":"26815","MED-46":"26815","MED-47":"26815","MED-48":"26815","MED-49":"26815","MED-50":"26815","MED-51":"26815","MED-36":"26815","MED-59":"26815","MED-98":"26815","MED-96":"26815","MED-61":"26815","MED-62":"26815","MED-65":"26815","MED-67":"26815","MED-68":"26815","MED-70":"26815","MED-71":"26815","MED-53":"26815","MED-72":"26815","MED-73":"26815","MED-74":"26815","MED-66":"26815","MED-75":"26815","MED-77":"26815","MED-79":"26815","MED-15":"26815","MED-82":"26815","MED-83":"26815","MED-84":"26815","MED-85":"26815","MED-86":"26815","MED-25":"26815","MED-87":"26815","MED-89":"26815","MED-90":"26815","MED-91":"26815","MED-92":"26815","MED-93":"26815","MED-94":"26815","MED-95":"26815"};
    opts['suggestionMode']=0;
    opts['autoFill']=true;
    var items = ["Food allergies","Chocolate","Crab","Egg","Fish","Gluten","Milk","Monosodium Glutamate (MSG)","Peanut","Pork","Sesame","Shellfish","Shrimp","Soy","Tomatoes","Tree Nuts","Wheat","Cochineal extract (Carmine) red dye","FD\u0026C Blue No. 1 dye","FD\u0026C Yellow No. 2 dye","Environmental allergies","Cat","Cockroach","Cold Weather","Dog","Dust Mites","Hay Fever","Iodinated x-ray contrast","Latex","Mold","Nickel","Pet Dander","Pollen","Ragweed","Semen","Sun","Wasp, hornet, bee sting","Medication class allergies","ACE Inhibitors","Aminoglycosides","Antihistamines","Benzodiazepines","Beta Blockers","Calcium Channel Blockers","Cephalosporins","Diuretics","H2 Blockers","Insulins","Iodine Containing Medications","Local Anesthetics","Macrolides (like Erythromycin)","Muscle Relaxants, Skeletal","Narcotic Analgesics","Nonsteroidal Anti Inflam. Agents (NSAID)","Penicillin and Derivatives","Phenothiazines","Proton Pump Inhibitors","Quinolone Antibiotics","Serotonin Re-Uptake Inhibitors","Statins","Sulfa Drugs","Tetracycline","Medication allergies","ALEVE (Naproxen)","AMBIEN (Zolpedem)","Amoxicillin","Aspirin (ASA)","ATIVAN (Lorazapam)","ATROVENT (Ipartropium)","AVINZA (Morphine)","Bacitracin","BACTRIM (Sulfamethoxazol/trimethaprim)","BENADRYL (Diphenhydramine )","BUMEX (Bumetanide)","CARDIZEM (Diltizzam)","CEFZIL (Cefprozil)","CIPROFLOXACIN (Cipro)","Codeine","COLACE (Docusate Sodium)","COMPAZINE (Prochlorperazine Maleate)","COUMADIN (Warfarin)","DALMANE (Flurazepam)","DEMEROL (Meperidine)","DEPAKOTE ER (Valproic Acid)","DILANTIN (Phenytoin)","DULCOLAX (Bisacodyl)","E-MYCIN (Erythromycin)","GASTROGRAFIN(Diatrizoate Meglumine)","GLUCOPHAGE (Metformin)","HALCION (Triazolam)","HALDOL (Haloperidol)","HUMALIN (human insulin)","IMDUR (Isosorbide)","ISONIAZID (Isoniazide)","KAYEVELATE (Sodium Polystyrene Sulfonate)","KLONOPIN (Clonazepam)","Lactose","LASIX (Furosemide)","LEVAQUIN (Levofloxacin)","LIBRIUM (Chlordiazepoxide)","Lidocaine, Local","LIPITOR (Atorvastatin)","LOPRESSOR (Metroprolol)","LOVENOX (Enoxaparin)","MELLARIL (Thioridazine)","MOTRIN/ADVIL (Ibuprofen)","NORVASC (Amlodipine)","OMNICEF (Cefdinir)","Penicillin","PEPCID (Famotidine)","PERMITIL (Fluphenazine)","PLAVIX (Clopidogrel)","PREVACID (Lansoprazole)","PROLIXIN (Fluphenazine)","REGLAN (Metoclopramide)","RESTORIL (Temazepam)","ROBAXIN (Methocarbamol)","SENOKOT (Senna)","SERAX (Oxazepam)","SERENTIL (Mesoridazine)","SLOW-K (Potassium)","SOLU MEDROL (Methylprednisolone )","STELAZINE (Trifluoperazine)","SYNTHROID (Thyroxin)","TEGRETOL (Carbamazepine)","THORAZINE (Chlorpromazine)","TOPROL (Metoprolol)","TRANXENE (Clorazepate)","TRILAFON (Perphenazie)","TYLENOL (Acetaminophen)","VALIUM (Diastat)","VALIUM (Diazepam)","VASOTEC (Enalapril)","VITAMIN K1 (Phytonadione)","XANAX (Alprazolam)","ZAROXOLYN (Metolazone)","ZOLOFT (Sertraline)","ZOSYN (Piperacillin/Tazobactam)","ZYPREXA (Olanzapine)"];
    var autoComp = new Def.Autocompleter.Prefetch(element.id, items, opts);
    return autoComp;
  }
};