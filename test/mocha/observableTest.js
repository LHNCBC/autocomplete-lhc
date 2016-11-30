var assert = require('assert');
var observable = require('../../source/observable.js');

describe('Observable', function() {
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
});
