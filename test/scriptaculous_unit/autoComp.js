// Wrap the code in a function so we can safely redefine $.
(function() {

  var $ = Def.PrototypeAPI.$;

  var fe_strength_and_form_1_autoComp =
   new Def.Autocompleter.Prefetch('fe_strength_and_form_1', [],
     {'matchListValue': false, 'codes': []});

  var fe_other_list_field_autoComp =
   new Def.Autocompleter.Prefetch('fe_other_list_field',
     ['oranges and apples', 'apples', 'pears and (apples)', 'bananas', 'spinach'],
     {'matchListValue': false, 'addSeqNum': false,
      'codes': ['oa', 'a', 'pa', 'b', 's'],
      'dataRequester': new Def.RecordDataRequester($('fe_other_list_field'),
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
       *  Test escape/unescapeAttribute.
       */
      testEscapeAttribute: function() {with(this) {
        var testStr = '&<>"\'';
        var escapedStr = Def.Autocompleter.Base.escapeAttribute(testStr);
        var unescapedStr = Def.Autocompleter.Base.unescapeAttribute(escapedStr);
        assertEqual('&amp;&lt;&gt;&quot;&#39;', escapedStr);
        assertEqual(testStr, unescapedStr);
      }},


      /**
       *  Test getFieldName.
       */
      testGetFieldName: function() {with(this) {
        // For an unlabeled field (which is the default case), the field
        // label should just be "field".
        var otherAutoComp =
          new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
             ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
             {'addSeqNum': false});

        assertEqual('field', otherAutoComp.getFieldName());
      }},


      /**
       *  Test the screen reader log.
       */
      testScreenReaderLog: function() {with(this) {
        // First test the deprected usage.
        Def.ScreenReaderLog.add('one');
        assert($('reader_log').textContent.indexOf('one')>=0, 'deprecated test');
        // Now test the new usage
        var log = new Def.ScreenReaderLog();
        log.add('two');
        assert(log.logElement_.textContent.indexOf('two')>=0, 'current test');
        // Neither log should have the other's input
        assertEqual(-1, $('reader_log').textContent.indexOf('two'),
         'old reader_log has output it should not');
        assertEqual(-1, log.logElement_.textContent.indexOf('one',
         'new log has output it should not'));
      }},


      /**
       *  Tests ARIA markup.
       */
      testAriaMarkup: function() {with(this) {
        var elem = AutoCompTestUtil.createInputElement();
        var otherAutoComp =
          new Def.Autocompleter.Prefetch(elem.id,
             ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
             {'addSeqNum': false});

        assertEqual('combobox', elem.getAttribute('role'));
        otherAutoComp.onFocus();
        otherAutoComp.showList();
        assertEqual('true', elem.getAttribute('aria-expanded'));
        otherAutoComp.hideList();
        assertEqual('false', elem.getAttribute('aria-expanded'));
      }},


      /**
       *  Tests dupItemToDataIndex.
       */
      testDupItemToDataIndex: function() {with(this) {
        var otherAutoComp =
          new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
             ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
             {'addSeqNum': false});

        fe_other_list_field2_autoComp.dupItemToDataIndex(otherAutoComp);
        assertNotNull(otherAutoComp.itemToDataIndex_);

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

        otherAutoComp.dupItemToDataIndex(anotherAC);
        assertNull(anotherAC.itemToDataIndex_);
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
        assertNotNull(dup.itemToDataIndex_);
        assertNotNull(dup.itemToDataIndex_['apples']);

      }},


      /**
       *  Tests pickBestMatch.
       */
      testPickBestMatch: function() {with(this) {
        // Test a case with matches at the beginning.
        var list = ['apples', 'arc', 'one two', 'one three', 'zz'];
        fe_other_list_field_autoComp.update.innerHTML = list;
        fe_other_list_field_autoComp.entryCount = 5;
        fe_other_list_field_autoComp.elemVal=
          fe_other_list_field_autoComp.element.value='a';

        assertEqual(1, fe_other_list_field_autoComp.pickBestMatch(list));
        // Test a case with matches inside
        fe_other_list_field_autoComp.elemVal=
          fe_other_list_field_autoComp.element.value='t';
        assertEqual(2, fe_other_list_field_autoComp.pickBestMatch(list));
        // Test a case with no match (e.g. a match due to a synonym)
        fe_other_list_field_autoComp.elemVal=
         fe_other_list_field_autoComp.element.value='q';
        assertEqual(4, fe_other_list_field_autoComp.pickBestMatch(list));
        // Fix the autocompleter for future tests
        fe_other_list_field_autoComp.elemVal=
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
        assert(jQuery(fe_other_list_field_autoComp.element).hasClass('no_match'));
        fe_other_list_field_autoComp.setMatchStatusIndicator(true);
        assert(!jQuery(fe_other_list_field_autoComp.element).hasClass('no_match'));
      }},


      /**
       *  Tests setInvalidValIndicator.
       */
      testSetInvalidValIndicator: function() {with(this) {
        fe_other_list_field2_autoComp.setInvalidValIndicator(true);
        assert(jQuery(fe_other_list_field2_autoComp.element).hasClass('invalid'));
        fe_other_list_field2_autoComp.setInvalidValIndicator(false);
        assert(!jQuery(fe_other_list_field2_autoComp.element).hasClass('invalid'));
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
        var jqElement = jQuery(fe_other_list_field_autoComp.element);
        assert(jqElement.hasClass('no_match'),
          "fe_other_list_field should have had 'no_match' set");
        assert(!jqElement.hasClass('invalid'),
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
          assert(!jqElement.hasClass('no_match'),
            "fe_other_list_field should NOT have had 'no_match' set");
          assert(!jqElement.hasClass('invalid'),
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
            var jqElem2 = jQuery(fe_other_list_field2_autoComp.element);
            assert(jqElem2.hasClass('invalid'),
              "fe_other_list_field2 should have had 'invalid' set");
             // Test that an empty value is okay.  (No indicators should be set.)
            fe_other_list_field2_autoComp.element.value = '';
            fe_other_list_field2_autoComp.handleNonListEntry();
            assert(!jqElem2.hasClass('invalid'),
              "fe_other_list_field2 should NOT have had 'invalid' set");
          });
        });
      }},


      /**
       *  Tests attemptSelection.
       */
      testAttemptSelection: function() {with(this) {
        // If there are no matches, selection shouldn't happen.
        fe_other_list_field_autoComp.elemVal =
          fe_other_list_field_autoComp.element.value = 'xyz';
        fe_other_list_field_autoComp.matchListItemsToField_ = true;
        fe_other_list_field_autoComp.active = true;
        fe_other_list_field_autoComp.show();
        fe_other_list_field_autoComp.getUpdatedChoices();
        fe_other_list_field_autoComp.attemptSelection();
        assertEqual('xyz', fe_other_list_field_autoComp.element.value);

        // If there is a match, selection should pick the default item.
        fe_other_list_field_autoComp.elemVal =
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
        var jqElem = jQuery(fe_other_list_field_autoComp.element);
        assert(!jqElem.hasClass('no_match'),
          "fe_other_list_field should NOT have had 'no_match' set");
        assert(!jqElem.hasClass('invalid'),
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
        var testField = $('fe_other_list_field');
        var testAC = testField.autocomp;
        testAC.elemVal = testField.value = 'apple';
        testAC.matchListItemsToField_ = true;
        var htmlList = testAC.selector(testAC);

        // Confirm that the list contains the correct values.  There should be 3.
        var vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(3, vals.length, 'first vals list size not as expected');
        var expectedList = ['<strong>apple</strong>s',
                            'oranges and <strong>apple</strong>s',
                            'pears and (<strong>apple</strong>s)'];
        assertEnumEqual(expectedList, vals,
                        'first vals list values not as expected');

        // Confirm that we don't match things like span tags we've inserted
        // (on the JavaScript side) for formatting of list numbers.
        testAC.add_seqnum = true;
        // Reset the list to turn on the numbering
        testAC.setList(testAC.rawList_, testAC.itemCodes_);

        testAC.matchListItemsToField_ = true;
        testAC.elemVal = testField.value = 's';
        htmlList = testAC.selector(testAC);

        // Confirm that the list contains the correct values.  There should be 1.
        vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(1, vals.length, 'second vals list size not as expected');
        var expectedList = [
          '<span class="listNum">5:</span>&nbsp; <strong>s</strong>pinach'];
        assertEnumEqual(expectedList, vals,
                        'second vals list values not as expected');

        // Try picking by number.
        testAC.elemVal = testField.value = '5';
        htmlList = testAC.selector(testAC);
        // Confirm that the list contains the correct values.  There should be 1.
        vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(1, vals.length, 'third vals list size not as expected');
        expectedList = [
          '<span class="listNum"><strong>5</strong>:</span>&nbsp; spinach'];
        assertEnumEqual(expectedList, vals,
                        'third vals list values not as expected');


        // Reset the list back to what it was, for the other tests.
        testAC.add_seqnum = false;

        // Test a large list that has more than the maximum number of items
        // to show.
        testField = $('fe_big_list');
        testAC = testField.autocomp;
        testAC.elemVal = testField.value;
        htmlList = testAC.selector(testAC);
        vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(14, vals.length, 'big list should initially show 14 items');
        // Now let the user hit "see more"
        fe_big_list_autoComp.seeMoreItemsClicked_ = true;
        htmlList = testAC.selector(testAC);
        vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(fe_big_list_autoComp.options.array.length, vals.length,
           'big list should now show all items');
        // Now type something in the field
        testAC.elemVal = testField.value = 'a';
        fe_big_list_autoComp.matchListItemsToField_ = true;
        htmlList = testAC.selector(testAC);
        vals = AutoCompTestUtil.extractListVals(htmlList);
        assertEqual(15, vals.length, 'big list should be showing all 15 matches');
        // Turn the "see more" flag back off
        testAC.seeMoreItemsClicked_ = false;
        htmlList = testAC.selector(testAC);
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
        Def.Event.simulate(headingListComp.element, 'focus');
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
       *  Tests initItemToDataIndex.
       */
      testInitItemToDataIndex: function() {with(this) {
        // Clear the itemToCode_ hash and re-initialize it.
        fe_other_list_field2_autoComp.itemToDataIndex_ = null;
        fe_other_list_field2_autoComp.initItemToDataIndex();
        assertEqual(2,
          fe_other_list_field2_autoComp.itemToDataIndex_['pears and (apples)']);

        // Also test a list that adds sequence numbers to its items
        fe_seq_num_list_autoComp.itemToCode_ = null;
        fe_seq_num_list_autoComp.initItemToDataIndex();
        assertEqual(2,
          fe_seq_num_list_autoComp.itemToDataIndex_['pears and (apples)']);
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
        assertEqual('two', prefetch.getSelectedCodes()[0], 'prefetch');

        // A search autocompleter.
        // Search autocompleters call processChoices prior to constructing
        // the HTML for the update area.  (Unlike prefetch autocompleters, they
        // don't save the choice data, except in itemToCode_.)
        fe_search_test_autoComp.elemVal = '';
        var html = fe_search_test_autoComp.buildUpdateHTML(
          ['1 < 2 - > 0'], false, {'1 < 2 - > 0': ['1 < 2', '> 0']});
        assertEqual('<ul><li>1 &lt; 2 - &gt; 0</li></ul>',
                    html);
        // Also check the table format
        fe_search_test_autoComp.options.tableFormat = true;
        var itemFields = ['1 < 2', '> 0'];
        var itemText = itemFields.join(Def.Autocompleter.LIST_ITEM_FIELD_SEP);
        var textToFields = {};
        textToFields[itemText] = itemFields;
        var html = fe_search_test_autoComp.buildUpdateHTML(
          [itemText], false, textToFields);
        assertEqual('<table><tbody><tr data-fieldval="1 &lt; 2 - &gt; 0">'+
          '<td>1 &lt; 2</td><td>&gt; 0</td></tr></tbody></table>',
                    html);
        fe_search_test_autoComp.options.tableFormat = false; // reset it
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
        var jqElem = jQuery(fe_other_list_field2_autoComp.element);
        assert(jqElem.hasClass('no_match'),
          "Precondition for fe_other_list_field2 (multiple values): should have "+
          "class no_match");
        assert(jqElem.hasClass('invalid'),
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
        assert(!jqElem.hasClass('no_match'),
         "fe_other_list_field2 (multiple values): should NOT have "+
         "class no_match");
        assert(!jqElem.hasClass('invalid'),
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
          assert(jqElem.hasClass('no_match'),
            "Precondition for fe_other_list_field2 (one value): should have "+
            "class no_match");
          assert(jqElem.hasClass('invalid'),
            "Precondition for fe_other_list_field2 (one value): should have "+
            "class invalid");
          $('fe_other_list_field2').value = 'abc - 123';
          fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
          assertEnumEqual(['one'], fe_other_list_field2_autoComp.rawList_);
              assertEnumEqual(['1'], fe_other_list_field2_autoComp.itemCodes_);
              assertEqual('one', $('fe_other_list_field2').value);
              assert(!jqElem.hasClass('no_match'),
                "fe_other_list_field2 (one value): should NOT have "+
                "class no_match");
          assert(!jqElem.hasClass('invalid'),
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
        assertEqual('oa', fe_other_list_field_autoComp.getSelectedCodes()[0]);
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


      /**
       *  Tests storeSelectedItem and getSelectedCodes.
       */
      testGetSelectedCodes: function() {with(this) {
        // Test a multiselect list
        fe_other_list_field_autoComp.multiSelect_ = true;
        fe_other_list_field_autoComp.element.value = 'apples';
        fe_other_list_field_autoComp.storeSelectedItem();
        assertEnumEqual(['a'], fe_other_list_field_autoComp.getSelectedCodes());
        fe_other_list_field_autoComp.element.value = 'bananas';
        fe_other_list_field_autoComp.storeSelectedItem();
        assertEnumEqual(['a', 'b'], fe_other_list_field_autoComp.getSelectedCodes().sort());

        // Test a non-multiselect list
        fe_other_list_field_autoComp.multiSelect_ = false;
        fe_other_list_field_autoComp.element.value = 'apples';
        fe_other_list_field_autoComp.storeSelectedItem();
        assertEnumEqual(['a'], fe_other_list_field_autoComp.getSelectedCodes());
        fe_other_list_field_autoComp.element.value = 'bananas';
        fe_other_list_field_autoComp.storeSelectedItem();
        assertEnumEqual(['b'], fe_other_list_field_autoComp.getSelectedCodes());
      }},


      /**
       *  Tests the matchListValue default.
       */
      testMatchListValue: function() {with(this) {
        var expectedDefaultVal = false; // i.e., don't require a match
        // Create a prefetch autcompleter without a matchListValue setting.
        var list = ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'];
        var codes = ['a', 'oa', 'pa', 'b'];
        var field = AutoCompTestUtil.createInputElement();
        var autoComp = new Def.Autocompleter.Prefetch(field.id,
          list, {'addSeqNum': false, 'codes': codes});
        assertEqual(expectedDefaultVal, autoComp.matchListValue_);

        // Create a search autocompleter without a matchListValue setting.
        var field2 = AutoCompTestUtil.createInputElement();
        var autoComp2 = new Def.Autocompleter.Search(field2.id,
          {'url': '/someURL'});
        assertEqual(expectedDefaultVal, autoComp2.matchListValue_);
      }},


      /**
       *  Tests for multi-select.
       */
      testMultiSelect: function() {with(this) {
        var list = ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'];
        var codes = ['a', 'oa', 'pa', 'b'];
        var field = AutoCompTestUtil.createInputElement();
        var autoComp = new Def.Autocompleter.Prefetch(field.id,
          list, {'addSeqNum': false, 'codes': codes, 'matchListValue': true,
          maxSelect: '*'});

        // Confirm that the autocompleter wrapper is around the field now.
        var fieldWrapper = field.parentNode;
        assertEqual('SPAN', fieldWrapper.tagName);
        assert(jQuery(fieldWrapper).hasClass('autocomp_selected'));

        // Set a field value and see what happens when we select it.
        // Try a value in the list first.
        autoComp.onFocus();
        var listTag = jQuery('#completionOptions ul')[0];
        var listItems = listTag.childNodes;
        assertEqual(4, listItems.length, 'item count before selection');
        field.value = 'apples';
        autoComp.onChange({stopped: true});
        // The value should be moved out of the field and into the selected item area.
        assertEqual('', field.value);
        var selectedItem = jQuery(fieldWrapper).find('li')[0];
        assertEqual('apples', selectedItem.childNodes[1].textContent);
        // The value we just picked should be filtered out of the list that is
        // displayed.
        // (Get listTag again.  I do not understand why, but at this point listTag
        // has no parent; it seems to have been replaced with a new ul in the
        // DOM, though my code is only calling appendChild on it.)
        listTag = jQuery('#completionOptions ul')[0];
        listItems = listTag.childNodes;
        assertEqual(3, listItems.length, 'after selection, too many items in list');
        var foundItem = false;
        for (var i=0; i<3 && !foundItem; ++i)
          foundItem = ('apples' === listItems[i].textContent);
        assert(!foundItem, 'found item in list after selection');
        // The list should still be visible (so the user can pick more items)
        assert(jQuery('#searchResults')[0].style.visibility !== 'hidden');

        // Also select an item by clicking in the list
        Def.Event.simulate(listItems[0], 'mousedown');
        // The value should not be in the field.
        assertEqual('', field.value);
        var selectedItem = jQuery(fieldWrapper).find('li')[1];
        // It should be in the seleted area.
        assert(selectedItem, 'item was not in the selected area');
        assertEqual('oranges and apples', selectedItem.childNodes[1].textContent);
        // The value we just picked should be filtered out of the list that is
        // displayed.
        listTag = jQuery('#completionOptions ul')[0];
        listItems = listTag.childNodes;
        assertEqual(2, listItems.length);
        var foundItem = false;
        for (var i=0; i<listItems.length && !foundItem; ++i)
          foundItem = ('oranges and apples' === listItems[i].textContent);
        assert(!foundItem, 'found item in list after selection, 2');
        // The list should still be visible (so the user can pick more items)
        assert(jQuery('#searchResults')[0].style.visibility !== 'hidden',
          'after click, list is hidden');

        // Unselect the first item
        var selectedItem = fieldWrapper.childNodes[0].childNodes[0];
        assert(selectedItem.parentNode !== null, 'precondition not met');
        var button = selectedItem.childNodes[0];
        jQuery(button).click();
        assert(selectedItem.parentNode === null,
          'selected item not removed from selection area');
        jQuery(autoComp.field).click();
        autoComp.onFocus();
        listItems = jQuery('#completionOptions li');
        assertEqual(3, listItems.length, 'after unselecting item and clicking in field');
        // Make sure the item is back in the list
        var foundItem = false;
        for (var i=0; i<listItems.length && !foundItem; ++i)
          foundItem = ('apples' === listItems[i].textContent);
        assert(foundItem, 'apples not returned to list');
        // Make sure it is not in the selected codes
        assert(!autoComp.getSelectedCodes()['a']);
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
          fe_other_list_field_autoComp.listItemValue(liContainer.firstChild));
        // Test without a sequence number but with an HTML character
        liContainer.innerHTML = '<li>hello &gt;</li>';
        assertEqual('hello >',
          fe_other_list_field_autoComp.listItemValue(liContainer.firstChild));
        // Test with a sequence number and an HTML character
        liContainer.innerHTML =
          '<li><span class="listNum">4:</span>&nbsp; GTE (&gt;=)</li>';
        assertEqual('GTE (>=)',
          fe_seq_num_list_autoComp.listItemValue(liContainer.firstChild));
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
       *  Tests the sorting in the processChoices function.
       */
      testProcessChoices: function() {with(this) {
        var fieldValToItemFields = {'two - one': ['<span>tw</span>o', 'one'],
          'one - one two': ['one', 'one <span>tw</span>o']};
        //fe_search_test_autoComp.elemVal = '';
        var data = fe_search_test_autoComp.processChoices(fieldValToItemFields);
        var expectedList = ['one - one two', 'two - one'];
        assertEnumEqual(data[0], expectedList);
      }}
  };

  new Test.Unit.Runner(testFunctions, "testlog");


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
      var idBase = 'fe_e';
      var idVal = idBase;
      var idCtr = 0;
      while ($(idVal) != null)
        idVal = idBase + ++idCtr;
      rtnEle.setAttribute('id', idVal);
      document.forms[0].appendChild(rtnEle);
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

})();
