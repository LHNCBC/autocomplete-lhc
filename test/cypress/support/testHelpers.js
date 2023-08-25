// Test helper functions.  The purpose is both the simplify the test code and to
// hide the particular test framework being used (which might very well change
// yet again).

import {deepEqual} from 'deep-equal';

/**
 *  Creates a Cypress modifier string for the given modifier keys.
 * @param modifiers an array of modifier key values from
 * TestHelpers.prototype.KeyModifiers.
 */
function modifierString(modifiers) {
  let rtn = '';
  if (modifiers) {
    modifiers.forEach((modifier)=>{
      switch(modifier) {
        case TestHelpers.prototype.KeyModifiers.CONTROL:
          rtn += '{control}';
          break;
        case TestHelpers.prototype.KeyModifiers.SHIFT:
          rtn += '{shift}';
          break;
      }
    });
  }
  return rtn;
}

export class TestHelpers {
  /**
   *  Asserts that the given field has the given value.
   * @param field the CSS selector for a field
   * @param value the expected value
   */
  assertFieldVal(field, value) {
    cy.get(field).should('have.value', value);
  }


  /**
   *  Asserts that the given field does not have the given value.
   * @param field the CSS selector for a field
   * @param value the expected value
   */
  assertNotFieldVal(field, value) {
    cy.get(field).should('not.have.value', value);
  }

  /**
   *  Asserts that the given promise resolves to the given value.
   * @param promise the promise to resolve
   * @param value the expected value
   */
  assertPromiseVal(promise, value) {
    promise.should('deep.equal', value);
  }


  /**
   *  Asserts that the given promise resolves to a value greater than the given value.
   * @param promise the promise to resolve
   * @param value the value that should be less than the promise value
   */
  assertPromiseValGT(promise, value) {
    promise.should('be.greaterThan', value);
  }


  /**
   *  Asserts that the field has an attribute with the given value.
   * @param field the CSS selector for a field
   * @param attr the attribute name
   * @param value the expected attribute value.  If this is
   *  null, the assertion is changed to assert the absence of the attribute.
   */
  assertAttrVal(field, attr, value) {
    if (value === null)
      cy.get(field).should('not.have.attr', attr);
    else
      cy.get(field).should('have.attr', attr, value);
  }


  /**
   *  Asserts that the start of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selStart the expected selection start position
   */
  assertSelectionStart(field, selStart) {
    cy.get(field).then(el=>expect(el[0].selectionStart).to.equal(selStart));
  }


  /**
   *  Asserts that the end of the selection range in the given field equals
   *  the given value.
   * @param field the CSS selector for a field
   * @param selEnd the expected selection end position
   */
  assertSelectionEnd(field, selEnd) {
    cy.get(field).then(el=>expect(el[0].selectionEnd).to.equal(selEnd));
  }


  /**
   *  Asserts that the given element has the given CSS class.
   * @param field the CSS selector for a field, or the test framework's concept
   *  of an element.
   * @param cls the CSS class to assert
   */
  assertCSSClass(field, cls) {
    (typeof field == 'string' ? cy.get(field) : field).should('have.class', cls);
  }

  /**
   *  Asserts that the given element does not have the given CSS class.
   * @param field the CSS selector for a field, or the test framework's concept
   *  of an element.
   * @param cls the CSS class to assert is not there
   */
  assertNotCSSClass(field, cls) {
    (typeof field == 'string' ? cy.get(field) : field).should('not.have.class', cls);
  }


  /**
   *  Asserts that the given element is visible.
   * @param elemSel the CSS selector for the element.
   */
  assertElemVisible(elemSel) {
    cy.get(elemSel).should('be.visible');
  }


  /**
   *  Asserts that the given element is not visible.
   * @param elemSel the CSS selector for the element.
   */
  assertElemNotVisible(elemSel) {
    cy.get(elemSel).should('not.be.visible');
  }


  /**
   *  Clicks in the given field.  By default, the viewport will be scrolled to move the
   *  element to the top of the window.
   * @param field the CSS selector for an element, or a element that can be clicked
   * @param options {scrollBehavior: false} will disable scrolling.
   */
  click(field, options) {
    (typeof field == 'string' ? cy.get(field) : field).click(options);
  }


  /**
   *  Causes the given field to lose its focus.  The field should have focus
   *  before this is called.
   * @param elemSel the CSS selector for an element
   */
  blur(elemSel) {
    cy.get(elemSel).blur();
  }


  /**
   *  Executes the given code in the context of the application.
   * @param code either a string of JavaScript (the body of a function) or a function.  If it is
   *  function, it is expected to take the window object as its first parameter.
   * @return a promise which resolves to the return value of the code
   */
  executeScript(code) {
    // Make the "window" object available.
    return cy.window().then(win=>{
      if (typeof code === 'string') {
        // Use "with" (deprecrated, but currently with wide support) to make the
        // window object the default object.
        code = new Function('window', 'with(window) {'+code+'}');
      }
      let rtn = code(win);
      // If we return undefined, then it returns "window", so return null
      // instead (which is hopefully less confusing).
      return rtn === undefined ? null : rtn;
    });
  }


  /**
   *  Repeatedly executes the the given code in the context of the application,
   *  until the script evaluates (via eval) to the given expected value.
   * @param code A string of JavaScript one which eval will be run.
   */
  waitForEval(code, expectedValue) {
    var script = code.replace(/"/g, '\\"')
    return cy.window().then(win=> {
      let withWinFn = new Function('window', 'with(window) {return eval("'+script+'")}');
      let promiseFn = function() {
        return withWinFn(win);
      }
      return cy.waitForPromiseVal(promiseFn, expectedValue);
    });
  }


  /**
   *  Clears the given field.
   * @param field the CSS selector for an element
   * @return (debugging only) the Cypress promise
   */
  clear(field) {
    //cy.get(field).clear();
    return cy.get(field).clear();
  }


  /**
   *  Types the given text string in the given field.  Assumes the field is
   *  already focused, and does not clear the field before typing.
   * @param field the CSS selector for a field
   * @param text the text to be typed
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   * in the array should be members of the KeyModifiers object which is part of this
   * object.
   */
  type(field, text, modifiers) {
    cy.get(field).type(modifierString(modifiers) + text);
  }


  /**
   *  Sends a down arrow event to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   * in the array should be members of the KeyModifiers object which is part of this
   * object.
   */
  downArrow(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{downArrow}');
  }


  /**
   *  Sends an up arrow event to the given field
   * @param field the CSS selector for a field
   */
  upArrow(field) {
    cy.get(field).type('{upArrow}');
  }


  /**
   *  Sends a right arrow event to the given field
   * @param field the CSS selector for a field
   */
  rightArrow(field) {
    cy.get(field).type('{rightArrow}');
  }


  /**
   *  Sends a left arrow event to the given field
   * @param field the CSS selector for a field
   */
  leftArrow(field) {
    cy.get(field).type('{leftArrow}');
  }


  /**
   *  Sends a backspace key to the given field
   * @param field the CSS selector for a field
   */
  backspace(field) {
    cy.get(field).type('{backspace}');
  }

  /**
   *  Sends a page down key to the given field
   * @param field the CSS selector for a field
   */
  pageDown(field) {
    cy.get(field).type('{pageDown}');
  }

  /**
   *  Sends a page up key to the given field
   * @param field the CSS selector for a field
   */
  pageUp(field) {
    cy.get(field).type('{pageUp}');
  }

  /**
   *  Sends an escape key to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   *  in the array should be members of the KeyModifiers object which is part of this
   *  object.
   */
  escapeKey(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{esc}');
  }

  /**
   *  Sends a shift key to the given field
   * @param field the CSS selector for a field
   */
  shiftKey(field) {
    cy.get(field).type('{shift}');
  }

  /**
   *  Sends a control keypress to the given field
   * @param field the CSS selector for a field
   */
  controlKey(field) {
    cy.get(field).type('{control}');
  }


  /**
   *  Sends an enter keypress to the given field
   * @param field the CSS selector for a field
   * @param modifiers an optional array of modifier keys to be sent.  Elements
   *  in the array should be members of the KeyModifiers object which is part of this
   *  object.
   */
  enterKey(field, modifiers) {
    cy.get(field).type(modifierString(modifiers) + '{enter}');
  }


  /**
   *  Reads a file and retuns a promise with its contents.
   * @param pathName the pathname of the file relative to the project root.
   * @param encoding the encoding of the file (default: utf-8)
   */
  readFile(pathName, encoding) {
    if (!encoding)
      encoding = 'utf-8';
    return cy.readFile(pathName, {encoding});
  }

  /**
   *  Opens the given web page.
   * @param url the URL to open
   */
  visit(url) {
    cy.visit(url);
  }


  /**
   *  Waits the given number of milliseconds before proceding.
   * @param waitTime the number milliseconds to wait
   */
  wait(waitTime) {
    cy.wait(waitTime);
  }
}

/**
 *  Constants to indicate key modifiers in use.
 *  This is defined on the prototype so subclasses can access it.
 */
TestHelpers.prototype.KeyModifiers = {
  CONTROL: 1,
  SHIFT: 2
};


/**
 *  Creates an input element with a unique ID.  The new element will be
 *  added to the page.
 *  @param win the window object
 *  @return the element
 */
export function createInputElement(win) {
  var $ = win.Def.PrototypeAPI.$;
  var rtnEle = win.document.createElement('input');
  rtnEle.setAttribute('type', 'text');
  var idBase = 'fe_e';
  var idVal = idBase;
  var idCtr = 0;
  while ($(idVal) != null)
    idVal = idBase + ++idCtr;
  rtnEle.setAttribute('id', idVal);
  win.document.forms[0].appendChild(rtnEle);
  return rtnEle;
}

/**
 *  Extracts the <li> values (without the tags) from a <ul> list, and
 *  returns them.
 * @param listHTML the HTML for the list
 */
export function extractListVals(listHTML) {
  var vals = [];
  var re = /<li[^>]*>(.*?)<\/li>/g;
  var matchData;
  while (matchData = re.exec(listHTML)) {
    vals.push(matchData[1]);
  }
  return vals;
}

/**
 *  Creates a field with a list with headings.
 * @return the autocompleter for the list.
 */
export function createListWithHeadings(win) {
  var element = createInputElement(win);
  var opts = {};
  opts['matchListValue']=false;
  opts['codes']=["26812","FOOD-2","FOOD-22","FOOD-4","FOOD-5","FOOD-7","FOOD-19","FOOD-16","FOOD-9","FOOD-10","FOOD-18","FOOD-12","FOOD-21","FOOD-13","FOOD-14","FOOD-17","FOOD-20","FOOD-22","FOOD-23","FOOD-24","26813","OTHR-18","OTHR-4","OTHR-5","OTHR-17","OTHR-6","OTHR-7","OTHR-1","OTHR-2","OTHR-8","OTHR-9","OTHR-10","OTHR-19","OTHR-11","OTHR-12","OTHR-13","OTHR-3","26814","DRUG-CLASS-1","DRUG-CLASS-2","DRUG-CLASS-3","DRUG-CLASS-4","DRUG-CLASS-5","DRUG-CLASS-6","DRUG-CLASS-7","DRUG-CLASS-8","DRUG-CLASS-9","DRUG-CLASS-10","DRUG-CLASS-11","DRUG-CLASS-12","DRUG-CLASS-13","DRUG-CLASS-14","DRUG-CLASS-15","DRUG-CLASS-16","DRUG-CLASS-24","DRUG-CLASS-17","DRUG-CLASS-18","DRUG-CLASS-19","DRUG-CLASS-20","DRUG-CLASS-21","DRUG-CLASS-22","DRUG-CLASS-23","26815","MED-57","MED-2","MED-97","MED-6","MED-7","MED-8","MED-55","MED-9","MED-10","MED-11","MED-13","MED-16","MED-99","MED-18","MED-19","MED-20","MED-21","MED-22","MED-23","MED-52","MED-88","MED-26","MED-28","MED-29","MED-30","MED-31","MED-32","MED-33","MED-35","MED-37","MED-64","MED-41","MED-42","MED-43","MED-44","MED-45","MED-46","MED-47","MED-48","MED-49","MED-50","MED-51","MED-36","MED-59","MED-98","MED-96","MED-61","MED-62","MED-65","MED-67","MED-68","MED-70","MED-71","MED-53","MED-72","MED-73","MED-74","MED-66","MED-75","MED-77","MED-79","MED-15","MED-82","MED-83","MED-84","MED-85","MED-86","MED-25","MED-87","MED-89","MED-90","MED-91","MED-92","MED-93","MED-94","MED-95"];
  opts['itemToHeading']={"FOOD-2":"26812","FOOD-22":"26812","FOOD-4":"26812","FOOD-5":"26812","FOOD-7":"26812","FOOD-19":"26812","FOOD-16":"26812","FOOD-9":"26812","FOOD-10":"26812","FOOD-18":"26812","FOOD-12":"26812","FOOD-21":"26812","FOOD-13":"26812","FOOD-14":"26812","FOOD-17":"26812","FOOD-20":"26812","FOOD-23":"26812","FOOD-24":"26812","OTHR-18":"26813","OTHR-4":"26813","OTHR-5":"26813","OTHR-17":"26813","OTHR-6":"26813","OTHR-7":"26813","OTHR-1":"26813","OTHR-2":"26813","OTHR-8":"26813","OTHR-9":"26813","OTHR-10":"26813","OTHR-19":"26813","OTHR-11":"26813","OTHR-12":"26813","OTHR-13":"26813","OTHR-3":"26813","DRUG-CLASS-1":"26814","DRUG-CLASS-2":"26814","DRUG-CLASS-3":"26814","DRUG-CLASS-4":"26814","DRUG-CLASS-5":"26814","DRUG-CLASS-6":"26814","DRUG-CLASS-7":"26814","DRUG-CLASS-8":"26814","DRUG-CLASS-9":"26814","DRUG-CLASS-10":"26814","DRUG-CLASS-11":"26814","DRUG-CLASS-12":"26814","DRUG-CLASS-13":"26814","DRUG-CLASS-14":"26814","DRUG-CLASS-15":"26814","DRUG-CLASS-16":"26814","DRUG-CLASS-24":"26814","DRUG-CLASS-17":"26814","DRUG-CLASS-18":"26814","DRUG-CLASS-19":"26814","DRUG-CLASS-20":"26814","DRUG-CLASS-21":"26814","DRUG-CLASS-22":"26814","DRUG-CLASS-23":"26814","MED-57":"26815","MED-2":"26815","MED-97":"26815","MED-6":"26815","MED-7":"26815","MED-8":"26815","MED-55":"26815","MED-9":"26815","MED-10":"26815","MED-11":"26815","MED-13":"26815","MED-16":"26815","MED-99":"26815","MED-18":"26815","MED-19":"26815","MED-20":"26815","MED-21":"26815","MED-22":"26815","MED-23":"26815","MED-52":"26815","MED-88":"26815","MED-26":"26815","MED-28":"26815","MED-29":"26815","MED-30":"26815","MED-31":"26815","MED-32":"26815","MED-33":"26815","MED-35":"26815","MED-37":"26815","MED-64":"26815","MED-41":"26815","MED-42":"26815","MED-43":"26815","MED-44":"26815","MED-45":"26815","MED-46":"26815","MED-47":"26815","MED-48":"26815","MED-49":"26815","MED-50":"26815","MED-51":"26815","MED-36":"26815","MED-59":"26815","MED-98":"26815","MED-96":"26815","MED-61":"26815","MED-62":"26815","MED-65":"26815","MED-67":"26815","MED-68":"26815","MED-70":"26815","MED-71":"26815","MED-53":"26815","MED-72":"26815","MED-73":"26815","MED-74":"26815","MED-66":"26815","MED-75":"26815","MED-77":"26815","MED-79":"26815","MED-15":"26815","MED-82":"26815","MED-83":"26815","MED-84":"26815","MED-85":"26815","MED-86":"26815","MED-25":"26815","MED-87":"26815","MED-89":"26815","MED-90":"26815","MED-91":"26815","MED-92":"26815","MED-93":"26815","MED-94":"26815","MED-95":"26815"};
  opts['suggestionMode']=0;
  opts['autoFill']=true;
  var items = ["Food allergies","Chocolate","Crab","Egg","Fish","Gluten","Milk","Monosodium Glutamate (MSG)","Peanut","Pork","Sesame","Shellfish","Shrimp","Soy","Tomatoes","Tree Nuts","Wheat","Cochineal extract (Carmine) red dye","FD\u0026C Blue No. 1 dye","FD\u0026C Yellow No. 2 dye","Environmental allergies","Cat","Cockroach","Cold Weather","Dog","Dust Mites","Hay Fever","Iodinated x-ray contrast","Latex","Mold","Nickel","Pet Dander","Pollen","Ragweed","Semen","Sun","Wasp, hornet, bee sting","Medication class allergies","ACE Inhibitors","Aminoglycosides","Antihistamines","Benzodiazepines","Beta Blockers","Calcium Channel Blockers","Cephalosporins","Diuretics","H2 Blockers","Insulins","Iodine Containing Medications","Local Anesthetics","Macrolides (like Erythromycin)","Muscle Relaxants, Skeletal","Narcotic Analgesics","Nonsteroidal Anti Inflam. Agents (NSAID)","Penicillin and Derivatives","Phenothiazines","Proton Pump Inhibitors","Quinolone Antibiotics","Serotonin Re-Uptake Inhibitors","Statins","Sulfa Drugs","Tetracycline","Medication allergies","ALEVE (Naproxen)","AMBIEN (Zolpedem)","Amoxicillin","Aspirin (ASA)","ATIVAN (Lorazapam)","ATROVENT (Ipartropium)","AVINZA (Morphine)","Bacitracin","BACTRIM (Sulfamethoxazol/trimethaprim)","BENADRYL (Diphenhydramine )","BUMEX (Bumetanide)","CARDIZEM (Diltizzam)","CEFZIL (Cefprozil)","CIPROFLOXACIN (Cipro)","Codeine","COLACE (Docusate Sodium)","COMPAZINE (Prochlorperazine Maleate)","COUMADIN (Warfarin)","DALMANE (Flurazepam)","DEMEROL (Meperidine)","DEPAKOTE ER (Valproic Acid)","DILANTIN (Phenytoin)","DULCOLAX (Bisacodyl)","E-MYCIN (Erythromycin)","GASTROGRAFIN(Diatrizoate Meglumine)","GLUCOPHAGE (Metformin)","HALCION (Triazolam)","HALDOL (Haloperidol)","HUMALIN (human insulin)","IMDUR (Isosorbide)","ISONIAZID (Isoniazide)","KAYEVELATE (Sodium Polystyrene Sulfonate)","KLONOPIN (Clonazepam)","Lactose","LASIX (Furosemide)","LEVAQUIN (Levofloxacin)","LIBRIUM (Chlordiazepoxide)","Lidocaine, Local","LIPITOR (Atorvastatin)","LOPRESSOR (Metroprolol)","LOVENOX (Enoxaparin)","MELLARIL (Thioridazine)","MOTRIN/ADVIL (Ibuprofen)","NORVASC (Amlodipine)","OMNICEF (Cefdinir)","Penicillin","PEPCID (Famotidine)","PERMITIL (Fluphenazine)","PLAVIX (Clopidogrel)","PREVACID (Lansoprazole)","PROLIXIN (Fluphenazine)","REGLAN (Metoclopramide)","RESTORIL (Temazepam)","ROBAXIN (Methocarbamol)","SENOKOT (Senna)","SERAX (Oxazepam)","SERENTIL (Mesoridazine)","SLOW-K (Potassium)","SOLU MEDROL (Methylprednisolone )","STELAZINE (Trifluoperazine)","SYNTHROID (Thyroxin)","TEGRETOL (Carbamazepine)","THORAZINE (Chlorpromazine)","TOPROL (Metoprolol)","TRANXENE (Clorazepate)","TRILAFON (Perphenazie)","TYLENOL (Acetaminophen)","VALIUM (Diastat)","VALIUM (Diazepam)","VASOTEC (Enalapril)","VITAMIN K1 (Phytonadione)","XANAX (Alprazolam)","ZAROXOLYN (Metolazone)","ZOLOFT (Sertraline)","ZOSYN (Piperacillin/Tazobactam)","ZYPREXA (Olanzapine)"];
  var autoComp = new win.Def.Autocompleter.Prefetch(element.id, items, opts);
  return autoComp;
}


