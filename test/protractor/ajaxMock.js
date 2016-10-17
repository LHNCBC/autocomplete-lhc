// Mocks AJAX calls for the tests.

// mockData_ holds the fake AJAX data.  Its structure is
//   mockData_[fd_id][partial || full || suggest][user text]
// The "fd_id" is just an identifier put in the URL to distinguish between the
// different fields.
mockData_ = {
  '1284': { // fe_search_cne
    'partial': {
      'ar' : '[65,["5398","2910","154","4077","1051","4836","5529"],{"term_icd9_code":["042","518.82","704.01","","284.9","424.1","322.9"]},[["AIDS-related complex"],["Adult respiratory distress syndrome (ARDS)"],["Alopecia areata"],["Androblastoma"],["Anemia - refractory"],["Aortic insufficiency"],["Arachnoiditis"]],false]',
      'abc': '[2,["2212","2958"],{"term_icd9_code":["414.9","729.5"], "other_field": ["blue", "green"]},[["Coronary artery disease (CAD)"],["zArm pain"]],false]',
      'pickw' : '[1,["1848"],{"term_icd9_code":["278.8"]},[["Pickwickian syndrome"]],false]',
      'ab - c': // LIST_ITEM_FIELD_SEP currently = ' - '
        '[2,["2214","2956"],null,[["CAD2"],["zArm pain2"]],false]',
      'ab c':
        '[2,["2215","2957"],null,[["CAD3"],["zArm pain3"]],false]',
     },
    'full' : {
      'ar' :'[65,["5398","2910","154","4077","1051","4836","5529","3406","2119","3140","386","486","2713","1461","4716","615","5692","1610","2266","5652","945","5754","1446","1613","5060","5795","246","2125","5361","1171","4087","685","2709","4631","3040","4347","2636","5448","419","4804","371","3150","4778","5010","1322","4787","86","2232","3922","3052","4271","3971","3537","1087","34","106","204","4521","4477","2898","5545","5860","5868","4977","4656"],{"term_icd9_code":["042","518.82","704.01","","284.9","424.1","322.9","887.2","729.5","427.9","440.9","447.0","","747.60","","","","098.50","696.0","711.90","","","427.5","V45.01","433.10","","414.9","290.40","379.91","446.5","","35.20","","812.20","719.40","714.30","692.4","584.9","","","","403.90","747.0","","","099.3","440.1","799.1","","362.31","390","714.0","959.2","427.9","473.8","","446.7","446.5","524.60","414.00","274.0","","","","427.9"]},[["AIDS-related complex"],["Adult respiratory distress syndrome (ARDS)"],["Alopecia areata"],["Androblastoma"],["Anemia - refractory"],["Aortic insufficiency"],["Arachnoiditis"],["Arm amputation"],["Arm pain"],["Arrhythmia"],["Arteriosclerosis"],["Arteriovenous (AV) fistula"],["Arteriovenous fistula surgery"],["Arteriovenous malformation (AVM)"],["Arteriovenous shunt"],["Artery surgery"],["Arthritis"],["Arthritis - gonococcal"],["Arthritis - psoriatic"],["Arthritis - septic"],["Arthrocentesis"],["Arthroscopy"],["Cardiac arrest"],["Cardiac pacemaker"],["Carotid artery disease"],["Coronary artery angioplasty/stenting"],["Coronary artery disease (CAD)"],["Dementia - multi-infarction"],["Eye pain"],["Giant cell arteritis"],["Hand/arm surgery"],["Heart valve - mechanical"],["Hip arthroplasty - total"],["Humerus fracture"],["Joint pain (arthralgia)"],["Juvenile rheumatoid arthritis (JRA)"],["Keratosis - arsenical"],["Kidney failure (short-term renal failure)"],["Knee arthroplasty - total"],["Lyme arthritis"],["Myeloid maturation arrest"],["Nephrosclerosis - arteriolar"],["Patent ductus arteriosus (PDA)"],["Pulmonary artery - large"],["Pulmonary artery hypertension (PAH)"],["Reiter\'s syndrome"],["Renal artery stenosis"],["Respiratory arrest"],["Resuscitation after cardiac arrest"],["Retinal central artery occlusion"],["Rheumatic fever"],["Rheumatoid arthritis (RA)"],["Shoulder or upper arm injury"],["Sinus arrhythmia"],["Sinus tenderness"],["Spermatogenic arrest"],["Takayasu\'s arteritis"],["Temporal arteritis"],["Temporomandibular arthritis"],["Three vessel coronary artery disease"],["Tophus"],["Transposition of the great arteries (TGA)"],["Truncus arteriosus (TA)"],["Urinary sphincter - artificial"],["Ventricular arrhythmia"]],false]'
    }
  },
  '1285': { // fe_search_button_cne
    'partial': {
      'ab': '[87,["3982","2296","2167","9853","9706","4316","13006"],{"term_icd9_code":["789.00","682.9","305.00","626.9","522.5","789.06","634.90"]},[["Abdominal pain"],["Abscess"],["Abuse - alcohol"],["Uterine bleeding - abnormal"],["Tooth abscess"],["Epigastric pain"],["Miscarriage"]],false]',
      'car': '[70,["461","4632","3140","294","5021","1505","5008"],{"term_icd9_code":["199.1","413.9","427.9","35.20","986","680.9","259.2"]},[["Adenosquamous carcinoma"],["Angina pectoris"],["Arrhythmia"],["Bioprosthetic heart valve"],["Carbon monoxide toxicity"],["Carbuncle"],["Carcinoid syndrome"]],false]',
      'pickw' : '[1,["1848"],{"term_icd9_code":["278.8"]},[["Pickwickian syndrome"]],false]'
    },
    'full': {
      'ab': '[96,["337","5309","1060","1412","1863","5689","1535","3610","5824","1383","2673","4594","592","650","2809","1399","4002","5340","1850","1979","5691","457","2651","3454","482","3140","2129","5445","3860","1800","3073","1762","7","3912","2733","1773","1885","4957","1453","3776","4851","1174","5745","1572","107","946","1059","5265","3518","5684","5767","837","319","5134","594","1274","3267","3644","3592","315","2170","842","5449","2590","4387","4489","3224","3953","2387","5618","2151","1567","2462","3726","5155","15","1087","894","5870","832","2262","4763","4761","895","3372","4870","5401","327","2756","2275","1886","5752","5746","5747","2271","577"],{"term_icd9_code":["","","682.2","441.4","785.9","","789.30","789.00","","","272.5","756.0","742.1","637.90","897.2","682.9","","626.0","273.8","305.00","","305.01","305.70","283.0","424.1","427.9","789.5","995.81","","324.0","611.0","995.50","305.1","305.60","305.62","789.09","918.1","527.9","305.90","305.90","300.9","789.06","","","787.3","","790.21","611.1","","","","593.89","478.79","478.29","305.90","572.0","794.8","781.1","526.4","634.90","305.90","614.2","V76.2","","344.1","607.89","590.2","523.30","566","513.0","753.9","590.2","567.21","478.24","641.20","V71.5","427.9","378.54","","","","759.0","289.59","","682.0","","789.09","995.50","246.9","475","522.5","","","","626.9","783.21"]},[["AAA repair"],["ABO incompatibility"],["Abdominal abscess"],["Abdominal aneurysm"],["Abdominal bruit"],["Abdominal colic"],["Abdominal mass"],["Abdominal pain"],["Abdominal paracentesis"],["Abdominal surgery"],["Abetalipoporteinemia"],["Abnormally large head (macrocephaly)"],["Abnormally small head (microcephaly)"],["Abortion"],["Above knee amputation (AKA)"],["Abscess"],["Abscess drainage"],["Absence of menstrual periods (amenorrhea)"],["Absence of transferrin"],["Abuse - alcohol"],["Adult abuse"],["Alcohol abuse - continuous"],["Amphetamine abuse"],["Anemia - autoimmune hemolytic"],["Aortic valve abnormality"],["Arrhythmia"],["Ascites"],["Battered person"],["Blood group AB positive"],["Brain abscess"],["Breast abscess"],["Child abuse"],["Cigarette smoker"],["Cocaine abuse"],["Cocaine abuse - episodic"],["Colic - infantile"],["Corneal abrasions"],["Dental/mouth abnormality"],["Drug abuse - IV"],["Drug abuse - mixed"],["Emotional disorder"],["Epigastric pain"],["Feces - abnormal"],["Fetal abdominal wall defect (omphalocele)"],["Flatulence (gas)"],["Gastrointestinal motility disorder"],["Glucose intolerance"],["Gynecomastia"],["Heroin abuse"],["Hysterectomy - total abdominal"],["Incision and drainage (I\u0026D) of abscess"],["Kidney - absent"],["Laryngeal abscess"],["Lateral pharyngeal space abscess"],["Laxative abuse"],["Liver (hepatic) abscess"],["Liver (hepatic) function tests abnormal"],["Loss of smell (anosmia)"],["Maxillofacial abscess"],["Miscarriage"],["Narcotic abuse"],["Ovarian abscess"],["Pap smear - abnormal"],["Paracentesis"],["Parapharyngeal abscess"],["Penis disorder"],["Perinephric abscess"],["Periodontal abscess"],["Perirectal abscess"],["Pulmonary abscess"],["Renal abnormality - congenital"],["Renal abscess"],["Retroperitoneal abscess"],["Retropharyngeal abscess"],["Separation of placenta from uterus (abruption)"],["Sexual abuse"],["Sinus arrhythmia"],["Sixth (abducens) nerve palsy"],["Skin pigment - absent or very little (albinism)"],["Small bowel abnormality"],["Spinal epidural abscess"],["Spleen - absent (asplenia)"],["Splenic abscess"],["Subdural empyema"],["Submandibular space abscess"],["Subphrenic abscess"],["Suprapubic pain"],["Suspected child abuse"],["Thyroid abnormality other"],["Tonsillar abscess"],["Tooth abscess"],["Tummy tuck (abdominoplasty)"],["Uric acid abnormality"],["Urine - abnormal"],["Uterine bleeding - abnormal"],["Weight loss"]],false]'
    }
  },
  '2163': { // fe_search_cwe
    'partial': {
      'knee' : '[12,["2809","547","419","1486","4145","2031","4795"],{"term_icd9_code":["897.2","897.0","","","","822.0","719.46"]},[["Above knee amputation (AKA)"],["Below knee amputation (BKA)"],["Knee arthroplasty - total"],["Knee derangement - internal"],["Knee dislocation"],["Knee fracture"],["Knee pain"]],false]',
      'Knee Pain': '[1,["4795"],{"term_icd9_code":["719.46"]},[["Knee pain"]],false]',
      'ab' : '[87,["3982","2296","2167","9853","9706","4316","13006"],{"term_icd9_code":["789.00","682.9","305.00","626.9","522.5","789.06","634.90"]},[["Abdominal pain"],["Abscess"],["Abuse - alcohol"],["Uterine bleeding - abnormal"],["Tooth abscess"],["Epigastric pain"],["Miscarriage"]],false]',
      'ar': '[52,["2212","2958","2189","2319","29959","11458","2311"],{"term_icd9_code":["414.9","729.5","379.91","719.40","959.2","584.9","714.0"]},[["Coronary artery disease (CAD)"],["Arm pain"],["Eye pain"],["Joint pain (arthralgia)"],["Shoulder or upper arm injury"],["Kidney failure (short-term renal failure)"],["Rheumatoid arthritis (RA)"]],false]',
      'arm': '[52,["2212","2958","2189","2319","29959","11458","2311"],'+
             '{"term_icd9_code":["414.9","729.5","379.91","719.40","959.2",'+
             ' "584.9","714.0"]},'+
             '[["Coronary artery disease (CAD)"],["Arm painzzzzz"],["Eye pain"],'+
             ' ["Arm z"],["Shoulder or upper arm injury"],'+
             ' ["Kidney failure (short-term renal failure)"],'+
             ' ["Rheumatoid arthritis (RA)"]],false]'
    },
    'full' : {
      'ar' : '[52,["2212","2958","2189","2319","29959","11458","2311","9893","21729","5631","18602","9728","2216","2886","8353","6546","1988","6701","22663","5396","3860","8344","2956","2323","11397","8342","10684","9594","8640","8311","8337","11077","4351","10856","10552","5838","9131","11524","13949","10728","11105","11114","10008","10357","4737","8785","2894","8752","3717","X43","X203","X211"],{"term_icd9_code":["414.9","729.5","379.91","719.40","959.2","584.9","714.0","812.20","704.01","427.5","414.00","433.10","427.9","424.1","696.0","711.90","","714.30","290.40","799.1","440.1","524.60","446.5","099.3","427.9","518.82","274.0","473.8","427.9","098.50","446.7","440.9","447.0","284.9","446.5","747.60","042","403.90","322.9","","","692.4","362.31","","390","","747.0","","","","",""]},[["Coronary artery disease (CAD)"],["Arm pain"],["Eye pain"],["Joint pain (arthralgia)"],["Shoulder or upper arm injury"],["Kidney failure (short-term renal failure)"],["Rheumatoid arthritis (RA)"],["Humerus fracture"],["Alopecia areata"],["Cardiac arrest"],["Three vessel coronary artery disease"],["Carotid artery disease"],["Arrhythmia"],["Aortic insufficiency"],["Arthritis - psoriatic"],["Arthritis - septic"],["Pulmonary artery hypertension (PAH)"],["Juvenile rheumatoid arthritis (JRA)"],["Dementia - multi-infarction"],["Respiratory arrest"],["Renal artery stenosis"],["Temporomandibular arthritis"],["Temporal arteritis"],["Reiter\'s syndrome"],["Sinus arrhythmia"],["Adult respiratory distress syndrome (ARDS)"],["Tophus"],["Sinus tenderness"],["Ventricular arrhythmia"],["Arthritis - gonococcal"],["Takayasu\'s arteritis"],["Arteriosclerosis"],["Arteriovenous (AV) fistula"],["Anemia - refractory"],["Giant cell arteritis"],["Arteriovenous malformation (AVM)"],["AIDS-related complex"],["Nephrosclerosis - arteriolar"],["Arachnoiditis"],["Spermatogenic arrest"],["Myeloid maturation arrest"],["Keratosis - arsenical"],["Retinal central artery occlusion"],["Androblastoma"],["Rheumatic fever"],["Arteriovenous shunt"],["Patent ductus arteriosus (PDA)"],["Lyme arthritis"],["Pulmonary artery - large"],["Arthritis"],["Transposition of the great arteries (TGA)"],["Truncus arteriosus (TA)"]],false]'
    },
    'suggest' : {
      'ar' : '[["2886"],[["Aortic insufficiency"]], {"term_icd9_code": ["424.1"]}]',
      'ab - c' : '[["1"],[["Green"]]]',
      'ab c' : '[["1"],[["Blue"]]]',
    }
  },

  '2164': { // multi-column
    'partial': {
      'ar': '[9,["2212","2958","2189","2319","29959","11458","2311"],'+
               '{"term_icd9_code":["414.9","729.5","379.91","719.40","959.2","584.9","714.0"]},'+
               '[["CAD", "Coronary artery disease"],["Arm pain", "pain in arm"],'+
               '["Eye pain", "pain in eye"],["Arm z", "z for zebra"],'+
               '["suaj", "Shoulder or upper arm injury"],'+
               '["kf", "Kidney failure (short-term renal failure)"],'+
               '["RA", "Rheumatoid arthritis"]],false]'
    },
    'full' : {
      'ar': '[9,["2212","2958","2189","2319","29959","11458","2311","9893",'+
                   '"21729"],'+
               '{"term_icd9_code":["414.9","729.5","379.91","719.40","959.2",'+
                   '"584.9","714.0","812.20","704.01"]},'+
               '[["CAD", "Coronary artery disease"],["Arm pain", "pain in arm"],'+
               '["Eye pain", "pain in eye"],["Arm z", "z for zebra"],'+
               '["suaj", "Shoulder or upper arm injury"],'+
               '["kf", "Kidney failure (short-term renal failure)"],'+
               '["RA", "Rheumatoid arthritis"], ["Hf", "Humerus fracture"],'+
               '["Al. ar.", "Alopecia areata"]],false]',
    }
  },

  '2165': { // narrow, single column
    'partial': {
      'ar': '[260,["39816","15607","37252","25968","25516","15550","692"],null,'+
        '[["NR_046516"],["NM_001113511"],["NM_001145451"],["NM_017700"],'+
        '["NM_001278529"],["NM_016374"],["NM_001177"]]]'
    },
    'full' : {
      'ar': '[14,["2634","435","39027","429","13742","431","434","430","433",'+
         '"436","432","13743","44238","3604"],null,[["NM_000775"],'+
         '["NM_001256153"],["NG_028727"],["NM_000697"],["NG_009476"],'+
         '["NG_000844"],["NM_001039130"],["NM_001139"],["NM_001140"],'+
         '["NM_001629"],["NR_002710"],["NM_021628"],["NG_026215"],'+
         '["NM_001999"]]]'
    }
  },

  'alleles': {
    'partial': {
      'rs':
         '[110336,["20644","20663","20668","20665","20680","20685","20694"],'+
         '{"RefSeqID":["NM_012144.3","NM_001099274.1","NM_000154.1","NM_001099274.1",'+
         '"NM_000030.2","NM_000030.2","NM_005807.4"],"GeneSymbol":["DNAI1","TINF2",'+
         '"GALK1","TINF2","AGXT","AGXT","-"]},[["20644","NM_012144.3","DNAI1",'+
         '"c.282_283insAATA","p.Gly95Asnfs"],["20663","NM_001099274.1","TINF2",'+
         '"c.838A>G","p.Lys280Glu"],["20668","NM_000154.1","GALK1","c.238G>T",'+
         '"p.Glu80Ter"],["20665","NM_001099274.1","TINF2","c.844C>A","p.Arg282Ser"],'+
         '["20680","NM_000030.2","AGXT","c.32C>T","p.Pro11Leu"],["20685","NM_000030.2",'+
         '"AGXT","c.731T>C","p.Ile244Thr"],["20694","NM_005807.4","-",'+
         '"c.4190_4191delCCinsAG","p.Ser1397Ter"]]]'
    }
  }

};

// Mock the Ajax call.  We are only trying to test the JavaScript side here.
jQuery.ajax = function(url, options) {
  var params = options.data;
  var resultType =
    params.suggest ? 'suggest' : params.maxList === undefined ? 'partial' : 'full';
  // This is just for testing, so assume the right parameters.
  var fd_id = url.match(/fd_id=(\w+)/)[1];
  var terms = params.terms || params.field_val; // suggest uses field_val
  var responseText = mockData_[fd_id][resultType][terms];
  if (!responseText) {
    if (params.suggest === '1')
      responseText = '[[],[]]';
    else
      responseText = '[0,[],null,[],false]';
  }

  var response = {};
  response.request = this;
  this.options = options;
  response.status = 200;
  response.responseText = responseText;
  response.responseJSON = JSON.parse(responseText);
  setTimeout(function() {options.complete(response);}, 1);
  return response;
};
// end of mock for Ajax.Request
