// Tests for the getSelectedItemData function
import { default as po } from '../support/autocompPage.js';

/**
 *  Calls getSelectedItemData in the browser on the autocompleter associated
 *  with the field with fieldID, and returns the promise for the result.
 * @param fieldID the ID of the field whose data is being checked
 */
function getSelectedItemData(fieldID) {
  return cy.get('#'+fieldID).then(elem=>{
    return elem.get(0).autocomp.getSelectedItemData();
  });
}

describe('getSelectedItemData', () => {
  describe('single select prefetch lists', () => {
    var listFieldID = po.prefetchCWEID;
    var listField = po.prefetchCWE;
    it('should return null when there is nothing in the field', () => {
      po.openTestPage();
      cy.get(listField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for off-list items', () => {
      cy.get(listField).type('zzz');
      cy.get(po.nonField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal([{text: 'zzz'}]));
    });

    it('should return null if the field is erased', () => {
      cy.get(listField).clear();
      cy.get(po.nonField).click();
      cy.get(listField).should('have.value', '');
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for on-list items', ()=> {
      cy.get(listField).click();
      po.autocompPickFirst(listField);
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{"text":"Spanish","code":"LA44-3"}]));
    });

    it('should return different data when the list item changes', ()=>{
      cy.get(listField).click();
      po.autocompPickNth(listField, '', 2);
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{"text":"French","code":"LA45-0"}]));
    });
  });


  describe('multi-select prefetch lists', () => {
    let listFieldID = po.multiPrefetchCWEID;
    let listField = '#' + po.multiPrefetchCWEID;
    let selectedItemRemoveButton = po.multiPrefetchCWEFirstSelected;
    it('should return null when there is nothing entered', () => {
      po.openTestPage();
      cy.get(listField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for off-list items', () => {
      cy.get(listField).type('zzz');
      cy.get(po.nonField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal([{text: 'zzz'}]));
    });

    it('should return null if the items are removed', () => {
      cy.get(selectedItemRemoveButton).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for on-list items', ()=> {
      cy.get(listField).click();
      po.autocompPickFirst(listField);
      // Also testing here multiple selections
      po.autocompPickFirst(listField);
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{"text":"Spanish","code":"LA44-3"},{"text":"French","code":"LA45-0"}]));
    });
  });

  describe('single select search lists', () => {
    var listFieldID = 'fe_search0_cwe';
    var listField = '#'+listFieldID;
    it('should return null when there is nothing in the field', () => {
      po.openTestPage();
      cy.get(listField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for off-list items', () => {
      cy.get(listField).type('zzz');
      cy.get(po.nonField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal([{text: 'zzz'}]));
    });

    it('should return null if the field is erased', () => {
      cy.get(listField).clear();
      cy.get(po.nonField).click();
      cy.get(listField).should('have.value', '');
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for on-list items', ()=> {
      cy.get(listField).click();
      po.autocompPickFirst(listField, 'ar');
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{ code: '2958', text: 'Arm pain', data: { term_icd9_code: '729.5' },
        code_system: 'gopher' }]));
    });

    it('should return different data when the list item changes', ()=>{
      cy.get(po.prefetchCWE).click();
      po.autocompPickNth(listField, 'ar', 2);
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{code: '2212',
        text: 'Coronary artery disease (CAD)', data: { term_icd9_code: '414.9' },
        code_system: 'gopher' }]));
    });
  });

  describe('multi-select search lists', ()=>{
    let listFieldID = po.multiSearchCWEID;
    let listField = po.multiSearchCWE;
    let selectedItemRemoveButton = po.multiSearchCWEFirstSelected;
    it('should return null when there is nothing entered', () => {
      po.openTestPage();
      cy.get(listField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for off-list items', () => {
      cy.get(listField).type('zzz');
      cy.get(po.nonField).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal([{text: 'zzz'}]));
    });

    it('should return null if the items are removed', () => {
      cy.get(selectedItemRemoveButton).click();
      getSelectedItemData(listFieldID).then(data=>expect(data).to.be.null);
    });

    it('should return data for on-list items', ()=> {
      cy.get(po.prefetchCWE).click();
      po.autocompPickFirst(listField, 'ar');
      // Also testing here multiple selections
      po.autocompPickFirst(listField, 'ar');
      getSelectedItemData(listFieldID).then(data=>expect(data).to.deep.equal(
        [{code: '2212',
        text: 'Coronary artery disease (CAD)', data: { term_icd9_code: '414.9' },
        code_system: 'gopher' },
        { code: '2958', text: 'Arm pain', data: { term_icd9_code: '729.5' },
        code_system: 'gopher' }]));
    });
  });



});
