// These two methods are from the web page (but don't use this URL, as it seems to have been
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
Object.extend(Object.extend(Effect.Scroll.prototype, Effect.Base.prototype), {
  initialize: function(element) {
    this.element = $(element);
    if(!this.element) throw(Effect._elementDoesNotExistError);
    this.start(Object.extend({x: 0, y: 0}, arguments[1] || {}));
  },
  setup: function() {
    var scrollOffsets = (this.element == window) 
                ? document.viewport.getScrollOffsets() 
                : Element._returnOffset(this.element.scrollLeft, this.element.scrollTop) ;
    this.originalScrollLeft = scrollOffsets.left;
    this.originalScrollTop  = scrollOffsets.top;
  },
  update: function(pos) {
    this.element.scrollTo(Math.round(this.options.x * pos + this.originalScrollLeft), Math.round(this.options.y * pos + this.originalScrollTop));
  }
});
