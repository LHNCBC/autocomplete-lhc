import deepEqual from 'deep-equal';

/**
 *  Wait for a function return expectedVal, or to return a Promise that
 *  resolvest to expectedVal.
 * @param promiseFn a function whose return value is to be tested.  It does not
 *  have to return a Promise; it can just return the value directly.
 */
export function waitForPromiseVal(promiseFn, expectedVal) {
  const MAX_WAIT = 4000;
  const ITER_WAIT = 50;
  let totalWait = 0;
  return new Cypress.Promise((resolve, reject) => {
    function testValue(actualVal) {
      if (!deepEqual(actualVal, expectedVal)) {
        console.log("waitForPromiseVal:  actualVal, expectedVal="+
          JSON.stringify(actualVal) +", " +JSON.stringify(expectedVal));
        if (totalWait < MAX_WAIT) {
          setTimeout(waitForPromiseVal, ITER_WAIT);
          totalWait += ITER_WAIT;
        }
        else
          reject('Condition not satisfied after ' +MAX_WAIT+' ms');
      }
      else {
        resolve(actualVal);
      }
    }

    function waitForPromiseVal() {
      var result;
      try {
        result = promiseFn();
      }
      catch (e) {
        console.log(e);
        reject(e);
      }
      if (result && typeof result.then === 'function') {
        result.then(val=>{
          testValue(val);
        });
      }
      else
        testValue(result);
    }
    waitForPromiseVal();
  });
}
