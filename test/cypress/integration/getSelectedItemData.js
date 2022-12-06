// Tests for the getSelectedItemData function
var po = require('../autocompPage.js');

/**
 *  Calls getSelectedItemData in the browser on the autocompleter associated
 *  with the field with fieldID, and returns the promise for the result.
 * @param fieldID the ID of the field whose data is being checked
 */
function getSelectedItemData(fieldID) {
  return browser.executeScript("return $('#"+fieldID+
    "')[0].autocomp.getSelectedItemData()");
}

describe('getSelectedItemData', () => {
  describe('single select prefetch lists', () => {
    var listFieldID = po.prefetchCWEID;
    var listField = po.prefetchCWE;
    it('should return null when there is nothing in the field', () => {
      po.openTestPage();
      listField.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for off-list items', () => {
      po.sendKeys(listField, 'zzz');
      po.nonField.click();
      expect(getSelectedItemData(listFieldID)).toEqual([{text: 'zzz'}]);
    });

    it('should return null if the field is erased', () => {
      po.clearField(listField);
      po.nonField.click();
      expect(listField.getAttribute('value')).toEqual('');
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for on-list items', ()=> {
      listField.click();
      po.autocompPickFirst(listField);
      expect(getSelectedItemData(listFieldID)).toEqual(
        [{"text":"Spanish","code":"LA44-3"}]);
    });

    it('should return different data when the list item changes', ()=>{
      po.prefetchCWE.click();
      po.autocompPickNth(listField, '', 2);
      expect(getSelectedItemData(listFieldID)).toEqual(
        [{"text":"French","code":"LA45-0"}]);
    });
  });


  describe('multi-select prefetch lists', () => {
    let listFieldID = po.multiPrefetchCWEID;
    let listField = po.multiPrefetchCWE;
    let selectedItemRemoveButton = po.multiPrefetchCWEFirstSelected;
    it('should return null when there is nothing entered', () => {
      po.openTestPage();
      listField.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for off-list items', () => {
      po.sendKeys(listField, 'zzz');
      po.nonField.click();
      expect(getSelectedItemData(listFieldID)).toEqual([{text: 'zzz'}]);
    });

    it('should return null if the items are removed', () => {
      selectedItemRemoveButton.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for on-list items', ()=> {
      listField.click();
      po.autocompPickFirst(listField);
      // Also testing here multiple selections
      po.autocompPickFirst(listField);
      expect(getSelectedItemData(listFieldID)).toEqual(
        [{"text":"Spanish","code":"LA44-3"},{"text":"French","code":"LA45-0"}]);
    });
  });

  describe('single select search lists', () => {
    var listFieldID = 'fe_search0_cwe';
    var listField = $('#'+listFieldID);
    it('should return null when there is nothing in the field', () => {
      po.openTestPage();
      listField.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for off-list items', () => {
      po.sendKeys(listField, 'zzz');
      po.nonField.click();
      expect(getSelectedItemData(listFieldID)).toEqual([{text: 'zzz'}]);
    });

    it('should return null if the field is erased', () => {
      po.clearField(listField);
      po.nonField.click();
      expect(listField.getAttribute('value')).toEqual('');
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for on-list items', ()=> {
      listField.click();
      po.autocompPickFirst(listField, 'ar');
      expect(getSelectedItemData(listFieldID)).toEqual(
        [{ code: '2958', text: 'Arm pain', data: { term_icd9_code: '729.5' },
        code_system: 'gopher' }]);
    });

    it('should return different data when the list item changes', ()=>{
      po.prefetchCWE.click();
      po.autocompPickNth(listField, 'ar', 2);
      expect(getSelectedItemData(listFieldID)).toEqual(
        [{code: '2212',
        text: 'Coronary artery disease (CAD)', data: { term_icd9_code: '414.9' },
        code_system: 'gopher' }]);
    });
  });

  describe('multi-select search lists', ()=>{
    let listFieldID = po.multiSearchCWEID;
    let listField = po.multiSearchCWE;
    let selectedItemRemoveButton = po.multiSearchCWEFirstSelected;
    it('should return null when there is nothing entered', () => {
      po.openTestPage();
      listField.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for off-list items', () => {
      po.sendKeys(listField, 'zzz');
      po.nonField.click();
      expect(getSelectedItemData(listFieldID)).toEqual([{text: 'zzz'}]);
    });

    it('should return null if the items are removed', () => {
      selectedItemRemoveButton.click();
      expect(getSelectedItemData(listFieldID)).toBeNull();
    });

    it('should return data for on-list items', ()=> {
      po.prefetchCWE.click();
      po.autocompPickFirst(listField, 'ar');
      // Also testing here multiple selections
      po.autocompPickFirst(listField, 'ar');
      expect(getSelectedItemData(listFieldID)).toEqual([{code: '2212',
        text: 'Coronary artery disease (CAD)', data: { term_icd9_code: '414.9' },
        code_system: 'gopher' },
        { code: '2958', text: 'Arm pain', data: { term_icd9_code: '729.5' },
        code_system: 'gopher' }]);
    });
  });



});
