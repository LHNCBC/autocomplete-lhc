  /**
   * The PHR autocompleter needs method clonePosition for positioning the 
   * autocompleter dropdown list. The method worked okay with version 1.6 
   * prototype. But in version 1.7, due to the change of method viewportOffset,
   * clonePosition is not working properly. 
   * 
   * In order to keep the clonePosition method working as it was in version 1.6, 
   * the viewportOffset method needs to be rollbacked to version 1.6.
   **/
Element.addMethods({
  
  // This method is a copy of viewportOffset method of prototype version 1.6
  viewportOffset: function(forElement) {
    element = $(element);
    var valueT = 0, valueL = 0, docBody = document.body;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }
});
  
  