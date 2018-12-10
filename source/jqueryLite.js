// A replacement for the parts of jQuery (right now just jQuery UI) needed by
// the autocomplete-lhc package.  Parts of what is below may be borrowed from
// jQuery, which is under the MIT license.

(function() {
  function initJqueryLite(Def) {

    Def.jqueryLite = function() {
      "use strict";

      return {
        ui: {
          keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
          }
        }
      }
    }();

    // Eventually, but not yet, we'll try to replace jQuery entirely.  For now, just copy in the above.
    Object.assign(jQuery, Def.jqueryLite);
  }

  if (typeof module !== 'undefined')
    module.exports = initJqueryLite;
  else
    initJqueryLite(Def);
})();
