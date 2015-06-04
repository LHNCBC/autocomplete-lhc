// These two methods are based on code from  the web page (but don't use this URL, as it seems to have been
// taken over by some advertising company):
// http://www.garyharan.com/index.php/2007/11/26/how-to-unobtrusively-scroll-a-div-with-prototype-scriptaculous/
// They introduce a scrolling effect that can scroll to x and y coordinates
// instead of an element, and can scroll a div as well as a window.

Element.addMethods({
  scrollTo: function(element, left, top){
    var element = $(element);
    if (arguments.length == 1){
      var pos = element.cumulativeOffset();
      window.scrollTo(pos[0], pos[1]);
    } else {
      element.scrollLeft = left;
      element.scrollTop  = top;
    }
    return element;
  }
});

Effect.Scroll = Class.create();
// Wrap the definitions in a function to protect our version of global variables
(function($, Effect) {
  Object.extend(Object.extend(Effect.Scroll.prototype, Effect.Base.prototype), {
    /**
     *  Returns the current scroll position of element.
     */
    currentScrollPos: function(element) {
      // Store the current scroll position.  This used to be done in setup, but
      // in Chrome, the scroll position sometimes shifts (when a field is getting
      // focused) between initialize and setup.
      var scrollOffsets;
      if (this.element === window)
        scrollOffsets = document.viewport.getScrollOffsets();
      else {
        // Work around bug in Chrome (see comments in update).
        if (this.element === document.documentElement &&
            document.documentElement.scrollTop === 0 && document.documentElement.scrollLeft === 0) {
          scrollOffsets = {left: document.body.scrollLeft, top: document.body.scrollTop};
        }
        else
          scrollOffsets = {left: this.element.scrollLeft, top: this.element.scrollTop};
      }
      return scrollOffsets;
    },
    initialize: function(element) {
      this.element = $(element);
      if(!this.element) throw(Effect._elementDoesNotExistError);
      // Capture the target location.
      var originalScrollPos = this.currentScrollPos(element);
      var shift = Object.extend({x: 0, y: 0}, arguments[1] || {});
      var targetPos = {x: originalScrollPos.left + shift.x, y: originalScrollPos.top + shift.y}
      this.start(targetPos);
    },
    setup: function() {
    },
    update: function(pos) {
      // Recalcaute the current scroll position in case it has changed.  (The
      // browser also tries to scroll to fields on focus events.)
      var current = this.currentScrollPos(this.element);
      var left = Math.round((this.options.x - current.left) * pos + current.left);
      var top = Math.round((this.options.y - current.top) * pos + current.top);
      this.element.scrollTo(left, top);
      // Work around a bug in Chrome.  For chrome, if document.documentElement is
      // being scrolled, we need instead to set the scroll position on
      // document.body.
      // See https://code.google.com/p/chromium/issues/detail?id=157855
      // https://code.google.com/p/chromium/issues/detail?id=345592
      // https://code.google.com/p/chromium/issues/detail?id=342307
      if (this.element === document.documentElement)
        document.body.scrollTo(left, top);
    }
  });
})($, Effect);
