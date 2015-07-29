// A subset of Scriptaculous' effects.js code needed by this package, with
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

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};



if (typeof Def === 'undefined')
  Def = {};

(function($, jQuery, Def) {
  var Effect = {
    _elementDoesNotExistError: {
      name: 'ElementDoesNotExistError',
      message: 'The specified DOM element does not exist, but is required for this effect to operate'
    },
     Transitions: {
      linear: Prototype.K,
      sinoidal: function(pos) {
        return (-Math.cos(pos*Math.PI)/2) + .5;
      },
      reverse: function(pos) {
        return 1-pos;
      },
      flicker: function(pos) {
        var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
        return pos > 1 ? 1 : pos;
      },
      wobble: function(pos) {
        return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
      },
      pulse: function(pos, pulses) {
        return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
      },
      spring: function(pos) {
        return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
      },
      none: function(pos) {
        return 0;
      },
      full: function(pos) {
        return 1;
      }
    },
    DefaultOptions: {
      duration:   1.0,   // seconds
      fps:        100,   // 100= assume 66fps max.
      sync:       false, // true for combining
      from:       0.0,
      to:         1.0,
      delay:      0.0,
      queue:      'parallel'
    }
  };
  Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

  // --- Queues ---
  Effect.ScopedQueue = Class.create(Enumerable, {
    initialize: function() {
      this.effects  = [];
      this.interval = null;
    },
    _each: function(iterator) {
      this.effects._each(iterator);
    },
    add: function(effect) {
      var timestamp = new Date().getTime();

      var position = Object.isString(effect.options.queue) ?
        effect.options.queue : effect.options.queue.position;

      switch(position) {
        case 'front':
          // move unstarted effects after this effect
          this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
              e.startOn  += effect.finishOn;
              e.finishOn += effect.finishOn;
            });
          break;
        case 'with-last':
          timestamp = this.effects.pluck('startOn').max() || timestamp;
          break;
        case 'end':
          // start effect after last queued effect has finished
          timestamp = this.effects.pluck('finishOn').max() || timestamp;
          break;
      }

      effect.startOn  += timestamp;
      effect.finishOn += timestamp;

      if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
        this.effects.push(effect);

      if (!this.interval)
        this.interval = setInterval(this.loop.bind(this), 15);
    },
    remove: function(effect) {
      this.effects = this.effects.reject(function(e) { return e==effect });
      if (this.effects.length == 0) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    loop: function() {
      var timePos = new Date().getTime();
      for(var i=0, len=this.effects.length;i<len;i++)
        this.effects[i] && this.effects[i].loop(timePos);
    }
  });

  Effect.Queues = {
    instances: $H(),
    get: function(queueName) {
      if (!Object.isString(queueName)) return queueName;

      return this.instances.get(queueName) ||
        this.instances.set(queueName, new Effect.ScopedQueue());
    }
  };
  Effect.Queue = Effect.Queues.get('global');

  // --- End of code for Queues ---

  Effect.Base = Class.create({
    position: null,
    start: function(options) {
      if (options && options.transition === false) options.transition = Effect.Transitions.linear;
      this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
      this.currentFrame = 0;
      this.state        = 'idle';
      this.startOn      = this.options.delay*1000;
      this.finishOn     = this.startOn+(this.options.duration*1000);
      this.fromToDelta  = this.options.to-this.options.from;
      this.totalTime    = this.finishOn-this.startOn;
      this.totalFrames  = this.options.fps*this.options.duration;

      this.render = (function() {
        function dispatch(effect, eventName) {
          if (effect.options[eventName + 'Internal'])
            effect.options[eventName + 'Internal'](effect);
          if (effect.options[eventName])
            effect.options[eventName](effect);
        }

        return function(pos) {
          if (this.state === "idle") {
            this.state = "running";
            dispatch(this, 'beforeSetup');
            if (this.setup) this.setup();
            dispatch(this, 'afterSetup');
          }
          if (this.state === "running") {
            pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
            this.position = pos;
            dispatch(this, 'beforeUpdate');
            if (this.update) this.update(pos);
            dispatch(this, 'afterUpdate');
          }
        };
      })();

      this.event('beforeStart');
      if (!this.options.sync)
        Effect.Queues.get(Object.isString(this.options.queue) ?
          'global' : this.options.queue.scope).add(this);
    },
    loop: function(timePos) {
      if (timePos >= this.startOn) {
        if (timePos >= this.finishOn) {
          this.render(1.0);
          this.cancel();
          this.event('beforeFinish');
          if (this.finish) this.finish();
          this.event('afterFinish');
          return;
        }
        var pos   = (timePos - this.startOn) / this.totalTime,
            frame = (pos * this.totalFrames).round();
        if (frame > this.currentFrame) {
          this.render(pos);
          this.currentFrame = frame;
        }
      }
    },
    cancel: function() {
      if (!this.options.sync)
        Effect.Queues.get(Object.isString(this.options.queue) ?
          'global' : this.options.queue.scope).remove(this);
      this.state = 'finished';
    },
    event: function(eventName) {
      if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
      if (this.options[eventName]) this.options[eventName](this);
    },
    inspect: function() {
      var data = $H();
      for(property in this)
        if (!Object.isFunction(this[property])) data.set(property, this[property]);
      return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
    }
  });


  Effect.Move = Class.create(Effect.Base, {
    initialize: function(element) {
      this.element = $(element);
      if (!this.element) throw(Effect._elementDoesNotExistError);
      var options = Object.extend({
        x:    0,
        y:    0,
        mode: 'relative'
      }, arguments[1] || { });
      this.start(options);
    },
    setup: function() {
      this.element.makePositioned();
      this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
      this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
      if (this.options.mode == 'absolute') {
        this.options.x = this.options.x - this.originalLeft;
        this.options.y = this.options.y - this.originalTop;
      }
    },
    update: function(position) {
      this.element.setStyle({
        left: (this.options.x  * position + this.originalLeft).round() + 'px',
        top:  (this.options.y  * position + this.originalTop).round()  + 'px'
      });
    }
  });

  Effect.Shake = function(element) {
    element = $(element);
    var options = Object.extend({
      distance: 20,
      duration: 0.5
    }, arguments[1] || {});
    var distance = parseFloat(options.distance);
    var split = parseFloat(options.duration) / 10.0;
    var oldStyle = {
      top: element.getStyle('top'),
      left: element.getStyle('left') };
      return new Effect.Move(element,
        { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
      new Effect.Move(effect.element,
        { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
      new Effect.Move(effect.element,
        { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
      new Effect.Move(effect.element,
        { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
      new Effect.Move(effect.element,
        { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
      new Effect.Move(effect.element,
        { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
          effect.element.undoPositioned().setStyle(oldStyle);
    }}); }}); }}); }}); }}); }});
  };

  Def.Effect = Effect;
})($, jQuery, Def);

