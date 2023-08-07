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
     {'matchListValue': true, 'url': '/someURL'});

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

  var listSelectionItemData_ = {};
  Def.Autocompleter.Event.observeListSelections(null, function(data) {
    listSelectionItemData_ = data;
  });

})();
