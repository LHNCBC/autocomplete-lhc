const assert = require('assert');
const sinon = require('sinon');

/**
 * Loads the autocomplete modules into a fresh Def namespace for each test.
 * @return a Def object with the required test doubles installed.
 */
function loadDef() {
  Object.defineProperty(globalThis, 'window', {
    value: {attachEvent: null, opera: null, _token: null},
    configurable: true,
    writable: true
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: {userAgent: ''},
    configurable: true,
    writable: true
  });

  const Def = {};
  Def.PrototypeAPI = require('../../source/prototype_api');
  Def.jqueryLite = {
    ui: {
      keyCode: {
        ENTER: 13,
        DOWN: 40,
        ESCAPE: 27,
        TAB: 9,
        UP: 38
      }
    },
    ajax: sinon.spy()
  };
  require('../../source/observable.js')(Def);
  Def.ScreenReaderLog = function() {};
  Def.ScreenReaderLog.prototype.add = function() {};
  Def.Event = {simulate: sinon.spy()};
  Def.FieldAlarms = {
    setOffAlarm: sinon.spy(),
    cancelAlarm: sinon.spy()
  };

  require('../../source/autoCompBase.js')(Def.PrototypeAPI.$, Def);
  require('../../source/autoCompSearch.js')(Def.PrototypeAPI.$, Def);
  require('../../source/recordDataRequester.js')(Def.PrototypeAPI.$, Def);
  Def.Autocompleter.Event = {
    callbacks_: null,
    notifyObservers: sinon.spy()
  };
  Def.Autocompleter.screenReaderLog = sinon.spy();
  return Def;
}

/**
 * Creates a minimal Base autocompleter instance for shared-behavior tests.
 * @param Def the Def namespace returned by loadDef.
 * @param fieldVal the initial value for the fake field.
 * @return a Base autocompleter instance with dependency test doubles.
 */
function makeBaseAutocomplete(Def, fieldVal) {
  const ac = Object.create(Def.Autocompleter.Base.prototype);
  ac.element = {value: fieldVal || ''};
  ac.multiSelect_ = false;
  ac.enabled_ = true;
  ac.matchListValue_ = false;
  ac.nonMatchSuggestions_ = false;
  ac.propagateFieldChanges = sinon.spy();
  ac.clearStoredSelection = sinon.spy();
  ac.setMatchStatusIndicator = sinon.spy();
  ac.setInvalidValIndicator = sinon.spy();
  ac.storeSelectedItem = sinon.spy();
  ac.listSelectionNotification = sinon.spy();
  ac.getValTyped = function() { return this.element && this.element.value; };
  ac.moveEntryToSelectedArea = sinon.spy();
  return ac;
}

describe('autocompleter destroy cleanup', function() {
  let Def;

  beforeEach(function() {
    Def = loadDef();
  });

  describe('Base', function() {
    it('hides the shared list before detaching from the field', function() {
      const calls = [];
      const ac = Object.create(Def.Autocompleter.Base.prototype);
      ac.multiSelect_ = false;
      ac.elementEventListeners = {};
      ac.element = {
        autocomp: ac,
        classList: {
          remove: function() { calls.push('removeClasses'); }
        }
      };
      ac.update = {};
      ac.hideList = function() {
        assert.equal(this.element.autocomp, ac);
        calls.push('hideList');
      };

      ac.destroy();

      assert.deepStrictEqual(calls, ['hideList', 'removeClasses']);
      assert.equal(ac.element, null);
      assert.equal(ac.update, null);
    });

    it('does not refocus a destroyed field from a delayed invalid-value callback', function() {
      const clock = sinon.useFakeTimers();
      try {
        const ac = makeBaseAutocomplete(Def, 'not on list');
        ac.element.focus = sinon.spy();
        ac.element.select = sinon.spy();
        ac.matchListValue_ = true;

        ac.handleNonListEntry();
        ac.element = null;

        assert.doesNotThrow(function() { clock.tick(1); });
      }
      finally {
        clock.restore();
      }
    });

    it('clears a pending observer timeout during stopObservingEvents', function() {
      const clock = sinon.useFakeTimers();
      try {
        const ac = Object.create(Def.Autocompleter.Base.prototype);
        ac.elementEventListeners = {};
        ac.onObserverEvent = sinon.spy();
        ac.observer = setTimeout(function() { ac.onObserverEvent(); }, 1);

        ac.stopObservingEvents();
        clock.tick(1);

        assert.equal(ac.observer, null);
        sinon.assert.notCalled(ac.onObserverEvent);
      }
      finally {
        clock.restore();
      }
    });

    it('onObserverEvent exits safely after detach and clears observer state', function() {
      const ac = Object.create(Def.Autocompleter.Base.prototype);
      ac.element = null;
      ac.observer = 123;
      ac.domCache = {
        invalidate: function() {
          throw new Error('domCache.invalidate should not be called after detach');
        }
      };

      assert.doesNotThrow(function() { ac.onObserverEvent(); });
      assert.equal(ac.observer, null);
    });

  });

  describe('Search', function() {
    it('removes button listeners and aborts a pending request during cleanup', function() {
      const focusListener = function() {};
      const buttonMouseDownListener = function() {};
      const buttonKeyPressListener = function() {};
      const button = {removeEventListener: sinon.spy()};
      Object.defineProperty(globalThis, 'document', {
        value: {
          getElementById: function(id) { return id === 'searchBtn' ? button : null; }
        },
        configurable: true,
        writable: true
      });

      const ac = Object.create(Def.Autocompleter.Search.prototype);
      ac.element = {removeEventListener: sinon.spy()};
      ac.elementEventListeners = {focus: [focusListener]};
      ac.buttonID = 'searchBtn';
      ac.buttonMouseDownListener_ = buttonMouseDownListener;
      ac.buttonKeyPressListener_ = buttonKeyPressListener;
      const request = {abort: sinon.spy()};
      ac.lastAjaxRequest_ = request;
      ac.loadingAnnouncerTimeout = setTimeout(function() {}, 1000);

      ac.stopObservingEvents();

      sinon.assert.calledWith(ac.element.removeEventListener, 'focus', focusListener);
      sinon.assert.calledWith(button.removeEventListener,
        'mousedown', buttonMouseDownListener);
      sinon.assert.calledWith(button.removeEventListener,
        'keypress', buttonKeyPressListener);
      sinon.assert.calledOnce(request.abort);
      assert.equal(ac.lastAjaxRequest_, null);
    });

    it('ignores a search completion after detach', function() {
      const ac = Object.create(Def.Autocompleter.Search.prototype);
      ac.element = null;
      ac.lastAjaxRequest_ = null;
      ac.getToken = function() { throw new Error('getToken should not be called'); };

      assert.doesNotThrow(function() {
        ac.onComplete({requestedCount: 7, status: 200, results: []});
      });
    });

    it('ignores suggestion callbacks after detach', function() {
      const ac = Object.create(Def.Autocompleter.Search.prototype);
      ac.element = null;
      ac.domCache = {get: function() { throw new Error('domCache should not be read'); }};

      assert.doesNotThrow(function() {
        ac.onFindSuggestionComplete({status: 200, responseJSON: [[], []]});
      });
      sinon.assert.notCalled(Def.Autocompleter.Event.notifyObservers);
    });

    it('does not issue suggestion requests after detach', function() {
      const ac = Object.create(Def.Autocompleter.Search.prototype);
      ac.element = null;
      ac.url = 'http://example.test/suggest';
      ac.getSearchStr = function() { throw new Error('getSearchStr should not be called'); };

      assert.doesNotThrow(function() { ac.findSuggestions(); });
      sinon.assert.notCalled(Def.jqueryLite.ajax);
    });
  });

  describe('RecordDataRequester', function() {
    it('ignores a late data response after its owner autocompleter is destroyed', function() {
      const response = {responseJSON: {out: 'value'}};
      const rdr = Object.create(Def.RecordDataRequester.prototype);
      rdr.formField_ = {id: 'owner', value: 'owner value', autocomp: null};
      rdr.latestPendingAjaxRequest_ = response;
      rdr.assignDataToFields = sinon.spy();
      rdr.processUpdateList = sinon.spy();

      rdr.onDataReqComplete(response);

      assert.equal(rdr.latestPendingAjaxRequest_, null);
      sinon.assert.notCalled(rdr.assignDataToFields);
      sinon.assert.notCalled(rdr.processUpdateList);
    });

    it('ignores a late data response after the field gets a new requester', function() {
      const response = {responseJSON: {out: 'value'}};
      const oldRdr = Object.create(Def.RecordDataRequester.prototype);
      oldRdr.formField_ = {
        id: 'owner',
        value: 'owner value',
        autocomp: {recDataRequester_: {}}
      };
      oldRdr.latestPendingAjaxRequest_ = response;
      oldRdr.assignDataToFields = sinon.spy();
      oldRdr.processUpdateList = sinon.spy();

      oldRdr.onDataReqComplete(response);

      assert.equal(oldRdr.latestPendingAjaxRequest_, null);
      sinon.assert.notCalled(oldRdr.assignDataToFields);
      sinon.assert.notCalled(oldRdr.processUpdateList);
    });

    it('skips list assignment to fields without a live autocompleter', function() {
      const outputField = {id: 'output'};
      const rdr = Object.create(Def.RecordDataRequester.prototype);
      rdr.formField_ = {id: 'owner'};
      rdr.inputFieldsHash_ = {};
      rdr.autoCompUpdateList_ = null;
      rdr.getOutputFieldsHash = function() {
        return {target: [outputField]};
      };

      assert.doesNotThrow(function() {
        rdr.assignDataToFields({target: ['a', 'b']});
      });
      sinon.assert.calledOnce(Def.Autocompleter.Event.notifyObservers);
      assert.deepStrictEqual(
        Def.Autocompleter.Event.notifyObservers.firstCall.args[2].updatedFields,
        []);
    });
  });
});
