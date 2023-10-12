var Def = {};
Def.PrototypeAPI = require('./prototype_api');
require('./polyfill');
require('./jqueryLite')(Def);
require('./effects')(Def.PrototypeAPI.$, Def);
require('./effectScroll')(Def.PrototypeAPI, Def.Effect)
require('./event.simulate')(Def.PrototypeAPI.$, Def)
require('./observable')(Def);
require('./screenReaderLog')(Def)
require('./recordDataRequester')(Def.PrototypeAPI.$, Def)
require('./fieldAlarms')(Def.PrototypeAPI.$, Def);
require('../soundmanager/bonk')(Def);
require('./autoCompBase')(Def.PrototypeAPI.$, Def);
require('./autoCompPrefetch')(Def.PrototypeAPI.$, Def);
require('./autoCompSearch')(Def.PrototypeAPI.$, Def);
require('./autoCompEvents')(Def.PrototypeAPI.$, Def);
require('./autocomplete-lhc')(Def);

module.exports = Def;
