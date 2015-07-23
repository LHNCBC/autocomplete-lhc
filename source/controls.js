// A subset of Scriptaculous' controls.js code needed by this package, with
// modifications.
// See http://script.aculo.us/ for Scriptaculous, whose license is the following
// MIT-style license:
//
// Copyright © 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// “Software”), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

if (typeof Def === 'undefined')
  Def = {};

(function($, jQuery, Def) {
  // Autocompleter.Base handles all the autocompletion functionality
  // that's independent of the data source for autocompletion. This
  // includes drawing the autocompletion menu, observing keyboard
  // and mouse events, and similar.
  //
  // Specific autocompleters need to provide, at the very least,
  // a getUpdatedChoices function that will be invoked every time
  // the text inside the monitored textbox changes. This method
  // should get the text for which to provide autocompletion by
  // invoking this.getToken(), NOT by directly accessing
  // this.element.value. This is to allow incremental tokenized
  // autocompletion. Specific auto-completion logic (AJAX, etc)
  // belongs in getUpdatedChoices.
  //
  // Tokenized incremental autocompletion is enabled automatically
  // when an autocompleter is instantiated with the 'tokens' option
  // in the options parameter, e.g.:
  // new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
  // will incrementally autocomplete with a comma as the token.
  // Additionally, ',' in the above example can be replaced with
  // a token array, e.g. { tokens: [',', '\n'] } which
  // enables autocompletion on multiple tokens. This is most
  // useful when one of the tokens is \n (a newline), as it
  // allows smart autocompletion after linebreaks.

  if(typeof Def.Effect == 'undefined')
    throw("controls.js requires including script.aculo.us' effects.js library");

  var Autocompleter = { };
  Autocompleter.Base = Class.create({
    baseInitialize: function(element, update, options) {
      element          = $(element);
      this.element     = element;
      this.update      = $(update);
      this.hasFocus    = false;
      this.changed     = false;
      this.active      = false;
      this.index       = 0;
      this.entryCount  = 0;
      this.oldElementValue = this.element.value;

      if(this.setOptions)
        this.setOptions(options);
      else
        this.options = options || { };

      this.options.paramName    = this.options.paramName || this.element.name;
      this.options.tokens       = this.options.tokens || [];
      this.options.frequency    = this.options.frequency || 0.4;
      this.options.minChars     = this.options.minChars || 1;
      this.options.onShow       = this.options.onShow ||
        function(element, update){
          if(!update.style.position || update.style.position=='absolute') {
            update.style.position = 'absolute';
            Position.clone(element, update, {
              setHeight: false,
              offsetTop: element.offsetHeight
            });
          }
          Effect.Appear(update,{duration:0.15});
        };
      this.options.onHide = this.options.onHide ||
        function(element, update){ new Effect.Fade(update,{duration:0.15}) };

      if(typeof(this.options.tokens) == 'string')
        this.options.tokens = new Array(this.options.tokens);
      // Force carriage returns as token delimiters anyway
      if (!this.options.tokens.include('\n'))
        this.options.tokens.push('\n');

      this.observer = null;

      this.element.setAttribute('autocomplete','off');

      Element.hide(this.update);

      Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
      Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
    },

    show: function() {
      if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
      if(!this.iefix &&
        (Prototype.Browser.IE) &&
        (Element.getStyle(this.update, 'position')=='absolute')) {
        new Insertion.After(this.update,
         '<iframe id="' + this.update.id + '_iefix" '+
         'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
         'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
        this.iefix = $(this.update.id+'_iefix');
      }
      if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
    },

    fixIEOverlapping: function() {
      Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
      this.iefix.style.zIndex = 1;
      this.update.style.zIndex = 2;
      Element.show(this.iefix);
    },

    hide: function() {
      this.stopIndicator();
      if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
      if(this.iefix) Element.hide(this.iefix);
    },

    startIndicator: function() {
      if(this.options.indicator) Element.show(this.options.indicator);
    },

    stopIndicator: function() {
      if(this.options.indicator) Element.hide(this.options.indicator);
    },

    activate: function() {
      this.changed = false;
      this.hasFocus = true;
      this.getUpdatedChoices();
    },

    onHover: function(event) {
      var element = Event.findElement(event, 'LI');
      if(this.index != element.autocompleteIndex)
      {
          this.index = element.autocompleteIndex;
          this.render();
      }
      Event.stop(event);
    },

    onClick: function(event) {
      var element = Event.findElement(event, 'LI');
      this.index = element.autocompleteIndex;
      this.selectEntry();
      this.hide();
    },

    render: function() {
      if(this.entryCount > 0) {
        for (var i = 0; i < this.entryCount; i++)
          this.index==i ?
            Element.addClassName(this.getEntry(i),"selected") :
            Element.removeClassName(this.getEntry(i),"selected");
        if(this.hasFocus) {
          this.show();
          this.active = true;
        }
      } else {
        this.active = false;
        this.hide();
      }
    },

    getEntry: function(index) {
      return this.update.firstChild.childNodes[index];
    },

    getCurrentEntry: function() {
      return this.getEntry(this.index);
    },

    selectEntry: function() {
      this.active = false;
      this.updateElement(this.getCurrentEntry());
    },

    updateElement: function(selectedElement) {
      if (this.options.updateElement) {
        this.options.updateElement(selectedElement);
        return;
      }
      var value = '';
      if (this.options.select) {
        var nodes = $(selectedElement).select('.' + this.options.select) || [];
        if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
      } else
        value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

      var bounds = this.getTokenBounds();
      if (bounds[0] != -1) {
        var newValue = this.element.value.substr(0, bounds[0]);
        var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
        if (whitespace)
          newValue += whitespace[0];
        this.element.value = newValue + value + this.element.value.substr(bounds[1]);
      } else {
        this.element.value = value;
      }
      this.oldElementValue = this.element.value;
      this.element.focus();

      if (this.options.afterUpdateElement)
        this.options.afterUpdateElement(this.element, selectedElement);
    },

    onObserverEvent: function() {
      this.changed = false;
      this.tokenBounds = null;
      if(this.getToken().length>=this.options.minChars) {
        this.getUpdatedChoices();
      } else {
        this.active = false;
        this.hide();
      }
      this.oldElementValue = this.element.value;
    },

  });

  Def.ScriptaculousAutocompleter = Autocompleter;

})($, jQuery, Def);

