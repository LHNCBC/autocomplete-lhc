import {TestPages} from '../support/testPages';
import {createInputElement} from '../support/testHelpers';

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
      var otherAutoComp =
        new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
          ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
          {'addSeqNum': false});
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
      assert(-1 === $('reader_log').textContent.indexOf('two'),
        'old reader_log has output it should not');
      assert(-1 === log.logElement_.textContent.indexOf('one',
        'new log has output it should not'));
    });
  });

  it('tests ARIA markup', function () {
    cy.window().then(function (win) {
      var elem = createInputElement(win);
      var otherAutoComp =
        new win.Def.Autocompleter.Prefetch(elem.id,
          ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
          {'addSeqNum': false});
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
      var otherAutoComp =
        new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
          ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
          {'addSeqNum': false});
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      fe_other_list_field2_autoComp.dupItemToDataIndex(otherAutoComp);
      expect(otherAutoComp.itemToDataIndex_).not.to.be.null;

      // If a list isn't the original one, itemToCode should not get copied.
      otherAutoComp =
        new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
          ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
          {'addSeqNum': false});
      otherAutoComp.setList(['one', 'two'], ['1', '2']);
      var anotherAC =
        new win.Def.Autocompleter.Prefetch(createInputElement(win).id,
          ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
          {'addSeqNum': false});
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
      var dup = fe_other_list_field_autoComp.dupDataReqForField(
        createInputElement(win).id);
      expect(dup).not.to.be.null;
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      dup = fe_other_list_field2_autoComp.dupDataReqForField(
        createInputElement(win).id);
      expect(dup).to.be.null;
    });
  });

  it('tests dupForField', function () {
    cy.window().then(function (win) {
      // Test the prefetch autocompleter
      var fe_other_list_field2_autoComp = win.document.getElementById('fe_other_list_field2').autocomp;
      var dup = fe_other_list_field2_autoComp.dupForField(
        createInputElement(win).id);
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
      fe_other_list_field_autoComp.setFieldVal(
        fe_other_list_field_autoComp.trimmedElemVal = 'a', false);
      expect(fe_other_list_field_autoComp.pickBestMatch(list)).to.equal(1);
      // Test a case with matches inside
      fe_other_list_field_autoComp.setFieldVal(
        fe_other_list_field_autoComp.trimmedElemVal = 't', false);
      expect(fe_other_list_field_autoComp.pickBestMatch(list)).to.equal(2);
      // Test a case with no match (e.g. a match due to a synonym)
      fe_other_list_field_autoComp.setFieldVal(
        fe_other_list_field_autoComp.trimmedElemVal = 'q', false);
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
      assert(jqElement.hasClass('no_match'),
        "fe_other_list_field should have had 'no_match' set");
      assert(!jqElement.hasClass('invalid'),
        "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Check that the code and data_req_output fields are cleared.
      assert('' === $('fe_code').value,
        'Field "fe_code" should have been cleared');
      assert('' === $('fe_pseudonym').value,
        'Field "fe_pseudonym" should have been cleared');
      // Test that an empty value is okay.  (No indicators should be set.)
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setFieldVal('', false);
      $('fe_code').value = 'abc';
      $('fe_pseudonym').value = 'abc';
      fe_other_list_field_autoComp.handleNonListEntry();
      var jqElement = win.jQuery(fe_other_list_field_autoComp.element);
      assert(!jqElement.hasClass('no_match'),
        "fe_other_list_field should NOT have had 'no_match' set");
      assert(!jqElement.hasClass('invalid'),
        "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Check that the code and data_req_output fields are cleared.
      assert('' === $('fe_code').value,
        'Field "fe_code" should have been cleared again');
      assert('' === $('fe_pseudonym').value,
        'Field "fe_pseudonym" should have been cleared again');
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
      assert(jqElem2.hasClass('invalid'),
        "fe_other_list_field2 should have had 'invalid' set");
      // Test that an empty value is okay.  (No indicators should be set.)
      fe_other_list_field2_autoComp.setFieldVal('', false);
      fe_other_list_field2_autoComp.handleNonListEntry();
      assert(!jqElem2.hasClass('invalid'),
        "fe_other_list_field2 should NOT have had 'invalid' set");
    });
  });

  it('tests attemptSelection', function () {
    cy.window().then(function (win) {
      // If there are no matches, selection shouldn't happen.
      var fe_other_list_field_autoComp = win.document.getElementById('fe_other_list_field').autocomp;
      fe_other_list_field_autoComp.setFieldVal(
        fe_other_list_field_autoComp.trimmedElemVal = 'xyz', false);
      fe_other_list_field_autoComp.matchListItemsToField_ = true;
      fe_other_list_field_autoComp.active = true;
      fe_other_list_field_autoComp.show();
      fe_other_list_field_autoComp.getUpdatedChoices();
      fe_other_list_field_autoComp.attemptSelection();
      expect(fe_other_list_field_autoComp.element.value).to.equal('xyz');
      // If there is a match, selection should pick the default item.
      fe_other_list_field_autoComp.setFieldVal(
        fe_other_list_field_autoComp.trimmedElemVal = 'ap', false);
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
      assert(!jqElem.hasClass('no_match'),
        "fe_other_list_field should NOT have had 'no_match' set");
      assert(!jqElem.hasClass('invalid'),
        "fe_other_list_field should NOT have had 'invalid' set");
    });
    cy.wait(1);
    cy.window().then(function (win) {
      assert('a' === listSelectionItemData_.item_code,
        'item code should have been set to "a"');
    });
  });

});
