describe('directive', function() {
  var dp = require('../support/directivePage.js'); // dp = DirectivePage instance

  it('should create an area on the page for the list', function() {
    dp.openDirectiveTestPage();
    cy.get(dp.searchResSel).should('exist');
  });

  it('should assign an ID to the autocompleting field', function() {
    cy.get(dp.inputElem).should('exist');
  });

  it('should assign a name attribute to the autocompleting field', function() {
    cy.get(dp.inputElem).should('have.attr', 'name', 'ac1');
  });

  it('should show the list when the field is clicked', function() {
    cy.get(dp.searchResSel).should('not.be.visible');
    cy.get(dp.inputElem).click();
    cy.get(dp.searchResSel).should('be.visible');
  });

  it('should load the default item code and value', function() {
    dp.openDirectiveTestPage();
    cy.get(dp.inputElem).should('have.value', 'Blue');
    cy.get(dp.codeField).should('have.value', 'B');
  });

  it('should not highlight the default value when the list is opened',
      function() {
    cy.get(dp.inputElem).click();
    // There should not be a highlight on 'Blue', so one down arrow should
    // select the first item in the list.
    cy.get(dp.inputElem).type('{downArrow}');
    cy.get(dp.inputElem).should('have.value', 'Green');
  });

  it('should not load the default item code and value when the model is already populated', function() {
    cy.get(dp.prePopElem).should('have.value', 'a pre-populated model value');
  });

  it('should allow specification of the default by a code', function() {
    cy.get(dp.prefetchWithCodeDefault).should('have.value', 'Green');
  });

  it('should populate the model when an item is selected', function() {
    cy.get(dp.inputElem).click();
    cy.get(dp.searchResSel).should('be.visible');
    dp.searchResult(1).click();
    // Change focus to send change event
    cy.get(dp.codeField).click();
    cy.get(dp.inputElem).should('have.value', 'Green');
    cy.get(dp.codeField).should('have.value', 'G');
  });

  it('should assign ng-invalid-parse only for CNE', function() {
    // Try a CWE
    cy.get(dp.prefetchCWEBlank).should('not.have.class', 'ng-invalid-parse');
    cy.get(dp.prefetchCWEBlank).click();
    cy.get(dp.prefetchCWEBlank).type('zzz');
    // Change focus to send change event
    cy.get(dp.codeField).click();
    cy.get(dp.prefetchCWEBlank).should('not.have.class', 'ng-invalid-parse');

    // The parser no longer returns the invalid signal (undefined) so
    // ng-invalid-parse never gets set.  See comments in the test below,
    // 'should allow undefined model values even for CNE'.
    // // Try a CNE
    // expect(hasClass(dp.prefetchCNEBlank, 'ng-invalid-parse')).toBe(false);
    // dp.prefetchCNEBlank.click();
    // dp.prefetchCNEBlank.sendKeys('zzz');
    // // Change focus to send change event
    // dp.codeField.click();
    // expect(hasClass(dp.prefetchCNEBlank, 'ng-invalid-parse')).toBe(true);
  });

  it('should allow undefined model values even for CNE', function() {
    // In LForms, if you use the keyboard to select a list value in a CNE, there
    // was an issue where it would register as an invalid value.
    // This was traced to the parser code which went ahead and returned the
    // model value (undefined) for CNE fields, but switched to null for CWE
    // fields (which doesn't trigger the invalid status).
    cy.window().then(win=> {
      win.eval('angular.element("'+dp.prefetchCNEBlank+
        '").isolateScope().modelData = undefined;');
      cy.get(dp.prefetchCNEBlank).click();
      cy.get(dp.prefetchCNEBlank).type('{downArrow}');
      cy.get(dp.prefetchCNEBlank).blur();
      cy.get(dp.prefetchCNEBlank).should('not.have.class', 'ng-invalid-parse');
    });
  });

  it('should handle invalid model value assignments', function() {
    // list4b has been assigned a model value of {}, which used to put
    // "undefined" in the the field.  For some reason, this is not reproducible
    // after the page is loaded; it must be done when page is first set up,
    // which is why it is set in directiveTest.html rather than here.

    var testFieldCSS = '#list4b';
    var list4bModelAttrName = 'listFieldVal4b';

    // Returns a promise resolving to the model data object for the test field.
    // modelAttrName:  the attribute on scope() for the model data (default:
    // list4bModelAttrName);
    function getModel(modelAttrName) {
      if (!modelAttrName)
        modelAttrName = list4bModelAttrName;
      return dp.getModel(testFieldCSS, modelAttrName, false);
    }

    // Updates the model data for the test field, assigning it the given object.
    function setModel(model) {
      var modelString = model === undefined ? 'undefined' :
        JSON.stringify(model);
      cy.window().then(win=> {
        win.eval('var testField = $("'+testFieldCSS+'");'+
          'testField.scope().'+list4bModelAttrName+' = '+modelString+';'+
          'testField.scope().$digest();');
      });
    }

    dp.openDirectiveTestPage();
    getModel().then((m)=>{expect(m).to.deep.equal({})}); // precondition
    // Make sure the field value is empty, not "undefined"
    cy.get(testFieldCSS).should('have.value', '');

    // Allow a string value for the model
    setModel('hello');
    cy.get(testFieldCSS).should('have.value', 'hello');

    // Make sure a valid model still works
    setModel({text: 'hi'});
    cy.get(testFieldCSS).should('have.value', 'hi');

    // Now try setting the model value to null, which previously resulted in an
    // exception being thrown.  I'm not sure how to make sure $digest doesn't
    // result in a thrown exception, because that seems to run asynchronously,
    // so we'll just check that the value gets set to the empty string.
    setModel(null)
    cy.get(testFieldCSS).should('have.value', '');

    // Try a model with a null text attribute.
    setModel({text: null, code: null});
    cy.get(testFieldCSS).should('have.value', '');
    cy.window().then(win=> {
      var elemVal = win.eval('$("'+testFieldCSS+'")[0].autocomp.domCache.get("elemVal")');
      expect(elemVal).to.equal('');
    });
    // Try this for a field whose model was initially this invalid assignment
    // Previously this caused an issue with the DOM cache for elemVal.
    getModel('listfieldval11').then(m=>expect(m).to.deep.equal({text: null, code: null}));
    cy.get('#list11').should('have.value', '');
    cy.window().then(win=> {
      var elemVal = win.eval('$("#list11")[0].autocomp.domCache.get("elemVal")');
      expect(elemVal).to.equal('');
    });
  });

  it('should watch on changes of autocomplete options', function() {
    cy.get(dp.optChangeTest).should('have.value', 'Green');
    cy.get(dp.btnOptChangeTest).click();
    cy.get(dp.optChangeTest).should('have.value', '').click();
    // pick the 2nd item,
    cy.get(dp.optChangeTest).type('{downArrow}{downArrow}{enter}');
    cy.get(dp.optChangeTest).should('have.value', 'Blue_NEW');
  });


  describe('Prefetch lists', function() {
    it('should allow the displayed property to be configured', function() {
      dp.openDirectiveTestPage();
      var testField = '#list12';
      cy.get(testField).click();
      dp.searchResult(1).click();
      cy.get(testField).should('have.value', 'Green');
    });

    it('should set _notOnList for off-list items, but not empty values',
        function() {
      var testField = dp.inputElem;
      cy.get(testField).click().type('zzz{enter}');
      dp.getModel(testField).then(m=>expect(m).to.deep.equal({text: 'Bluezzz', _notOnList: true}));
      // Now set it to an empty value.  The model value should be null.
      cy.get(testField).click().clear().type('{enter}');
      dp.getModel(testField).then(m=>expect(m).to.equal(null));
    });
  });

  describe('CNE lists', function() {
    it('should warn user about invalid values', function() {
      dp.openDirectiveTestPage();
      cy.get(dp.cneListSel).should('not.have.class', 'no_match');
      cy.get(dp.cneListSel).should('not.have.class', 'invalid');

      cy.get(dp.cneListSel).click().type('zzz{enter}');
      cy.get(dp.cneListSel).should('have.class', 'no_match');
      cy.get(dp.cneListSel).should('have.class', 'invalid');
      // Focus should be back in the field
      cy.focused().invoke('attr', 'id').should('equal', dp.cneListID);
    });
  });
});

