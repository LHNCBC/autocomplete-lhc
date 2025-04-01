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
        },


        /**
         * equivalent of jQuery offset().
         * @param elem HTML element
         * @return {{top: *, left: *}}
         */
        getElementOffset: function(elem) {
          // Get document-relative position by adding viewport scroll to viewport-relative gBCR
          const rect = elem.getBoundingClientRect();
          const win = elem.ownerDocument.defaultView;
          return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
          };
        },


        /**
         * equivalent of jQuery ajax().
         * @param url could be absolute url, or relative url path that starts with '/'
         * @param options
         * @param options.data an object containing query params for the request
         * @param options.complete a callback function to be executed after the request is finished
         * @return {XMLHttpRequest}
         */
        ajax: function(url, options) {
          // Make full URL if a relative url path is passed in.
          if (url.startsWith('/')) {
            url = window.location.origin + url;
          }
          const urlObject = new URL(url);
          if (options.data) {
            for (const [key, value] of Object.entries(options.data)) {
              urlObject.searchParams.set(key, value);
            }
          }
          const r = new XMLHttpRequest();
          // r.responseType = options.dataType || '';
          r.open("GET", urlObject.toString(), true);
          r.onreadystatechange = function() {
            if (r.readyState === 4) {
              options.complete(r);
            }
          };
          r.send();
          return r;
        },


        /**
         * Same as ajax() above except it's wrapped in a Promise.
         * It doesn't take options.complete as it returns a Promise.
         * @param url could be absolute url, or relative url path that starts with '/'
         * @param options
         * @param options.data an object containing query params for the request
         * @return a Promise that resolves when the XMLHttpRequest is finished
         */
        ajaxAsPromise: function(url, options) {
          return new Promise((resolve, reject) => {
            // Make full URL if a relative url path is passed in.
            if (url.startsWith('/')) {
              url = window.location.origin + url;
            }
            const urlObject = new URL(url);
            if (options.data) {
              for (const [key, value] of Object.entries(options.data)) {
                urlObject.searchParams.set(key, value);
              }
            }
            const r = new XMLHttpRequest();
            r.open("GET", urlObject.toString(), true);
            r.onreadystatechange = function() {
              if (r.readyState === 4) {
                resolve(r);
              }
            };
            r.onerror = () => reject('Network Error');
            r.send();
          });
        }
      }
    }();
  }

  if (typeof module !== 'undefined')
    module.exports = initJqueryLite;
  else
    initJqueryLite(Def);
})();
