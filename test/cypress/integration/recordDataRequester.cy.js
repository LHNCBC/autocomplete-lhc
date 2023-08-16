import {TestPages} from '../support/testPages';

describe('recordDataRequester', function () {
  beforeEach(function () {
    cy.visit(TestPages.recordDataRequester_test);
  });

  it('tests the initialization of the input/outputFieldsHash_', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      var dataReq = new win.Def.RecordDataRequester($('fe_trigger_field_1'), '/someurl', ['record_id'], ['code', 'pseudonym'], true);
      // Check that the fields hash has not been initialized yet.
      expect(dataReq.inputFieldsHash_).to.be.null;
      expect(dataReq.outputFieldsHash_).to.be.null;
      dataReq.initFieldsHash();
      // Check that it has been intiailized
      assert(1 === Object.keys(dataReq.inputFieldsHash_).length);
      assert(2 === Object.keys(dataReq.outputFieldsHash_).length);
      expect(dataReq.inputFieldsHash_['record_id']).not.to.be.null;
      expect(dataReq.outputFieldsHash_['code']).not.to.be.null;
      expect(dataReq.outputFieldsHash_['pseudonym']).not.to.be.null;

      // Check that the dataReqInput parameter can be null.
      dataReq = new win.Def.RecordDataRequester($('fe_trigger_field_1'), '/someurl', null, ['code', 'pseudonym'], true);
      dataReq.initFieldsHash();
      // Check that it has been initialized
      assert(0 === Object.keys(dataReq.inputFieldsHash_).length);
      assert(2 === Object.keys(dataReq.outputFieldsHash_).length);
    });
  });

  it('tests the assignment of return data to the fields on the form', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      var dataReq = new win.Def.RecordDataRequester($('fe_trigger_field_1'), '/someurl', null, ['code', 'pseudonym'], true);
      dataReq.assignDataToFields({code: 45, pseudonym: ['one', 'two']});
      assert('45' === $('fe_code_1').value);
      var fe_pseudonym_1_autoComp = win.document.getElementById('fe_pseudonym_1').autocomp;
      expect(fe_pseudonym_1_autoComp.rawList_).to.deep.equal(['one', 'two']);
      assert(!fe_pseudonym_1_autoComp.itemCodes_);

      // Test setting lists and list codes.
      dataReq.assignDataToFields({pseudonym: [['one', 'two'], ['a', 'b']]});
      expect(fe_pseudonym_1_autoComp.rawList_).to.deep.equal(['one', 'two']);
      expect(fe_pseudonym_1_autoComp.itemCodes_).to.deep.equal(['a', 'b']);

      // Test what happens when the "true" parameter is set for listDataOnly.
      $('fe_code_1').value = '2';
      $('fe_pseudonym_1').value = 'hi';
      dataReq.assignDataToFields({code: 45, pseudonym: ['one']}, true);
      assert('2' === $('fe_code_1').value);
      assert('hi' === $('fe_pseudonym_1').value);

      // Test that assignment still works when the "outputToSameGroup"
      // parameter is false.
      dataReq.assignDataToFields({code: 46, pseudonym: ['three', 'four']});
      assert('46' === $('fe_code_1').value);
      expect(fe_pseudonym_1_autoComp.rawList_).to.deep.equal(['three', 'four']);
    });
  });

  it('tests the clearing of fields', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Set the fields' values first.
      var dataReq = new win.Def.RecordDataRequester($('fe_trigger_field_1'), '/someurl', null, ['code', 'pseudonym'], true);
      dataReq.assignDataToFields({code: 45, pseudonym: ['one', 'two']});

      // Now try clearing the fields
      dataReq.clearDataOutputFields();
      assert('' === $('fe_code_1').value);
      var fe_pseudonym_1_autoComp = win.document.getElementById('fe_pseudonym_1').autocomp;
      expect(fe_pseudonym_1_autoComp.rawList_).to.deep.equal([]);
    });
  });

  it('tests the construction of the CGI parameters', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // Test a field that does not have a code.
      var dataReq = new win.Def.RecordDataRequester($('fe_pseudonym_1'), '/someurl', ['record_id', 'trigger_field'], ['code'], true);
      // Set the field values
      $('fe_trigger_field_1').value = 'tf val';
      $('fe_record_id_1').value = '45';
      $('fe_pseudonym_1').value = 'one two';
      $('fe_pseudonym_1').autocomp.storeSelectedItem()
      var params = dataReq.buildParameters();
      assert('tf val' === params['trigger_field']);
      assert('one two' === params['field_val']);
      assert('45' === params['record_id']);
      assert('' === params['authenticity_token']);

      // Test a field that has a code.
      dataReq = new win.Def.RecordDataRequester($('fe_gender_1'), '/someurl', ['record_id', 'trigger_field'], ['code'], true);
      $('fe_gender_1').autocomp.setFieldVal('Male', false);
      $('fe_gender_C_1').value = 'M';
      $('fe_gender_1').autocomp.storeSelectedItem()
      params = dataReq.buildParameters();
      assert('M' === params['code_val']);
      assert('45' === params['record_id']);
      assert('tf val' === params['trigger_field']);
      assert('' === params['authenticity_token']);

      // Test a field that has a blank code field.
      $('fe_gender_1').autocomp.setFieldVal('Not Male', false);
      $('fe_gender_C_1').value = '';
      $('fe_gender_1').autocomp.storeSelectedItem()
      params = dataReq.buildParameters();
      assert('Not Male' === params['field_val']);
      assert('45' === params['record_id']);
      assert('tf val' === params['trigger_field']);
      assert('' === params['authenticity_token']);
    });
  });

  it('tests getOutputFieldRDR', function () {
    cy.window().then(function (win) {
      var $ = win.Def.PrototypeAPI.$;
      // The current implementation of getOutputFieldRDR relies on the
      // autocompleter being set up as well, so we'll create two autocompleters
      // and two RDRs.
      var dataReq = new win.Def.RecordDataRequester($('fe_trigger_field_1'), '/someurl', null, ['name', 'pseudonym'], true);
      new win.Def.Autocompleter.Prefetch('fe_trigger_field_1', ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {
        'matchListValue': false, 'addSeqNum': false, 'codes': ['a', 'oa', 'pa', 'b'], 'dataRequester': dataReq
      });
      var dataReq2 = new win.Def.RecordDataRequester($('fe_gender_1'), '/someurl', ['record_id', 'trigger_field'], ['code'], true);
      new win.Def.Autocompleter.Prefetch('fe_gender_1', ['Male', 'Female'], {
        'matchListValue': false, 'addSeqNum': false, 'codes': ['M', 'F'], 'dataRequester': dataReq2
      });

      assert(dataReq !== dataReq2);
      assert(dataReq === win.Def.RecordDataRequester.getOutputFieldRDR('fe_name_1'), 'fe_name_1');
      assert(dataReq === win.Def.RecordDataRequester.getOutputFieldRDR('fe_pseudonym_1'), 'fe_pseudonym_1');
      assert(dataReq2 === win.Def.RecordDataRequester.getOutputFieldRDR('fe_code_1'), 'fe_code_1');
    });
  });

  it('tests listIsEmpty', function () {
    cy.window().then(function (win) {
      var auto = new win.Def.Autocompleter.Prefetch('fe_trigger_field_1', ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'], {
        'matchListValue': false, 'addSeqNum': false, 'codes': ['a', 'oa', 'pa', 'b']
      });
      assert(!auto.listIsEmpty(), "list should not be empty");
      auto = new win.Def.Autocompleter.Prefetch('fe_trigger_field_1', [], {
        'matchListValue': false,
        'addSeqNum': false
      });
      assert(auto.listIsEmpty(), "list should be empty");
    });
  });

});
