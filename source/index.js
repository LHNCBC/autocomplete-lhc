var Def = {};
Def.PrototypeAPI = require('./prototype_api');
require('./polyfill');
require('./jqueryLite')(Def);
require('./effects')(Def.PrototypeAPI.$, jQuery, Def);
require('./effectScroll')(Def.PrototypeAPI, Def.Effect)
require('./event.simulate')(Def.PrototypeAPI.$, Def)
require('./observable')(Def);
require('./screenReaderLog')(Def)
require('./recordDataRequester')(Def.PrototypeAPI.$, jQuery, Def)
require('./fieldAlarms')(Def.PrototypeAPI.$, jQuery, Def);
require('../soundmanager/bonk')(Def);
require('./autoCompBase')(Def.PrototypeAPI.$, jQuery, Def);
require('./autoCompPrefetch')(Def.PrototypeAPI.$, jQuery, Def);
require('./autoCompSearch')(Def.PrototypeAPI.$, jQuery, Def);
require('./autoCompEvents')(Def.PrototypeAPI.$, jQuery, Def);
require('./autocomplete-lhc')(Def);

module.exports = Def;
