var assert = require('assert');
const sinon = require('sinon');

describe('Observable', function() {
  let Def;
  beforeEach(() => {
    Def = {};
    require('../../source/observable.js')(Def);
  });
  describe('removeCallback', function() {
    it('should prevent the callback from being called', function(done) {
      var ctrA = 0;
      function a() {++ctrA};
      Def.Observable.storeCallback('f', 'k', a);
      var ctrB = 0;
      function b() {
        ++ctrB;
        assert.equal(ctrA, 0, 'ctrA');
        assert.equal(ctrB, 1, 'ctrB');
        done();
      };
      Def.Observable.storeCallback('f', 'k', b);
      Def.Observable.removeCallback('f', 'k', a);
      Def.Observable.notifyObservers({id: 'f'}, 'k', {});
    });
  });

  describe('storeCallback', function() {
    it('should remove the callback after calling the return function', function(done) {
      let x = 0;
      const a = function() {x = x + 1};
      const spy = sinon.spy(a);
      const unsubscribeA = Def.Observable.storeCallback('f', 'k', spy);
      Def.Observable.notifyObservers({id: 'f'}, 'k', {});
      sinon.assert.callCount(spy, 0); // Function not invoked yet.
      setTimeout(() => {
        sinon.assert.callCount(spy, 1);
        spy.resetHistory();
        unsubscribeA();
        Def.Observable.notifyObservers({id: 'f'}, 'k', {});
        setTimeout(() => {
          sinon.assert.callCount(spy, 0);
          done();
        });
      });
    });
  });
});
