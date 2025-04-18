var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['autoFill']=true
var raceList = ["American Indian or Alaska Native","Asian","Black or African-American",
  "Hispanic or Latino","Native Hawaiian or Pacific Islander","White",
  "Unknown"];
var fe_race_or_ethnicity_autoComp = new
  Def.Autocompleter.Prefetch('race_or_ethnicity', raceList, opts);

opts = Object.assign({}, opts);
opts.matchListValue = false;
opts.wordBoundaryChars = [','];
new Def.Autocompleter.Prefetch('prefetch_cwe_tokens', raceList, opts);

var opts = {};
opts['codes']=["K", "K/W", "kat", "kat/kg", "kat/L", "A", "A/m", "a_g", "a_j", "a_t", "a"];
opts['autoFill']=true;
opts.matchListValue = false;
opts['suggestionMode']=Def.Autocompleter.USE_STATISTICS;
opts.maxSelect = 1;
opts['autocomp']=true;
var unitList = ["degree Kelvin", "degree Kelvin per Watt", "katal", "katal per kilogram", "katal per liter", "Ampere", "ampere per meter", "mean Gregorian year", "mean Julian year", "tropical year", "year"];
opts.matchListValue = false;
opts.wordBoundaryChars = ['/', '.'];
var unit_prefetch_autoComp = new Def.Autocompleter.Prefetch('prefetch_unit_tokens', unitList, opts);
// Show the item_code next to the field for easier testing.
setTimeout(() => {
  Def.Autocompleter.Event.observeListSelections(null, function (data) {
    document.getElementById('item_code').textContent = data?.item_code;
  });
}, 0);

var opts = {};
opts['codes']=["LA44-3","LA45-0","LA46-8", "ZZZ"]
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autoFill']=true
var fe_prefetch_cwe_autoComp = new Def.Autocompleter.Prefetch('prefetch_cwe',
  ["Spanish","French","Other", "escape<test>&"], opts);
var opts = {};
opts['addSeqNum'] = false;
opts['isListHTML'] = true;
var fe_prefetch_html_autoComp = new Def.Autocompleter.Prefetch('prefetch_html',
  [
    '<strong>bla</strong>',
    '<span title="I am strong.">bla</span>',
    '<i title="I am strong.">I am strong</i>'
  ], opts);
var opts = {};
opts['isListHTML'] = true;
var fe_prefetch_html_image_autoComp = new Def.Autocompleter.Prefetch('prefetch_html_image',
  [
    'Happy <img src="happy-face.png">',
    'Neutral <img src="neutral-face.png">',
    'Sad <img src="sad-face.png">',
    'one < two'
  ], opts);
var opts = {};
opts['isListHTML'] = false;
opts['addSeqNum'] = false;
var fe_prefetch_non_html_image_autoComp = new Def.Autocompleter.Prefetch('prefetch_non_html_image',
  [
    'Happy <img src="happy-face.png">',
    'Neutral <img src="neutral-face.png">',
    'Sad <img src="sad-face.png">',
    'one < two'
  ], opts);
var opts = {};
opts['matchListValue']=true
opts['autocomp']=true
opts['showLoadingIndicator']=false
new Def.Autocompleter.Search('fe_search_cne',
  '/form/get_search_res_list?fd_id=1284', opts);

opts = Object.assign({}, opts);
opts.tokens = [',']; // i.e., wordBoundaryChars, but testing backward-compatibility
new Def.Autocompleter.Search('search_cne_tokens',
  '/form/get_search_res_list?fd_id=1284', opts);

var opts = {'matchListValue': false, nonMatchSuggestions: true,
 'suggestionMode': Def.Autocompleter.SUGGEST_SHORTEST, 'autocomp': true};
new Def.Autocompleter.Search('fe_search_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);
Def.Autocompleter.Event.observeSuggestions('fe_search_cwe', function(data) {
  window.fe_search_cwe_suggestions = data; // store suggestion list for testing
});
Def.Autocompleter.Event.observeSuggestionUsed('fe_search_cwe', function(data){
  window.fe_search_cwe_suggUsedData = data;
});

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.NO_COMPLETION_SUGGESTIONS, 'autocomp': true};
new Def.Autocompleter.Search('fe_search0_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.USE_STATISTICS, 'autocomp': true};
new Def.Autocompleter.Search('fe_search2_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false, sort: false,
 'suggestionMode': Def.Autocompleter.SUGGEST_SHORTEST};
new Def.Autocompleter.Search('search1NoSort_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false, sort: false,
 'suggestionMode': Def.Autocompleter.NO_COMPLETION_SUGGESTIONS};
new Def.Autocompleter.Search('search0NoSort_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false, sort: false,
 'suggestionMode': Def.Autocompleter.USE_STATISTICS};
new Def.Autocompleter.Search('search2NoSort_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['buttonID']='fe_search_button_cne_button'
opts['autocomp']=true
var fe_search_button_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_button_cne',
    '/form/get_search_res_list?fd_id=1285', opts);

// Custom search function (non-FHIR)
new Def.Autocompleter.Search('non_fhir_search_w_function', null, {
    search: function(fieldVal, count) {
  // Return CTSS formatted results, wrapped in a Promise.
  return Promise.resolve(
     [7, undefined, undefined, [
      ["Back pain"],
      ["Abdominal pain"],
      ["High blood pressure (hypertension (HTN))"],
      ["Hepatitis B"],
      ["Hemophilia B"],
      ["Flu B (Influenza B) infection"],
      ["Urinary tract infection (UTI)"]]]);
}});


// FHIR
new Def.Autocompleter.Search('fhir_search',
  'https://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/$expand?url=http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/ucum',
  {fhir: true});
new Def.Autocompleter.Search('fhir_search_multi',
  'https://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/$expand?url=http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/ucum',
  {fhir: true, maxSelect: '*'});
new Def.Autocompleter.Search('fhir_search_w_button',
  'https://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/$expand?url=http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/ucum',
  {fhir: true, buttonID: 'fhir_search_button'});
new Def.Autocompleter.Search('fhir_search_w_function', null, {
    showListOnFocusIfEmpty: true,
    fhir: {search: function(fieldVal, count) {
  // Return a ValueSet, wrapped in a Promise.
  // tbd - return two lengths of value sets depending on count
  return Promise.resolve(fieldVal === ''
      ? {"resourceType":"ValueSet",
          "expansion":{"total":621,"contains":[
                  {"code":"2315","system":"cs-conditions","display":"Back pain"},
                  {"code":"3982","system":"cs-conditions","display":"Abdominal pain"},
                  {"code":"374","system":"cs-conditions","display":"High blood pressure (hypertension (HTN))"},
                  {"code":"14674","system":"cs-conditions","display":"Hepatitis B"},
                  {"code":"18370","system":"cs-conditions","display":"Hemophilia B"}]}}
      : count===Def.Autocompleter.Base.MAX_ITEMS_BELOW_FIELD ?
     {"resourceType":"ValueSet","url":"http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/conditions?terms=b",
      "status":"active","expansion":{"timestamp":"2019-07-18T19:01:51.448Z","total":621,"contains":[
      {"code":"2315","system":"cs-conditions","display":"Back pain"},
      {"code":"3982","system":"cs-conditions","display":"Abdominal pain"},
      {"code":"374","system":"cs-conditions","display":"High blood pressure (hypertension (HTN))"},
      {"code":"14674","system":"cs-conditions","display":"Hepatitis B"},
      {"code":"18370","system":"cs-conditions","display":"Hemophilia B"},
      {"code":"14678","system":"cs-conditions","display":"Flu B (Influenza B) infection"},
      {"code":"2281","system":"cs-conditions","display":"Urinary tract infection (UTI)"}]}}
     : {"resourceType":"ValueSet","url":"http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/conditions?terms=b",
      "status":"active","expansion":{"timestamp":"2019-07-18T19:07:44.863Z","total":621,"contains":[
      {"code":"2315","system":"cs-conditions","display":"Back pain"},
      {"code":"3982","system":"cs-conditions","display":"Abdominal pain"},
      {"code":"374","system":"cs-conditions","display":"High blood pressure (hypertension (HTN))"},
      {"code":"14674","system":"cs-conditions","display":"Hepatitis B"},
      {"code":"18370","system":"cs-conditions","display":"Hemophilia B"},
      {"code":"14678","system":"cs-conditions","display":"Flu B (Influenza B) infection"},
      {"code":"2281","system":"cs-conditions","display":"Urinary tract infection (UTI)"},
      {"code":"3850","system":"cs-conditions","display":"Hypertension - essential"},
      {"code":"8140","system":"cs-conditions","display":"Thiamine (vitamin B1) deficiency"},
      {"code":"26621","system":"cs-conditions","display":"Hepatitis B exposure"}]}});
}}});
new Def.Autocompleter.Search('fhir_search_w_function_multi', null, {
  showListOnFocusIfEmpty: true,
  maxSelect: '*',
  fhir: true,
  search: function(fieldVal, count) {
      // Return a ValueSet, wrapped in a Promise.
      return Promise.resolve({
        "resourceType":"ValueSet",
        "expansion":{
          "total":621,
          "contains": [
            {"code":"2315","system":"cs-conditions","display":"Back pain"},
            {"code":"3982","system":"cs-conditions","display":"Abdominal pain"},
            {"code":"374","system":"cs-conditions","display":"High blood pressure (hypertension (HTN))"},
            {"code":"14674","system":"cs-conditions","display":"Hepatitis B"},
            {"code":"18370","system":"cs-conditions","display":"Hemophilia B"},
            {"code":"14678","system":"cs-conditions","display":"Flu B (Influenza B) infection"},
            {"code":"2281","system":"cs-conditions","display":"Urinary tract infection (UTI)"},
            {"code":"3850","system":"cs-conditions","display":"Hypertension - essential"},
            {"code":"8140","system":"cs-conditions","display":"Thiamine (vitamin B1) deficiency"},
            {"code":"26621","system":"cs-conditions","display":"Hepatitis B exposure"}
          ].splice(0, count)}});
    }});
new Def.Autocompleter.Search('fhir_search_cache_test', null, {fhir: {search: function(fieldVal, count) {
  // Return a ValueSet, wrapped in a Promise, different from other other
  // fhir.search function to test for a caching bug.
  return Promise.resolve(count===Def.Autocompleter.Base.MAX_ITEMS_BELOW_FIELD ?
     {"resourceType":"ValueSet","url":"http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/conditions?terms=b",
      "status":"active","expansion":{"timestamp":"2019-07-18T19:01:51.448Z","total":621,"contains":[
      {"code":"2315","system":"cs-conditions","display":"Back pain 2"},
      {"code":"2281","system":"cs-conditions","display":"Urinary tract infection (UTI) 2"}]}} :
     {"resourceType":"ValueSet","url":"http://clinicaltables.nlm.nih.gov/fhir/R3/ValueSet/conditions?terms=b",
      "status":"active","expansion":{"timestamp":"2019-07-18T19:07:44.863Z","total":621,"contains":[
      {"code":"2315","system":"cs-conditions","display":"Back pain 2"},
      {"code":"2281","system":"cs-conditions","display":"Urinary tract infection (UTI) 2"}]}});
}}});


// prefetch list with match required and a default
opts = {};
opts['matchListValue']=true;
opts['codes']=["LA44-3","LA45-0","LA46-8"];
opts['defaultValue']="LA45-0";
var fe_multi_sel_cne_autoComp =
 new Def.Autocompleter.Prefetch('prefetch_default_cne', ["Spanish","French","Other"], opts);

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
document.querySelector('#dest_multi_sel_cwe').addEventListener('click', (event)=>{
  fe_multi_sel_cne_autoComp.destroy()});
// multi-select prefetch list with HTML
var opts = {};
opts['addSeqNum'] = false;
opts['isListHTML'] = true;
opts['maxSelect'] = '*';
var fe_prefetch_html_multi_autoComp = new Def.Autocompleter.Prefetch('prefetch_html_multi',
  [
    '<strong>foo</strong>',
    '<span title="I am strong.">bar</span>',
    'Happy <img src="happy-face.png">'
  ], opts);
// multi-select search list without match required
opts = {
  'matchListValue': false,
  'maxSelect': '*',
  'suggestionMode': Def.Autocompleter.USE_STATISTICS,
  'autocomp': true
};
var fe_multi_sel_search_cwe_autoComp =
new Def.Autocompleter.Search('multi_sel_search_cwe',
  '/form/get_search_res_list?fd_id=2163', opts);
document.querySelector('#dest_multi_sel_search_cwe').addEventListener('click', (event)=>{
  fe_multi_sel_search_cwe_autoComp.destroy()});


// Long prefetched list autocompleter with an odd number of items (for checking
// CSS display issues when the list wraps to two columns).
opts = {};
opts['matchListValue']=true;
opts['headerBar'] = 'testHeaderBar';
opts['codes']=["QUE-13","QUE-21","QUE-7","QUE-0","QUE-20","QUE-8","QUE-16",
  "QUE-15","QUE-11","QUE-5","QUE-4","QUE-3","QUE-6","QUE-12","QUE-14","QUE-17",
  "QUE-18","QUE-2","QUE-9","QUE-10","QUE-19"];
var longList = ["Allergies and such",
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


// A long multi-select prefetch CWE list with headings.
opts = {'maxSelect': '*'};
opts['matchListValue']=false;
opts['codes']=["heading26812","FOOD-2","FOOD-22","FOOD-4","FOOD-5","FOOD-7","FOOD-19","FOOD-16","FOOD-9","FOOD-10","FOOD-18","FOOD-12","FOOD-21","FOOD-13","FOOD-14","FOOD-17","FOOD-20","FOOD-23","FOOD-24","FOOD-25","heading26813","OTHR-18","OTHR-4","OTHR-5","OTHR-17","OTHR-6","OTHR-7","OTHR-1","OTHR-2","OTHR-8","OTHR-9","OTHR-10","OTHR-19","OTHR-11","OTHR-12","OTHR-13","OTHR-3","heading26814","DRUG-CLASS-1","DRUG-CLASS-2","DRUG-CLASS-3","DRUG-CLASS-4","DRUG-CLASS-5","DRUG-CLASS-6","DRUG-CLASS-7","DRUG-CLASS-8","DRUG-CLASS-9","DRUG-CLASS-10","DRUG-CLASS-11","DRUG-CLASS-12","DRUG-CLASS-13","DRUG-CLASS-14","DRUG-CLASS-15","DRUG-CLASS-16","DRUG-CLASS-24","DRUG-CLASS-17","DRUG-CLASS-18","DRUG-CLASS-19","DRUG-CLASS-20","DRUG-CLASS-21","DRUG-CLASS-22","DRUG-CLASS-23","heading26815","MED-57","MED-2","MED-97","MED-6","MED-7","MED-8","MED-55","MED-9","MED-10","MED-11","MED-13","MED-16","MED-99","MED-18","MED-19","MED-20","MED-21","MED-22","MED-23","MED-52","MED-88","MED-26","MED-28","MED-29","MED-30","MED-31","MED-32","MED-33","MED-35","MED-37","MED-64","MED-41","MED-42","MED-43","MED-44","MED-45","MED-46","MED-47","MED-48","MED-49","MED-50","MED-51","MED-36","MED-59","MED-98","MED-96","MED-61","MED-62","MED-65","MED-67","MED-68","MED-70","MED-71","MED-53","MED-72","MED-73","MED-74","MED-66","MED-75","MED-77","MED-79","MED-15","MED-82","MED-83","MED-84","MED-85","MED-86","MED-25","MED-87","MED-89","MED-90","MED-91","MED-92","MED-93","MED-94","MED-95"]
opts['itemToHeading']={"FOOD-2":"heading26812","FOOD-22":"heading26812","FOOD-4":"heading26812","FOOD-5":"heading26812","FOOD-7":"heading26812","FOOD-19":"heading26812","FOOD-16":"heading26812","FOOD-9":"heading26812","FOOD-10":"heading26812","FOOD-18":"heading26812","FOOD-12":"heading26812","FOOD-21":"heading26812","FOOD-13":"heading26812","FOOD-14":"heading26812","FOOD-17":"heading26812","FOOD-20":"heading26812","FOOD-23":"heading26812","FOOD-24":"heading26812","FOOD-25":"heading26812","OTHR-18":"heading26813","OTHR-4":"heading26813","OTHR-5":"heading26813","OTHR-17":"heading26813","OTHR-6":"heading26813","OTHR-7":"heading26813","OTHR-1":"heading26813","OTHR-2":"heading26813","OTHR-8":"heading26813","OTHR-9":"heading26813","OTHR-10":"heading26813","OTHR-19":"heading26813","OTHR-11":"heading26813","OTHR-12":"heading26813","OTHR-13":"heading26813","OTHR-3":"heading26813","DRUG-CLASS-1":"heading26814","DRUG-CLASS-2":"heading26814","DRUG-CLASS-3":"heading26814","DRUG-CLASS-4":"heading26814","DRUG-CLASS-5":"heading26814","DRUG-CLASS-6":"heading26814","DRUG-CLASS-7":"heading26814","DRUG-CLASS-8":"heading26814","DRUG-CLASS-9":"heading26814","DRUG-CLASS-10":"heading26814","DRUG-CLASS-11":"heading26814","DRUG-CLASS-12":"heading26814","DRUG-CLASS-13":"heading26814","DRUG-CLASS-14":"heading26814","DRUG-CLASS-15":"heading26814","DRUG-CLASS-16":"heading26814","DRUG-CLASS-24":"heading26814","DRUG-CLASS-17":"heading26814","DRUG-CLASS-18":"heading26814","DRUG-CLASS-19":"heading26814","DRUG-CLASS-20":"heading26814","DRUG-CLASS-21":"heading26814","DRUG-CLASS-22":"heading26814","DRUG-CLASS-23":"heading26814","MED-57":"heading26815","MED-2":"heading26815","MED-97":"heading26815","MED-6":"heading26815","MED-7":"heading26815","MED-8":"heading26815","MED-55":"heading26815","MED-9":"heading26815","MED-10":"heading26815","MED-11":"heading26815","MED-13":"heading26815","MED-16":"heading26815","MED-99":"heading26815","MED-18":"heading26815","MED-19":"heading26815","MED-20":"heading26815","MED-21":"heading26815","MED-22":"heading26815","MED-23":"heading26815","MED-52":"heading26815","MED-88":"heading26815","MED-26":"heading26815","MED-28":"heading26815","MED-29":"heading26815","MED-30":"heading26815","MED-31":"heading26815","MED-32":"heading26815","MED-33":"heading26815","MED-35":"heading26815","MED-37":"heading26815","MED-64":"heading26815","MED-41":"heading26815","MED-42":"heading26815","MED-43":"heading26815","MED-44":"heading26815","MED-45":"heading26815","MED-46":"heading26815","MED-47":"heading26815","MED-48":"heading26815","MED-49":"heading26815","MED-50":"heading26815","MED-51":"heading26815","MED-36":"heading26815","MED-59":"heading26815","MED-98":"heading26815","MED-96":"heading26815","MED-61":"heading26815","MED-62":"heading26815","MED-65":"heading26815","MED-67":"heading26815","MED-68":"heading26815","MED-70":"heading26815","MED-71":"heading26815","MED-53":"heading26815","MED-72":"heading26815","MED-73":"heading26815","MED-74":"heading26815","MED-66":"heading26815","MED-75":"heading26815","MED-77":"heading26815","MED-79":"heading26815","MED-15":"heading26815","MED-82":"heading26815","MED-83":"heading26815","MED-84":"heading26815","MED-85":"heading26815","MED-86":"heading26815","MED-25":"heading26815","MED-87":"heading26815","MED-89":"heading26815","MED-90":"heading26815","MED-91":"heading26815","MED-92":"heading26815","MED-93":"heading26815","MED-94":"heading26815","MED-95":"heading26815"}
new Def.Autocompleter.Prefetch('multi_headings_cwe', ["Food allergies","Chocolate","Crab","Egg","Fish","Gluten","Milk","Monosodium Glutamate (MSG)","Peanut","Pork","Sesame","Shellfish","Shrimp","Soy","Tomatoes","Tree Nuts","Wheat","Cochineal extract (Carmine) red dye","FD\u0026C Blue No. 1 dye","FD\u0026C Yellow No. 2 dye","Environmental allergies","Cat","Cockroach","Cold Weather","Dog","Dust Mites","Hay Fever","Iodinated x-ray contrast","Latex","Mold","Nickel","Pet Dander","Pollen","Ragweed","Semen","Sun","Wasp, hornet, bee sting","Medication class allergies","ACE Inhibitors","Aminoglycosides","Antihistamines","Benzodiazepines","Beta Blockers","Calcium Channel Blockers","Cephalosporins","Diuretics","H2 Blockers","Insulins","Iodine Containing Medications","Local Anesthetics","Macrolides (like Erythromycin)","Muscle Relaxants, Skeletal","Narcotic Analgesics","Nonsteroidal Anti Inflam. Agents (NSAID)","Penicillin and Derivatives","Phenothiazines","Proton Pump Inhibitors","Quinolone Antibiotics","Serotonin Re-Uptake Inhibitors","Statins","Sulfa Drugs","Tetracycline","Medication allergies","ALEVE (Naproxen)","AMBIEN (Zolpedem)","Amoxicillin","Aspirin (ASA)","ATIVAN  (Lorazapam)","ATROVENT  (Ipartropium)","AVINZA (Morphine)","Bacitracin","BACTRIM  (Sulfamethoxazol/trimethaprim)","BENADRYL  (Diphenhydramine )","BUMEX  (Bumetanide)","CARDIZEM  (Diltizzam)","CEFZIL (Cefprozil)","CIPROFLOXACIN  (Cipro)","Codeine","COLACE (Docusate Sodium)","COMPAZINE (Prochlorperazine Maleate)","COUMADIN (Warfarin)","DALMANE  (Flurazepam)","DEMEROL (Meperidine)","DEPAKOTE ER (Valproic Acid)","DILANTIN (Phenytoin)","DULCOLAX (Bisacodyl)","E-MYCIN (Erythromycin)","GASTROGRAFIN(Diatrizoate Meglumine)","GLUCOPHAGE (Metformin)","HALCION (Triazolam)","HALDOL (Haloperidol)","HUMALIN (human insulin)","IMDUR (Isosorbide)","ISONIAZID (Isoniazide)","KAYEVELATE (Sodium Polystyrene Sulfonate)","KLONOPIN (Clonazepam)","Lactose","LASIX (Furosemide)","LEVAQUIN (Levofloxacin)","LIBRIUM (Chlordiazepoxide)","Lidocaine, Local","LIPITOR (Atorvastatin)","LOPRESSOR (Metroprolol)","LOVENOX (Enoxaparin)","MELLARIL (Thioridazine)","MOTRIN/ADVIL (Ibuprofen)","NORVASC (Amlodipine)","OMNICEF (Cefdinir)","Penicillin","PEPCID (Famotidine)","PERMITIL (Fluphenazine)","PLAVIX (Clopidogrel)","PREVACID (Lansoprazole)","PROLIXIN (Fluphenazine)","REGLAN (Metoclopramide)","RESTORIL (Temazepam)","ROBAXIN (Methocarbamol)","SENOKOT (Senna)","SERAX (Oxazepam)","SERENTIL (Mesoridazine)","SLOW-K (Potassium)","SOLU MEDROL (Methylprednisolone )","STELAZINE (Trifluoperazine)","SYNTHROID (Thyroxin)","TEGRETOL (Carbamazepine)","THORAZINE (Chlorpromazine)","TOPROL (Metoprolol)","TRANXENE (Clorazepate)","TRILAFON (Perphenazie)","TYLENOL (Acetaminophen)","VALIUM (Diastat)","VALIUM (Diazepam)","VASOTEC (Enalapril)","VITAMIN K1 (Phytonadione)","XANAX (Alprazolam)","ZAROXOLYN (Metolazone)","ZOLOFT (Sertraline)","ZOSYN (Piperacillin/Tazobactam)","ZYPREXA (Olanzapine)"], opts);

// A long prefetch CWE list with headings but with two-column flow disabled.
opts = JSON.parse(JSON.stringify(opts)); // clone opts
opts['twoColumnFlow'] = false;
delete opts['maxSelect'];
new Def.Autocompleter.Prefetch('headings_1col_cwe', ["Food allergies","Chocolate","Crab","Egg","Fish","Gluten","Milk","Monosodium Glutamate (MSG)","Peanut","Pork","Sesame","Shellfish","Shrimp","Soy","Tomatoes","Tree Nuts","Wheat","Cochineal extract (Carmine) red dye","FD\u0026C Blue No. 1 dye","FD\u0026C Yellow No. 2 dye","Environmental allergies","Cat","Cockroach","Cold Weather","Dog","Dust Mites","Hay Fever","Iodinated x-ray contrast","Latex","Mold","Nickel","Pet Dander","Pollen","Ragweed","Semen","Sun","Wasp, hornet, bee sting","Medication class allergies","ACE Inhibitors","Aminoglycosides","Antihistamines","Benzodiazepines","Beta Blockers","Calcium Channel Blockers","Cephalosporins","Diuretics","H2 Blockers","Insulins","Iodine Containing Medications","Local Anesthetics","Macrolides (like Erythromycin)","Muscle Relaxants, Skeletal","Narcotic Analgesics","Nonsteroidal Anti Inflam. Agents (NSAID)","Penicillin and Derivatives","Phenothiazines","Proton Pump Inhibitors","Quinolone Antibiotics","Serotonin Re-Uptake Inhibitors","Statins","Sulfa Drugs","Tetracycline","Medication allergies","ALEVE (Naproxen)","AMBIEN (Zolpedem)","Amoxicillin","Aspirin (ASA)","ATIVAN  (Lorazapam)","ATROVENT  (Ipartropium)","AVINZA (Morphine)","Bacitracin","BACTRIM  (Sulfamethoxazol/trimethaprim)","BENADRYL  (Diphenhydramine )","BUMEX  (Bumetanide)","CARDIZEM  (Diltizzam)","CEFZIL (Cefprozil)","CIPROFLOXACIN  (Cipro)","Codeine","COLACE (Docusate Sodium)","COMPAZINE (Prochlorperazine Maleate)","COUMADIN (Warfarin)","DALMANE  (Flurazepam)","DEMEROL (Meperidine)","DEPAKOTE ER (Valproic Acid)","DILANTIN (Phenytoin)","DULCOLAX (Bisacodyl)","E-MYCIN (Erythromycin)","GASTROGRAFIN(Diatrizoate Meglumine)","GLUCOPHAGE (Metformin)","HALCION (Triazolam)","HALDOL (Haloperidol)","HUMALIN (human insulin)","IMDUR (Isosorbide)","ISONIAZID (Isoniazide)","KAYEVELATE (Sodium Polystyrene Sulfonate)","KLONOPIN (Clonazepam)","Lactose","LASIX (Furosemide)","LEVAQUIN (Levofloxacin)","LIBRIUM (Chlordiazepoxide)","Lidocaine, Local","LIPITOR (Atorvastatin)","LOPRESSOR (Metroprolol)","LOVENOX (Enoxaparin)","MELLARIL (Thioridazine)","MOTRIN/ADVIL (Ibuprofen)","NORVASC (Amlodipine)","OMNICEF (Cefdinir)","Penicillin","PEPCID (Famotidine)","PERMITIL (Fluphenazine)","PLAVIX (Clopidogrel)","PREVACID (Lansoprazole)","PROLIXIN (Fluphenazine)","REGLAN (Metoclopramide)","RESTORIL (Temazepam)","ROBAXIN (Methocarbamol)","SENOKOT (Senna)","SERAX (Oxazepam)","SERENTIL (Mesoridazine)","SLOW-K (Potassium)","SOLU MEDROL (Methylprednisolone )","STELAZINE (Trifluoperazine)","SYNTHROID (Thyroxin)","TEGRETOL (Carbamazepine)","THORAZINE (Chlorpromazine)","TOPROL (Metoprolol)","TRANXENE (Clorazepate)","TRILAFON (Perphenazie)","TYLENOL (Acetaminophen)","VALIUM (Diastat)","VALIUM (Diazepam)","VASOTEC (Enalapril)","VITAMIN K1 (Phytonadione)","XANAX (Alprazolam)","ZAROXOLYN (Metolazone)","ZOLOFT (Sertraline)","ZOSYN (Piperacillin/Tazobactam)","ZYPREXA (Olanzapine)"], opts);

// Multi-field prefetch CWE
opts = {tableFormat: true};
opts['codes']=["LA44-3","LA45-0","LA46-8"];
// Commenting out the multi-field prefetch lists until we support that
//new Def.Autocompleter.Prefetch('multi_field_cwe', [["Spanish", "Español"],
//  ["French", "Francais"], ["Other"]], opts);

// Multi-field prefetch CWE with a column specification
opts.valueCols = [1];
//new Def.Autocompleter.Prefetch('multi_field_cwe2', [["Spanish", "Español"],
//  ["French", "Francais"], ["Other", "???"]], opts);

/// multi-field search CWE
opts.autocomp = true;
new Def.Autocompleter.Search('multi_field_search_cwe',
  '/form/get_search_res_list?fd_id=2164', opts);

// A multi-field search CNE with column headers
opts.colHeaders = ['C1', 'C2'];
new Def.Autocompleter.Search('multi_field_search_headers',
    '/form/get_search_res_list?fd_id=2164', opts);


// Another multi-field search CNE but pointed at a URL that only returns one
// column of data.
delete opts['valueCols'];
delete opts['colHeaders'];
new Def.Autocompleter.Search('multi_field_search_cwe2',
    '/form/get_search_res_list?fd_id=2165', opts);


// A multi-field (table format) search CWE with only one column and that is
// multi-select.
opts.maxSelect = '*';
opts.suggestionMode = Def.Autocompleter.NO_COMPLETION_SUGGESTIONS
new Def.Autocompleter.Search('table_format_multi_sel_search_cwe',
    '/form/get_search_res_list?fd_id=2165', opts);


// A long list with a lot of matches for "20" (which will also be an item
// number).
opts = {};
var longList = [];
for (var i=1; i<=25; ++i)
  longList.push('item '+i+' containing 20');
new Def.Autocompleter.Prefetch('item_num_match_test', longList, opts);


// A list to test for correct sorting of results.
var opts = {valueCols: [0], tableFormat: true};
var fe_allele_search_autoComp =
new Def.Autocompleter.Search('allele_search',
    '/form/get_search_res_list?fd_id=alleles', opts);
document.querySelector('#dest_allele_search').addEventListener('click', (event)=>{
  fe_allele_search_autoComp.destroy()});

// A search list to test for case-sensitive matching
new Def.Autocompleter.Search('cs_match_search',
    '/form/get_search_res_list?fd_id=cs_match_search',
    {suggestionMode: Def.Autocompleter.NO_COMPLETION_SUGGESTIONS});

// A prefetch list to test for case-sensitive matching
new Def.Autocompleter.Prefetch('cs_match_prefetch',
    ["aa", "pA", "Pa", "pB"],
    {suggestionMode: Def.Autocompleter.NO_COMPLETION_SUGGESTIONS});

// A prefetch list to test for case-sensitive matching with caseInsenstiveSelection=false
new Def.Autocompleter.Prefetch('cs_match_prefetch_caseSenstiveSelection',
  ["aa", "pA", "Pa", "pB"],
  {suggestionMode: Def.Autocompleter.NO_COMPLETION_SUGGESTIONS, caseInsenstiveSelection: false});



// Lists to test passing an element instead of an ID.
opts = {};
opts['matchListValue']=true;
opts['codes']=["LA44-3","LA45-0","LA46-8"];
opts['defaultValue']="LA45-0";
new Def.Autocompleter.Prefetch(document.querySelector('#prefetch_for_el'), ["Spanish","French","Other"], opts);

var opts = {};
opts.matchListValue = true;
new Def.Autocompleter.Search(document.querySelector('#search_for_el'),
  '/form/get_search_res_list?fd_id=1284', opts);

// Autofill test fields.  To test autoFill_, setListAndField must be called.
var autoFillAC = new Def.Autocompleter.Prefetch('list_w_autofill', [],
  {autoFill: true});
autoFillAC.setListAndField(['Blue']);
autoFillAC = new Def.Autocompleter.Prefetch('list_wo_autofill', [],
  {autoFill: false});
autoFillAC.setListAndField(['Blue']);
