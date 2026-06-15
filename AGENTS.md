# AGENTS.md

## Project Snapshot
- Browser autocomplete library for NLM/LHC-Forms; usable standalone or through
  the optional AngularJS directive.
- Existing first-party guidance from the requested glob is `README.md` only; it
  documents the setup/test sequence.
- `source/index.js` builds the exported `Def` namespace by loading modules in
  dependency order. Keep this order intact because later modules expect earlier
  `Def` mutations.

## Architecture
- `source/prototype_api.js` and `source/jqueryLite.js` provide local
  Prototype/jQuery-like APIs; `Def.PrototypeAPI.$` is not full jQuery.
- `source/autoCompBase.js` owns shared autocomplete behavior, ARIA attributes,
  keyboard handling, DOM cache, selected-item state, and the single shared list
  container appended as `#lhc-tools-searchResults`.
- `source/autoCompPrefetch.js` handles in-memory lists, codes, headings, HTML
  list display, sequence numbers, tokenized input, and multi-select filtering.
- `source/autoCompSearch.js` handles URL/custom-function/FHIR searches, loading
  indicators, result caching, expanded result counts, and response normalization.
- `source/autoCompEvents.js` exposes async observer hooks such as
  `observeListSelections`, `observeSuggestions`, `observeListExpansions`, and
  RDR assignment/clearing events.
- `source/recordDataRequester.js` fetches extra record data after selection and
  populates related fields or dependent prefetch lists.
- `source/autocomplete-lhc.js` wraps the same constructors as an AngularJS
  directive: options with `url`/`fhir.search` create search lists, otherwise
  `listItems` creates prefetch lists.

## Data And API Contracts
- Public constructors are `new Def.Autocompleter.Prefetch(field, listItems,
  options)` and `new Def.Autocompleter.Search(field, url, options)`; instances
  are also stored on `field.autocomp`.
- Non-FHIR search responses use different tuples by request type:
  regular requests use `[total, codes, extraData, itemFields, codeSystems]`,
  while suggestion requests use `[codes, displayStrings, extraData,
  codeSystems]`. In regular responses, `itemFields` is an array of arrays
  joined with `Def.Autocompleter.LIST_ITEM_FIELD_SEP` (`' - '`).
- Search can use `options.search(fieldVal, count)` returning a Promise, or a URL
  queried through `Def.jqueryLite.ajax`; FHIR mode expects a ValueSet expansion
  and sends `filter`, `_format`, and `count`.
- Angular model values are objects with display property `text` by default,
  optional `code`, optional `data`, and `_notOnList` for accepted off-list
  entries.
- Use `Def.Autocompleter.setFieldVal` or an instance `setFieldVal` when changing
  field values so DOM cache and synthetic change events stay consistent.
- `maxSelect: '*'` means unlimited multi-select; selected items render in a
  `span.autocomp_selected` wrapper and are filtered from later choices.
- `wordBoundaryChars` maps to legacy `tokens`; tokenized fields force
  single-select and may need `tokenGroupingFunction` for codes containing token
  separators.

## Code Style Conventions
- Modules use the existing IIFE initializer pattern: export the initializer
  under CommonJS, otherwise mutate global `Def` for direct script-tag test pages.
- Preserve the Prototype-style class/object pattern
  (`Def.PrototypeAPI.Class.create`, `Object.assign` onto prototypes) and
  underscore-suffixed internal fields.
- Keep edits narrow and style-consistent (quote style, import style, async
  patterns, line lengths near 80 where practical).
- Keep both loading paths working: webpack bundles from `source/index.js`, while
  `test/pages/*.html` load individual `source/*.js` files directly.
- `webpack.config.js` targets `ie >= 10`; `test/pages/*.html` load source
  files directly without Babel, so avoid JavaScript syntax (for example
  optional chaining) and browser APIs unsupported by IE10 in those files.
  Modern-browser Cypress coverage does not prove IE10 parse/execute
  compatibility.

## Build And Test Workflow
- Fresh setup per `README.md`: ensure `node`/`npm`/`node_modules/.bin` are on `PATH`
  (Linux: `source bashrc.autocomp`), run `npm ci`, `npm run build`, then
  `bower install`, then `npm test`.
- `npm run build` recreates `dist/`, writes
  `dist/latest/autocomplete-lhc(.min).js`, minifies CSS, copies
  PNG/license/readme files, and creates the versioned zip.
- `npm test` runs `test/run_tests.sh`: starts `node test/app.js` on
  `package.json` `config.testPort` (`3003`), runs
  `mocha -R spec test/mocha/*.js`, then `cypress run`.
- `npm run test:e2e` skips Mocha. For a single Cypress spec, start
  `node test/app.js` separately after build, then run
  `npx cypress run --spec test/cypress/integration/fhir.cy.js`.
- Cypress uses `testIsolation: false`; shared page/list state can leak, so
  follow existing page objects and helpers in `test/cypress/support/`.

## Test Fixtures
- `test/pages/ajaxMock.js` overrides `Def.jqueryLite.ajax` and `ajaxAsPromise`
  for deterministic CTSS/FHIR search responses; update it with search-contract
  changes.
- Add browser coverage under `test/cypress/integration/*.cy.js`; reusable
  selectors/actions belong in `test/cypress/support/*Page.js` or
  `testHelpers.js`.
- Use Mocha for isolated CommonJS modules, following
  `test/mocha/observableTest.js` which loads a source module into a fresh `Def`
  object.
