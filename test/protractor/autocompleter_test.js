// Use our own $ function
jQuery.noConflict();

var opts = {};
opts['matchListValue']=true
opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
opts['autoFill']=true
var fe_race_or_ethnicity_autoComp = new
  Def.Autocompleter.Prefetch('race_or_ethnicity', [
  "American Indian or Alaska Native","Asian","Black or African-American",
  "Hispanic or Latino","Native Hawaiian or Pacific Islander","White",
  "Unknown"], opts);
var opts = {};
opts['codes']=["LA44-3","LA45-0","LA46-8", "ZZZ"]
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['autoFill']=true
var fe_prefetch_cwe_autoComp = new Def.Autocompleter.Prefetch('prefetch_cwe',
  ["Spanish","French","Other", "escape<test>&"], opts);
var opts = {};
opts['matchListValue']=true
opts['autocomp']=true
var fe_search_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_cne',
    '/form/get_search_res_list?fd_id=1284', opts);

var opts = {'matchListValue': false, nonMatchSuggestions: true,
 'suggestionMode': Def.Autocompleter.SUGGEST_SHORTEST, 'autocomp': true};
new Def.Autocompleter.Search('fe_search_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.NO_COMPLETION_SUGGESTIONS, 'autocomp': true};
new Def.Autocompleter.Search('fe_search0_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {'matchListValue': false,
 'suggestionMode': Def.Autocompleter.USE_STATISTICS, 'autocomp': true};
new Def.Autocompleter.Search('fe_search2_cwe',
    '/form/get_search_res_list?fd_id=2163', opts);

var opts = {};
opts['matchListValue']=true
opts['suggestionMode']=Def.Autocompleter.SUGGEST_SHORTEST;
opts['buttonID']='fe_search_button_cne_button'
opts['autocomp']=true
var fe_search_button_cne_autoComp =
  new Def.Autocompleter.Search('fe_search_button_cne',
    '/form/get_search_res_list?fd_id=1285', opts);var opts = {};

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

// multi-select search list without match required
opts = {
  'matchListValue': false,
  'maxSelect': '*',
  'suggestionMode': Def.Autocompleter.USE_STATISTICS,
  'autocomp': true
};
new Def.Autocompleter.Search('multi_sel_search_cwe',
  '/form/get_search_res_list?fd_id=2163', opts);


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
new Def.Autocompleter.Search('allele_search',
    '/form/get_search_res_list?fd_id=alleles', opts);

// Lists to test passing an element instead of an ID.
opts = {};
opts['matchListValue']=true;
opts['codes']=["LA44-3","LA45-0","LA46-8"];
opts['defaultValue']="LA45-0";
new Def.Autocompleter.Prefetch(jQuery('#prefetch_for_el')[0], ["Spanish","French","Other"], opts);

var opts = {};
opts.matchListValue = true;
var fe_search_cne_autoComp =
  new Def.Autocompleter.Search(jQuery('#search_for_el')[0],
    '/form/get_search_res_list?fd_id=1284', opts);

