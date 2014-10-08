describe('autocomp', function() {

  var driver = browser.driver;
  driver.get('http://localhost:3000/autoComp_test.html');

  describe('dupItemToCode', function() {

    it('should normally assign something not null', function() {
      var itemToCode = driver.executeScript(function() {
        var otherAutoComp =
          new Def.Autocompleter.Prefetch(AutoCompTestUtil.createInputElement().id,
             ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
             {'addSeqNum': false});

        fe_other_list_field2_autoComp.dupItemToCode(otherAutoComp);
        return otherAutoComp.itemToCode_;
      });
      expect(itemToCode).not.toBeNull();
    });

    it('should assign null if the list is not the original one', function () {
      var itemToCode = driver.executeScript(function() {
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
        return anotherAC.itemToCode_;
      });
      expect(itemToCode).toBeNull();
    });
  });

  describe('dupDataReqForField', function() {
    it('should return not null if and only if the original autocompleter had '+
       'a RecordDataRequester', function() {
      var dup = driver.executeScript(function() {
        return fe_other_list_field_autoComp.dupDataReqForField(
          AutoCompTestUtil.createInputElement().id);
      });
      expect(dup).not.toBeNull();
      dup = driver.executeScript(function() {
        return fe_other_list_field2_autoComp.dupDataReqForField(
          AutoCompTestUtil.createInputElement().id);
      });
      expect(dup).toBeNull();
    });
  });
});

