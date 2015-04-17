// Make jQuery and PrototypeJS get along
jQuery.noConflict();

var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autoFill']=true
var fe_race_or_ethnicity_autoComp = new Def.Autocompleter.Prefetch('fe_race_or_ethnicity', ["American Indian or Alaska Native","Asian","Black or African-American","Hispanic or Latino","Native Hawaiian or Pacific Islander","White","Unknown"], opts);
var opts = {};
opts['codes']=["LA44-3","LA45-0","LA46-8"]
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autoFill']=true
var fe_prefetch_cwe_autoComp = new Def.Autocompleter.Prefetch('prefetch_cwe', ["Spanish","French","Other"], opts);
var opts = {};
opts['matchListValue']=true
opts['autocomp']=true
var fe_search_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_cne',
    '/form/get_search_res_list?fd_id=1284', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.SUGGEST_SHORTEST, 'autocomp': true};
var fe_search_cwe_autoComp =
  new Def.Autocompleter.Search('fe_search_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.NO_COMPLETION_SUGGESTIONS, 'autocomp': true};
var fe_search_cwe_autoComp =
  new Def.Autocompleter.Search('fe_search0_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.USE_STATISTICS, 'autocomp': true};
var fe_search_cwe_autoComp =
  new Def.Autocompleter.Search('fe_search2_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autoFill']=true
var fe_table_prefetch_cne_autoComp = new Def.Autocompleter.Prefetch('fe_table_prefetch_cne', ["LA6155-1 - American Indian or Alaska Native","LA6156-9 - Asian","LA6162-7 - Black or African-American","LA6214-6 - Hispanic or Latino","LA6266-6 - Native Hawaiian or Pacific Islander","LA4457-3 - White","LA4489-6 - Unknown"], opts);
var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['buttonID']='fe_search_button_cne_button'
opts['autocomp']=true
var fe_search_button_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_button_cne',
    '/form/get_search_res_list?fd_id=1285', opts);var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autocomp']=true
var fe_table_search_cne_autoComp =
  new Def.Autocompleter.Search('fe_table_search_cne',
    '/form/get_search_res_list?fd_id=1286', opts);      Def.dataFieldlabelNames_ = {"race_or_ethnicity":[["A Prefetch CNE autocompleter"],""],"prefetch_cwe":[["A Prefetch CWE autocompleter"],""],"search_cne":[["A search CNE autocompleter"],""],"search_cwe":[["A search CWE autocompleter"],""],"table_prefetch_cne":[["A TablePrefetch autocompleter"],""],"search_button_cne":[["A search CNE autocompleter with a button"],""],"table_search_cne":[["A TableSearch CNE autocompleter with a button"],""]};
      Def.tipFields_ = {"race_or_ethnicity":["race_or_ethnicity"],"prefetch_cwe":["prefetch_cwe"],"search_cne":["search_cne"],"search_cwe":["search_cwe"],"table_prefetch_cne":["table_prefetch_cne"],"search_button_cne":["search_button_cne"],"table_search_cne":["table_search_cne"]};

// multi-select prefetch list with match required
opts = {};
opts['matchListValue']=true;
opts['codes']=["LA44-3","LA45-0","LA46-8"];
opts['maxSelect'] = '*';
var fe_multi_sel_cne_autoComp =
 new Def.Autocompleter.Prefetch('fe_multi_sel_cne', ["Spanish","French","Other"], opts);

// multi-select prefetch list without match required
opts = {};
opts['matchListValue']=false;
opts['codes']=["LA44-3","LA45-0","LA46-8"];
opts['maxSelect'] = '*';
var fe_multi_sel_cne_autoComp =
 new Def.Autocompleter.Prefetch('multi_sel_cwe', ["Spanish","French","Other"], opts);

// Long prefetched list autocompleter with an odd number of items (for checking
// CSS display issues when the list wraps to two columns).
opts = {};
opts['matchListValue']=true;
opts['codes']=["QUE-13","QUE-21","QUE-7","QUE-0","QUE-20","QUE-8","QUE-16",
  "QUE-15","QUE-11","QUE-5","QUE-4","QUE-3","QUE-6","QUE-12","QUE-14","QUE-17",
  "QUE-18","QUE-2","QUE-9","QUE-10","QUE-19"];
var longList = ["Allergies",
  "Disease risk based on family history","Exercise","General symptoms",
  "Genetic testing","Herbal or alternative remedies",
  "Infant or child development","Insurance","Lab tests and/or results",
  "Medical conditions","Medical equipment and/or supplies","Medications",
  "Nutrition","Preventive/screening tests","Referrals",
  "School or learning issues","Sports injuries","Surgeries","Travel advice",
  "Vaccines","X-ray or other radiology tests and/or results"];
new Def.Autocompleter.Prefetch('long_odd_cne', longList, opts);

// The same long prefetched list but with scrolling disabled.
var opts2 = {matchListValue: true, codes: opts.codes,
             scrolledContainer: null};
new Def.Autocompleter.Prefetch('long_odd_cne_no_scroll', longList, opts2);
