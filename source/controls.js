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

  });

  Def.ScriptaculousAutocompleter = Autocompleter;

})($, jQuery, Def);

