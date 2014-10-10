// Mock the Ajax call.  We are only trying to test the JavaScript side here.
Ajax.Request = function(url, options) {
  if (url.indexOf('fd_id=1284')>0 && options.parameters['terms'] === 'ar') {
    var response = {};
    response.request = this;
    this.options = options;
    response.status = 200;
    response.responseText = '[65,["5398","2910","154","4077","1051","4836","5529"],{"term_icd9_code":["042","518.82","704.01","","284.9","424.1","322.9"]},[["AIDS-related complex"],["Adult respiratory distress syndrome (ARDS)"],["Alopecia areata"],["Androblastoma"],["Anemia - refractory"],["Aortic insufficiency"],["Arachnoiditis"]],false]';
    setTimeout(function() {options.onComplete(response);}, 1);
  }
};
// end of mock for Ajax.Request

var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['suggestionMode']=0
opts['autoFill']=true
var fe_race_or_ethnicity_autoComp = new Def.Autocompleter.Prefetch('fe_race_or_ethnicity', ["American Indian or Alaska Native","Asian","Black or African-American","Hispanic or Latino","Native Hawaiian or Pacific Islander","White","Unknown"], opts);
var opts = {};
opts['codes']=["LA44-3","LA45-0","LA46-8"]
opts['suggestionMode']=0
opts['autoFill']=true
var fe_prefetch_cwe_autoComp = new Def.Autocompleter.Prefetch('fe_prefetch_cwe', ["Spanish","French","Other"], opts);
var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=0
opts['autocomp']=true
var fe_search_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_cne',
    '/form/get_search_res_list?fd_id=1284', opts);var opts = {};
opts['matchListValue']=false
opts['suggestionMode']=0
opts['autocomp']=true
var fe_search_cwe_autoComp =
  new Def.Autocompleter.Search('fe_search_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['suggestionMode']=0
opts['autoFill']=true
var fe_table_prefetch_cne_autoComp = new Def.Autocompleter.Prefetch('fe_table_prefetch_cne', ["LA6155-1 - American Indian or Alaska Native","LA6156-9 - Asian","LA6162-7 - Black or African-American","LA6214-6 - Hispanic or Latino","LA6266-6 - Native Hawaiian or Pacific Islander","LA4457-3 - White","LA4489-6 - Unknown"], opts);
var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=0
opts['buttonID']='fe_search_button_cne_button'
opts['autocomp']=true
var fe_search_button_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_button_cne',
    '/form/get_search_res_list?fd_id=1285', opts);var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=0
opts['autocomp']=true
var fe_table_search_cne_autoComp =
  new Def.Autocompleter.Search('fe_table_search_cne',
    '/form/get_search_res_list?fd_id=1286', opts);      Def.dataFieldlabelNames_ = {"race_or_ethnicity":[["A Prefetch CNE autocompleter"],""],"prefetch_cwe":[["A Prefetch CWE autocompleter"],""],"search_cne":[["A search CNE autocompleter"],""],"search_cwe":[["A search CWE autocompleter"],""],"table_prefetch_cne":[["A TablePrefetch autocompleter"],""],"search_button_cne":[["A search CNE autocompleter with a button"],""],"table_search_cne":[["A TableSearch CNE autocompleter with a button"],""]};
      Def.tipFields_ = {"race_or_ethnicity":["race_or_ethnicity"],"prefetch_cwe":["prefetch_cwe"],"search_cne":["search_cne"],"search_cwe":["search_cwe"],"table_prefetch_cne":["table_prefetch_cne"],"search_button_cne":["search_button_cne"],"table_search_cne":["table_search_cne"]};
      Def.Autocompleter.Base.TABLE_FIELD_JOIN_STR = ' - ';
      // The following could be in a global JS file
      window.tip_delay = 50;
      window.access_close = 'C';
      Def.SET_VAL_DELIM = '|';
Def.fieldObservers_={
 'save':{
     'click': [function(event){onSave(this,event);}, function(event) {event.stopPropagation();}]
  }
}
Def.fieldValidations_ = {
}

