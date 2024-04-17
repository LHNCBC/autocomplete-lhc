// Wrap the code in a function so we can safely redefine $.
(function() {

  var $ = Def.PrototypeAPI.$;

  var fe_strength_and_form_1_autoComp =
   new Def.Autocompleter.Prefetch('fe_strength_and_form_1', [],
     {'matchListValue': false, 'codes': []});

  var fe_other_list_field_autoComp =
   new Def.Autocompleter.Prefetch('fe_other_list_field',
     ['oranges and apples', 'apples', 'pears and (apples)', 'bananas', 'spinach'],
     {'matchListValue': false, 'addSeqNum': false,
      'codes': ['oa', 'a', 'pa', 'b', 's'],
      'dataRequester': new Def.RecordDataRequester($('fe_other_list_field'),
           '/someurl', ['fe_record_id'], ['fe_code', 'fe_pseudonym'])});

  // A list where a match is required
  var fe_other_list_field2_autoComp =
   new Def.Autocompleter.Prefetch('fe_other_list_field2',
     ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
     {'addSeqNum': false, 'codes': ['a', 'oa', 'pa', 'b'],
      'matchListValue': true});

  // A prefetch list that has more than the maximum number of items to show
  var fe_big_list_autoComp =
   new Def.Autocompleter.Prefetch('fe_big_list',
     ['a one', 'a two', 'a three', 'a four', 'a five', 'a six', 'a seven',
      'a eight', 'a nine', 'a ten', 'a eleven', 'a twelve', 'a thirteen',
      'a fourteen', 'a fifteen', 'sixteen'],
     {'matchListValue': false, 'addSeqNum': false});

  // A list that adds sequence numbers
  var fe_seq_num_list_autoComp =
   new Def.Autocompleter.Prefetch('fe_seq_num_list',
     ['apples', 'oranges and apples', 'pears and (apples)', 'bananas'],
     {'codes': ['a', 'oa', 'pa', 'b']});

  // A Search autocompleter
  var fe_search_test_autoComp = new Def.Autocompleter.Search('fe_search_test',
     {'matchListValue': true, 'url': '/someurl'});

  var aspirin_table = [['Caps', '325 MG'].join(' - '),
                         ['Chewable Tabs',' 65 MG'].join(' - '),
                         ['Chewable Tabs', '75 MG'].join(' - '),
                         ['Chewable Tabs', '81 MG'].join(' - '),
                         ['Chewable', '81 MG'].join(' - '),
                         ['Disintegrating Tabs', '81 MG'].join(' - '),
                         ['Tabs', '81 MG'].join(' - '),
                         ['Tabs', '325 MG'].join(' - '),
                         ['Tabs', '800 MG'].join(' - '),
                         ['Tabs', '650 MG'].join(' - '),
                         ['Tabs', '165 MG'].join(' - '),
                         ['Tabs', '300 MG'].join(' - '),
                         ['Tabs', '486 MG'].join(' - '),
                         ['Tabs', '500 MG'].join(' - ')] ;
  var fe_strength_and_form_2_autoComp =
    new Def.Autocompleter.Prefetch('fe_strength_and_form_2',
     aspirin_table,
     {'addSeqNum': false, 'matchListValue': true,
      'codes': ['1','2','3','4','5','6','7','8','9','10','11','12','13','14']});


  document.querySelector("#myModal").addEventListener('shown.bs.modal', function() {
    // Manually produce the LF-2681 issue that is caused by Angular mat-dialog.
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.top = '-1000.2px';

    var opts = {};
    opts['matchListValue']=true
    opts['codes']=["LA6155-1","LA6156-9","LA6162-7","LA6214-6","LA6266-6","LA4457-3","LA4489-6"]
    opts['autoFill']=true
    var raceList = ["American Indian or Alaska Native","Asian","Black or African-American",
      "Hispanic or Latino","Native Hawaiian or Pacific Islander","White",
      "Unknown"];
    var fe_race_or_ethnicity_autoComp_on_modal = new
    Def.Autocompleter.Prefetch('race_or_ethnicity_on_modal', raceList, opts);
  });


})();
