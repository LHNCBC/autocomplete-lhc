import {TestPages} from '../support/testPages';
import {createInputElement, createListWithHeadings, extractListVals} from '../support/testHelpers';

describe('autocompleters', function () {
  var listSelectionItemData_ = {};

  beforeEach(function () {
    cy.visit(TestPages.autocomp_test);
    cy.window().then(function (win) {
      win.Def.Autocompleter.Event.observeListSelections(null, function (data) {
        listSelectionItemData_ = data;
      });
    })
  });

  it('tests escape/unescapeAttribute', function () {
    cy.window().then(function (win) {
      var testStr = '&<>"\'';
      var escapedStr = win.Def.Autocompleter.Base.escapeAttribute(testStr);
      var unescapedStr = win.Def.Autocompleter.Base.unescapeAttribute(escapedStr);
      expect(escapedStr).to.equal('&amp;&lt;&gt;&quot;&#39;');
      expect(unescapedStr).to.equal(testStr);
    });
  });

  it('tests getFieldName', function () {
    // For an unlabeled field (which is the default case), the field
    // label should just be "field".
    cy.window().then(function (win) {
      var otherAutoComp = new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
        ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {'addSeqNum': false});
      expect(otherAutoComp.getFieldName()).to.equal('field');
    });
  });

  it('tests the screen reader log', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // First test the deprected usage.
      win.Def.ScreenReaderLog.add('one');
      assert($('reader_log').textContent.indexOf('one') >= 0, 'deprecated test');
      // Now test the new usage
      var log = new win.Def.ScreenReaderLog();
      log.add('two');
      assert(log.logElement_.textContent.indexOf('two') >= 0, 'current test');
      // Neither log should have the other's input
      assert(-1 === $('reader_log').textContent.indexOf('two'), 'old reader_log has output it should not');
      assert(-1 === log.logElement_.textContent.indexOf('one'), 'new log has output it should not');
    });
  });

  it('tests ARIA markup', function () {
    cy.window().then(function (win) {
      var elem = createInputElement(win);
      var otherAutoComp = new win.Def.Autocompleter.Prefetch(elem.id,
        ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {'addSeqNum': false});
      expect(elem.getAttribute('role')).to.equal('combobox');
      otherAutoComp.onFocus();
      otherAutoComp.showList();
      expect(elem.getAttribute('aria-expanded')).to.equal('true');
      otherAutoComp.hideList();
      expect(elem.getAttribute('aria-expanded')).to.equal('false');
    });
  });

  it('tests dupItemToDataIndex', function () {
    cy.window().then(function (win) {
      var otherAutoComp = new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
        ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {'addSeqNum': false});
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.dupItemToDataIndex(otherAutoComp);
      expect(otherAutoComp.itemToDataIndex_).not.to.be.null;

      // If a list isn't the original one, itemToCode should not get copied.
      otherAutoComp = new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
        ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {'addSeqNum': false});
      otherAutoComp.setList(['one', 'two'], ['1', '2']);
      var anotherAC = new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
        ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {'addSeqNum': false});
      otherAutoComp.dupItemToDataIndex(anotherAC);
      expect(anotherAC.itemToDataIndex_).to.be.null;
    });
  });

  it('tests dupDataReqForField', function () {
    cy.window().then(function (win) {
      // The return value should be a RecordDataRequester unless
      // the original autocompleter didn't have one, in which case the return
      // should be null.
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      var dup = fe_other_list_field_autoComp.dupDataReqForField(createInputElement(win).id);
      expect(dup).not.to.be.null;
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      dup = fe_other_list_field2_autoComp.dupDataReqForField(createInputElement(win).id);
      expect(dup).to.be.null;
    });
  });

  it('tests dupForField', function () {
    cy.window().then(function (win) {
      // Test the prefetch autocompleter
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      var dup = fe_other_list_field2_autoComp.dupForField(createInputElement(win).id);
      expect(dup).not.to.be.null;
      expect(dup.itemToDataIndex_).not.to.be.null;
      expect(dup.itemToDataIndex_['apples']).not.to.be.null;
    });
  });

  it('tests pickBestMatch', function () {
    cy.window().then(function (win) {
      // Test a case with matches at the beginning.
      var list = ['apples', 'arc', 'one two', 'one three', 'zz'];
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.update.innerHTML = list;
      fe_other_list_field_autoComp.entryCount = 5;
      fe_other_list_field_autoComp.setFieldVal(fe_other_list_field_autoComp.trimmedElemVal = 'a', false);
      expect(fe_other_list_field_autoComp.pickBestMatch(list)).to.equal(1);
      // Test a case with matches inside
      fe_other_list_field_autoComp.setFieldVal(fe_other_list_field_autoComp.trimmedElemVal = 't', false);
      expect(fe_other_list_field_autoComp.pickBestMatch(list)).to.equal(2);
      // Test a case with no match (e.g. a match due to a synonym)
      fe_other_list_field_autoComp.setFieldVal(fe_other_list_field_autoComp.trimmedElemVal = 'q', false);
      expect(fe_other_list_field_autoComp.pickBestMatch(list)).to.equal(4);
    });
  });

  it('tests setMatchStatusIndicator', function () {
    cy.window().then(function (win) {
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setMatchStatusIndicator(false);
      // Currently, this method works by setting a CSS class name on the field.
      // If the implementation changes, this test will need to change.
      assert(win.jQuery(fe_other_list_field_autoComp.element).hasClass('no_match'));
      fe_other_list_field_autoComp.setMatchStatusIndicator(true);
      assert(!win.jQuery(fe_other_list_field_autoComp.element).hasClass('no_match'));
    });
  });

  it('tests setInvalidValIndicator', function () {
    cy.window().then(function (win) {
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.setInvalidValIndicator(true);
      assert(win.jQuery(fe_other_list_field2_autoComp.element).hasClass('invalid'));
      fe_other_list_field2_autoComp.setInvalidValIndicator(false);
      assert(!win.jQuery(fe_other_list_field2_autoComp.element).hasClass('invalid'));
    });
  });

  it('tests handleNonListEntry', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Test for a field that does not require a match.  For this field,
      // the invalid value indicator should not be set.
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setFieldVal('carrot', false);
      $('fe_code').value = 'abc';
      $('fe_pseudonym').value = 'abc';
      fe_other_list_field_autoComp.handleNonListEntry();
      // Check that the indicators are set appropriately.
      var jqElement = win.jQuery(fe_other_list_field_autoComp.element);
      assert(jqElement.hasClass('no_match'), "fe_other_list_field should have had 'no_match' set");
      assert(!jqElement.hasClass('invalid'), "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Check that the code and data_req_output fields are cleared.
      assert('' === $('fe_code').value, 'Field "fe_code" should have been cleared');
      assert('' === $('fe_pseudonym').value, 'Field "fe_pseudonym" should have been cleared');
      // Test that an empty value is okay.  (No indicators should be set.)
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setFieldVal('', false);
      $('fe_code').value = 'abc';
      $('fe_pseudonym').value = 'abc';
      fe_other_list_field_autoComp.handleNonListEntry();
      var jqElement = win.jQuery(fe_other_list_field_autoComp.element);
      assert(!jqElement.hasClass('no_match'), "fe_other_list_field should NOT have had 'no_match' set");
      assert(!jqElement.hasClass('invalid'), "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Check that the code and data_req_output fields are cleared.
      assert('' === $('fe_code').value, 'Field "fe_code" should have been cleared again');
      assert('' === $('fe_pseudonym').value, 'Field "fe_pseudonym" should have been cleared again');
      // Tests for a field that does require a match. This field should
      // clear selected item data.
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.storeSelectedItem("apples");
      assert(fe_other_list_field2_autoComp.getSelectedItemData().length === 1,
        "fe_other_list_field2 should have one item stored");
      fe_other_list_field2_autoComp.handleNonListEntry();
      assert(fe_other_list_field2_autoComp.getSelectedItemData() === null,
        "fe_other_list_field2 should clear selected item data");
      // For this field, the invalid value indicator should be set.
      fe_other_list_field2_autoComp.setFieldVal('carrot', false);
      fe_other_list_field2_autoComp.handleNonListEntry();
      var jqElem2 = win.jQuery(fe_other_list_field2_autoComp.element);
      assert(jqElem2.hasClass('invalid'), "fe_other_list_field2 should have had 'invalid' set");
      // Test that an empty value is okay.  (No indicators should be set.)
      fe_other_list_field2_autoComp.setFieldVal('', false);
      fe_other_list_field2_autoComp.handleNonListEntry();
      assert(!jqElem2.hasClass('invalid'), "fe_other_list_field2 should NOT have had 'invalid' set");
    });
  });

  it('tests attemptSelection', function () {
    cy.window().then(function (win) {
      // If there are no matches, selection shouldn't happen.
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setFieldVal(fe_other_list_field_autoComp.trimmedElemVal = 'xyz', false);
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      fe_other_list_field_autoComp.active = true;
      fe_other_list_field_autoComp.show();
      fe_other_list_field_autoComp.getUpdatedChoices();
      fe_other_list_field_autoComp.attemptSelection();
      expect(fe_other_list_field_autoComp.element.value).to.equal('xyz');
      // If there is a match, selection should pick the default item.
      fe_other_list_field_autoComp.setFieldVal(fe_other_list_field_autoComp.trimmedElemVal = 'ap', false);
      fe_other_list_field_autoComp.setMatchStatusIndicator(false);
      fe_other_list_field_autoComp.setInvalidValIndicator(true);
      // Set hasFocus so getUpdatedChoices will work
      fe_other_list_field_autoComp.hasFocus = true;
      fe_other_list_field_autoComp.getUpdatedChoices();
      fe_other_list_field_autoComp.index = 0; // pick the first
      fe_other_list_field_autoComp.attemptSelection();
      expect(fe_other_list_field_autoComp.element.value).to.equal('apples');
      // Also check that the other things that should happen happened.
      var jqElem = win.jQuery(fe_other_list_field_autoComp.element);
      assert(!jqElem.hasClass('no_match'), "fe_other_list_field should NOT have had 'no_match' set");
      assert(!jqElem.hasClass('invalid'), "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      assert('a' === listSelectionItemData_.item_code, 'item code should have been set to "a"');
    });
  });

  it('tests the matching of text in a prefetch list', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      var testField = $('fe_other_list_field');
      var testAC = testField.autocomp;
      testAC.setFieldVal(testAC.trimmedElemVal = 'apple', false);
      testAC.matchListItemsToField_ = true;
      var htmlList = testAC.selector(testAC);
      // Confirm that the list contains the correct values.  There should be 3.
      var vals = extractListVals(htmlList);
      assert(3 === vals.length, 'first vals list size not as expected');
      var expectedList = ['<strong>apple</strong>s',
        'oranges and <strong>apple</strong>s', 'pears and (<strong>apple</strong>s)'];
      expect(vals, 'first vals list values not as expected').to.deep.equal(expectedList);

      // Confirm that we don't match things like span tags we've inserted
      // (on the JavaScript side) for formatting of list numbers.
      testAC.add_seqnum = true;

      // Reset the list to turn on the numbering
      testAC.setList(testAC.rawList_, testAC.itemCodes_);
      testAC.matchListItemsToField_ = true;
      testAC.setFieldVal(testAC.trimmedElemVal = 's', false);
      htmlList = testAC.selector(testAC);

      // Confirm that the list contains the correct values.  There should be 1.
      vals = extractListVals(htmlList);
      assert(1 === vals.length, 'second vals list size not as expected');
      var expectedList = ['<span class="listNum">5:</span>&nbsp; <strong>s</strong>pinach'];
      expect(vals, 'second vals list values not as expected').to.deep.equal(expectedList);

      // Try picking by number.
      testAC.setFieldVal(testAC.trimmedElemVal = '5', false);
      htmlList = testAC.selector(testAC);
      // Confirm that the list contains the correct values.  There should be 1.
      vals = extractListVals(htmlList);
      assert(1 === vals.length, 'third vals list size not as expected');
      expectedList = ['<span class="listNum"><strong>5</strong>:</span>&nbsp; spinach'];
      expect(vals, 'third vals list values not as expected').to.deep.equal(expectedList);


      // Reset the list back to what it was, for the other tests.
      testAC.add_seqnum = false;

      // Test a large list that has more than the maximum number of items
      // to show.
      testField = $('fe_big_list');
      testAC = testField.autocomp;
      testAC.trimmedElemVal = testField.value;
      htmlList = testAC.selector(testAC);
      vals = extractListVals(htmlList);
      assert(14 === vals.length, 'big list should initially show 14 items');
      // Now let the user hit "see more"
      var fe_big_list_autoComp = win.document.getElementById('fe_big_list').autocomp;
      fe_big_list_autoComp.seeMoreItemsClicked_ = true;
      htmlList = testAC.selector(testAC);
      vals = extractListVals(htmlList);
      assert(fe_big_list_autoComp.options.array.length === vals.length,
        'big list should now show all items');
      // Now type something in the field
      testAC.setFieldVal(testAC.trimmedElemVal = 'a', false);
      fe_big_list_autoComp.matchListItemsToField_ = true;
      htmlList = testAC.selector(testAC);
      vals = extractListVals(htmlList);
      assert(15 === vals.length, 'big list should be showing all 15 matches');
      // Turn the "see more" flag back off
      testAC.seeMoreItemsClicked_ = false;
      htmlList = testAC.selector(testAC);
      vals = extractListVals(htmlList);
      assert(14 === vals.length, 'big list should be showing 14 matches');
    });
  });

  it('tests the updateChoices function in autoCompBase.js', function () {
    cy.window().then(function (win) {
      // Test the part of updateChoices that decides whether a recommended
      // items should be moved to the top of the list.
      // Lists with headings should not have the default item moved.
      var headingListComp = createListWithHeadings(win);
      win.Def.Event.simulate(headingListComp.element, 'focus');
      headingListComp.matchListItemsToField_ = true; // would normally be set when the user types
      headingListComp.setFieldVal('ca', false);
      headingListComp.getUpdatedChoices();
      var listVals = extractListVals(headingListComp.update.innerHTML);
      assert('Food allergies' === listVals[0]);
      assert('<span class="listNum">17:</span>&nbsp; Cochineal extract (<strong>Ca</strong>rmine) red dye' === listVals[1]);

      // For a list without headings, a default should be moved to the top
      // of the list.
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.element.focus();
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      fe_other_list_field_autoComp.setFieldVal('app', false);
      fe_other_list_field_autoComp.getUpdatedChoices();
      var listVals = extractListVals(fe_other_list_field_autoComp.update.innerHTML);
      assert('<strong>app</strong>les' === listVals[0]);
      assert('oranges and <strong>app</strong>les' === listVals[1]);
    });
  });

  it('tests initItemToDataIndex', function () {
    cy.window().then(function (win) {
      // Clear the itemToCode_ hash and re-initialize it.
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.itemToDataIndex_ = null;
      fe_other_list_field2_autoComp.initItemToDataIndex();
      assert(2 === fe_other_list_field2_autoComp.itemToDataIndex_['pears and (apples)']);

      // Also test a list that adds sequence numbers to its items
      var fe_seq_num_list_autoComp = win.document.getElementById('fe_seq_num_list').autocomp;
      fe_seq_num_list_autoComp.itemToCode_ = null;
      fe_seq_num_list_autoComp.initItemToDataIndex();
      assert(2 === fe_seq_num_list_autoComp.itemToDataIndex_['pears and (apples)']);
    });
  });

  it('tests the the encoding/escaping of list items', function () {
    cy.window().then(function (win) {
      // A prefetch list.
      var prefetch = new win.Def.Autocompleter.Prefetch(createInputElement(win).id, ['<b>hi</b>'], {
        'addSeqNum': false,
        'codes': ['one']
      });
      assert('&lt;b&gt;hi&lt;/b&gt;' === prefetch.options.array[0], 'prefetch');
      prefetch.setListAndField(['<i>hi</i>'], ['two']);
      assert('&lt;i&gt;hi&lt;/i&gt;' === prefetch.options.array[0], 'prefetch');
      assert('<i>hi</i>' === prefetch.element.value, 'prefetch');
      assert('two' === prefetch.getSelectedCodes()[0], 'prefetch');

      // A search autocompleter.
      // Search autocompleters call processChoices prior to constructing
      // the HTML for the update area.  (Unlike prefetch autocompleters, they
      // don't save the choice data, except in itemToCode_.)
      var fe_search_test_autoComp = win.document.getElementById('fe_search_test').autocomp;
      fe_search_test_autoComp.trimmedElemVal = '';
      var html = fe_search_test_autoComp.buildUpdateHTML(['1 < 2 - > 0'], false, {'1 < 2 - > 0': ['1 < 2', '> 0']});
      assert('<ul><li>1 &lt; 2 - &gt; 0</li></ul>' === html);
      // Also check the table format
      fe_search_test_autoComp.options.tableFormat = true;
      var itemFields = ['1 < 2', '> 0'];
      var itemText = itemFields.join(win.Def.Autocompleter.LIST_ITEM_FIELD_SEP);
      var textToFields = {};
      textToFields[itemText] = itemFields;
      var html = fe_search_test_autoComp.buildUpdateHTML([itemText], false, textToFields);
      assert('<table><tbody><tr data-fieldval="1 &lt; 2 - &gt; 0">' + '<td>1 &lt; 2</td><td>&gt; 0</td></tr></tbody></table>' === html);
      fe_search_test_autoComp.options.tableFormat = false; // reset it
    });
  });

  it('tests setListAndField (for Prefetch)', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Tests with multiple codes and values
      // While we are doing this, we will also test that the invalid and
      // no_match flags get cleared when the list is set.  Additionally, we
      // will check that the code field gets set/cleared.
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.setMatchStatusIndicator(false);
      fe_other_list_field2_autoComp.setInvalidValIndicator(true);
      listSelectionItemData_ = {item_code: 'Hi'};  // just putting something there
      var jqElem = win.jQuery(fe_other_list_field2_autoComp.element);
      assert(jqElem.hasClass('no_match'),
        "Precondition for fe_other_list_field2 (multiple values): should have " + "class no_match");
      assert(jqElem.hasClass('invalid'),
        "Precondition for fe_other_list_field2 (multiple values): should have " + "class invalid");
      $('fe_other_list_field2').autocomp.setFieldVal('hello', false);
      fe_other_list_field2_autoComp.setListAndField(['one', 'two'], ['1', '2']);
      expect(fe_other_list_field2_autoComp.rawList_).to.deep.equal(['one', 'two']);
      expect(fe_other_list_field2_autoComp.itemCodes_).to.deep.equal(['1', '2']);
      assert('' === $('fe_other_list_field2').value, 'fe_other_list_field2 should have been cleared');
      $('fe_strength_and_form_2').autocomp.setFieldVal('hello', false);
      // Match sure the no_match and invalid status has been cleared
      assert(!jqElem.hasClass('no_match'),
        "fe_other_list_field2 (multiple values): should NOT have " + "class no_match");
      assert(!jqElem.hasClass('invalid'),
        "fe_other_list_field2 (multiple values): should NOT have " + "class invalid");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Make sure the code field was cleared.
      assert(!listSelectionItemData_.item_code, 'item_code should have been cleared');

      // Tests with one code and value
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.setMatchStatusIndicator(false);
      fe_other_list_field2_autoComp.setInvalidValIndicator(true);
      listSelectionItemData_.item_code = '';
      var jqElem = win.jQuery(fe_other_list_field2_autoComp.element);
      assert(jqElem.hasClass('no_match'),
        "Precondition for fe_other_list_field2 (one value): should have " + "class no_match");
      assert(jqElem.hasClass('invalid'),
        "Precondition for fe_other_list_field2 (one value): should have " + "class invalid");
      $('fe_other_list_field2').autocomp.setFieldVal('abc - 123', false);
      fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
      expect(fe_other_list_field2_autoComp.rawList_).to.deep.equal(['one']);
      expect(fe_other_list_field2_autoComp.itemCodes_).to.deep.equal(['1']);
      assert('one' === $('fe_other_list_field2').value);
      assert(!jqElem.hasClass('no_match'),
        "fe_other_list_field2 (one value): should NOT have " + "class no_match");
      assert(!jqElem.hasClass('invalid'),
        "fe_other_list_field2 (one value): should NOT have " + "class invalid");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      assert('1' === listSelectionItemData_.item_code, 'item_code should have been set');

      // Test that if autoFill is set to false, the field in not filled in
      // by setListAndField.
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.autoFill_ = false;
      fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
      assert('' === $('fe_other_list_field2').value);
    });
  });

  it('tests enabling disabling of prefetch (and table prefetch) autocompleters', function () {
    cy.window().then(function (win) {
      // Tests for Prefetch
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.setListAndField([], []);
      assert(false === fe_other_list_field2_autoComp.enabled_);
      fe_other_list_field2_autoComp.setListAndField(['one'], ['1']);
      assert(true === fe_other_list_field2_autoComp.enabled_);
      fe_other_list_field2_autoComp.setListAndField([], []);
      assert(false === fe_other_list_field2_autoComp.enabled_);
    });
  });

  it('tests the selectByCode function in Prefetch', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.selectByCode('oa');
      assert('oa' === fe_other_list_field_autoComp.getSelectedCodes()[0]);
      assert('oranges and apples' === $('fe_other_list_field').value);
    });
    cy.wait(1);
    cy.window().then(function (win) {
      listSelectionItemData_.item_code = '';
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.selectByCode('a');
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      assert('a' === listSelectionItemData_.item_code);
      assert('apples' === $('fe_other_list_field').value);
    });
  });

  it('tests storeSelectedItem and getSelectedCodes', function () {
    cy.window().then(function (win) {
      // Test a multiselect list
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.multiSelect_ = true;
      fe_other_list_field_autoComp.setFieldVal('apples', false);
      fe_other_list_field_autoComp.storeSelectedItem();
      expect(fe_other_list_field_autoComp.getSelectedCodes()).to.deep.equal(['a']);
      fe_other_list_field_autoComp.setFieldVal('bananas', false);
      fe_other_list_field_autoComp.storeSelectedItem();
      expect(fe_other_list_field_autoComp.getSelectedCodes().sort()).to.deep.equal(['a', 'b']);

      // Test a non-multiselect list
      fe_other_list_field_autoComp.multiSelect_ = false;
      fe_other_list_field_autoComp.setFieldVal('apples', false);
      fe_other_list_field_autoComp.storeSelectedItem();
      expect(fe_other_list_field_autoComp.getSelectedCodes()).to.deep.equal(['a']);
      fe_other_list_field_autoComp.setFieldVal('bananas', false);
      fe_other_list_field_autoComp.storeSelectedItem();
      expect(fe_other_list_field_autoComp.getSelectedCodes()).to.deep.equal(['b']);
    });
  });

  it('tests the matchListValue default', function () {
    cy.window().then(function (win) {
      var expectedDefaultVal = false; // i.e., don't require a match
      // Create a prefetch autcompleter without a matchListValue setting.
      var list = ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'];
      var codes = ['a', 'oa', 'pa', 'b'];
      var field = createInputElement(win);
      var autoComp = new win.Def.Autocompleter.Prefetch(field.id, list, {'addSeqNum': false, 'codes': codes});
      assert(expectedDefaultVal === autoComp.matchListValue_);

      // Create a search autocompleter without a matchListValue setting.
      var field2 = createInputElement(win);
      var autoComp2 = new win.Def.Autocompleter.Search(field2.id, {'url': '/someURL'});
      assert(expectedDefaultVal === autoComp2.matchListValue_);
    });
  });

  it('tests multi-select', function () {
    cy.window().then(function (win) {
      var list = ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'];
      var codes = ['a', 'oa', 'pa', 'b'];
      var field = createInputElement(win);
      var autoComp = new win.Def.Autocompleter.Prefetch(field.id, list, {
        'addSeqNum': false, 'codes': codes, 'matchListValue': true, maxSelect: '*'
      });

      // Confirm that the autocompleter wrapper is around the field now.
      var fieldWrapper = field.parentNode;
      assert('SPAN' === fieldWrapper.tagName);
      assert(win.jQuery(fieldWrapper).hasClass('autocomp_selected'));

      // Set a field value and see what happens when we select it.
      // Try a value in the list first.
      autoComp.onFocus();
      var listTag = win.jQuery('#completionOptions ul')[0];
      var listItems = listTag.childNodes;
      assert(4 === listItems.length, 'item count before selection');
      autoComp.setFieldVal('apples', false);
      autoComp.onChange({stopped: true});
      // The value should be moved out of the field and into the selected item area.
      assert('' === field.value);
      var selectedItem = win.jQuery(fieldWrapper).find('li')[0];
      assert('apples' === selectedItem.childNodes[1].textContent);
      // The value we just picked should be filtered out of the list that is
      // displayed.
      // (Get listTag again.  I do not understand why, but at this point listTag
      // has no parent; it seems to have been replaced with a new ul in the
      // DOM, though my code is only calling appendChild on it.)
      listTag = win.jQuery('#completionOptions ul')[0];
      listItems = listTag.childNodes;
      assert(3 === listItems.length, 'after selection, too many items in list');
      var foundItem = false;
      for (var i = 0; i < 3 && !foundItem; ++i) foundItem = ('apples' === listItems[i].textContent);
      assert(!foundItem, 'found item in list after selection');
      // The list should still be visible (so the user can pick more items)
      assert(win.jQuery('#searchResults')[0].style.visibility !== 'hidden');

      // Also select an item by clicking in the list
      win.Def.Event.simulate(listItems[0], 'mousedown');
      // The value should not be in the field.
      assert('' === field.value);
      var selectedItem = win.jQuery(fieldWrapper).find('li')[1];
      // It should be in the seleted area.
      assert(selectedItem, 'item was not in the selected area');
      assert('oranges and apples' === selectedItem.childNodes[1].textContent);
      // The value we just picked should be filtered out of the list that is
      // displayed.
      listTag = win.jQuery('#completionOptions ul')[0];
      listItems = listTag.childNodes;
      assert(2 === listItems.length);
      var foundItem = false;
      for (var i = 0; i < listItems.length && !foundItem; ++i)
        foundItem = ('oranges and apples' === listItems[i].textContent);
      assert(!foundItem, 'found item in list after selection, 2');
      // The list should still be visible (so the user can pick more items)
      assert(win.jQuery('#searchResults')[0].style.visibility !== 'hidden',
        'after click, list is hidden');

      // Unselect the first item
      var selectedItem = fieldWrapper.childNodes[0].childNodes[0];
      assert(selectedItem.parentNode !== null, 'precondition not met');
      var button = selectedItem.childNodes[0];
      win.jQuery(button).click();
      assert(selectedItem.parentNode === null, 'selected item not removed from selection area');
      win.jQuery(autoComp.field).click();
      autoComp.onFocus();
      listItems = win.jQuery('#completionOptions li');
      assert(3 === listItems.length, 'after unselecting item and clicking in field');
      // Make sure the item is back in the list
      var foundItem = false;
      for (var i = 0; i < listItems.length && !foundItem; ++i) foundItem = ('apples' === listItems[i].textContent);
      assert(foundItem, 'apples not returned to list');
      // Make sure it is not in the selected codes
      assert(!autoComp.getSelectedCodes()['a']);
    });
  });

  // ---------------- Tests for the Prefetch class --------------
  it('tests which items appear in a list with headings', function () {
    cy.window().then(function (win) {
      var autoComp = createListWithHeadings(win);
      autoComp.setFieldVal('', false);
      var htmlList = autoComp.selector(autoComp);
      // Confirm that the list contains the correct values.  There should be 12
      // plus 4 headers (16 total);
      var vals = extractListVals(htmlList);
      assert(16 === vals.length);
      assert(4 === autoComp.numHeadings_);
      assert('Food allergies' === vals[0]);
      assert('<span class="listNum">1:</span>&nbsp; Chocolate' === vals[1]);
      assert('<span class="listNum">2:</span>&nbsp; Crab' === vals[2]);
      assert('<span class="listNum">3:</span>&nbsp; Egg' === vals[3]);
      assert('Environmental allergies' === vals[4]);
      assert('<span class="listNum">20:</span>&nbsp; Cat' === vals[5]);

      // Check what happens when the list is expanded
      autoComp.seeMoreItemsClicked_ = true;
      var htmlList = autoComp.selector(autoComp);
      vals = extractListVals(htmlList);
      assert(139 === vals.length); // 135 items + 4 headers
      assert('Food allergies' === vals[0]);
      assert('<span class="listNum">1:</span>&nbsp; Chocolate' === vals[1]);
      assert('<span class="listNum">2:</span>&nbsp; Crab' === vals[2]);
      assert('<span class="listNum">3:</span>&nbsp; Egg' === vals[3]);
      assert('<span class="listNum">4:</span>&nbsp; Fish' === vals[4]);

      // Try a field value (without "see more")
      autoComp.seeMoreItemsClicked_ = false;
      autoComp.setFieldVal('ac', false);
      autoComp.matchListItemsToField_ = true;
      var htmlList = autoComp.selector(autoComp);
      vals = extractListVals(htmlList);
      assert(5 === vals.length); // 3 items + 2 headers
      assert('Medication class allergies' === vals[0]);
      assert('<span class="listNum">36:</span>&nbsp; <strong>AC</strong>E Inhibitors' === vals[1]);
      assert('Medication allergies' === vals[2]);
      assert('<span class="listNum">80:</span>&nbsp; DEPAKOTE ER (Valproic <strong>Ac</strong>id)' === vals[3]);
      assert('<span class="listNum">126:</span>&nbsp; TYLENOL (<strong>Ac</strong>etaminophen)' === vals[4]);
    });
  });

  it('tests isListHTML option', function () {
    cy.window().then(function (win) {
      var list = ['apples and bananas', 'oranges', 'pears', 'bananas'];
      var formattedListItems = [' <span style="color: blue;">(big red apples)</span>', '', '', ''];
      var elem = createInputElement(win);
      var otherAutoComp = new win.Def.Autocompleter.Prefetch(elem.id, list, {
        'addSeqNum': false,
        'formattedListItems': formattedListItems
      });

      otherAutoComp.onFocus();
      var listItems = win.jQuery('#completionOptions li');
      assert(4 === listItems.length);
      assert("apples and bananas <span style=\"color: blue;\">(big red apples)</span>" === listItems[0].innerHTML);

      // should not search on HTML tag
      otherAutoComp.setFieldVal('span');
      otherAutoComp.matchListItemsToField_ = true;
      var htmlList = otherAutoComp.selector(otherAutoComp);
      var vals = extractListVals(htmlList);
      assert(0 === vals.length);

      // should filter based on list value
      otherAutoComp.setFieldVal('app');
      otherAutoComp.matchListItemsToField_ = true;
      htmlList = otherAutoComp.selector(otherAutoComp);
      vals = extractListVals(htmlList);
      assert(1 === vals.length);
      assert("<strong>app</strong>les and bananas <span style=\"color: blue;\">(big red apples)</span>" === vals[0]);

      // should not search on text in formattedListItems
      otherAutoComp.setFieldVal('big');
      otherAutoComp.matchListItemsToField_ = true;
      htmlList = otherAutoComp.selector(otherAutoComp);
      vals = extractListVals(htmlList);
      assert(0 === vals.length);

      // should pick the suggested value with attemptSelection()
      otherAutoComp.setFieldVal(otherAutoComp.trimmedElemVal = 'bana', false);
      otherAutoComp.setMatchStatusIndicator(false);
      otherAutoComp.setInvalidValIndicator(true);
      // Set hasFocus so getUpdatedChoices will work
      otherAutoComp.hasFocus = true;
      otherAutoComp.getUpdatedChoices();
      otherAutoComp.index = 0; // pick the first
      otherAutoComp.attemptSelection();
      assert('bananas' === otherAutoComp.element.value);
    });
  });

  // ---------------- Tests for the Search class ---------------------
  it('tests the sorting in the processChoices function', function () {
    cy.window().then(function (win) {
      var fieldValToItemFields = {
        'two - one': ['<span>tw</span>o', 'one'], 'one - one two': ['one', 'one <span>tw</span>o']
      };
      var fe_search_test_autoComp = win.document.getElementById('fe_search_test').autocomp;
      fe_search_test_autoComp.trimmedElemVal = '';
      var data = fe_search_test_autoComp.processChoices(fieldValToItemFields);
      var expectedList = ['one - one two', 'two - one'];
      expect(data[0]).to.deep.equal(expectedList);
    });
  });

});
