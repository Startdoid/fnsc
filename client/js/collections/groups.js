collectionGroups = Backbone.Collection.extend({
  model: App.Models.Group,
  url:"/groups",
  //создает новую группу вложенную в родительскую
  //parentId - id родительского элемента, в котором создается группа
  newGroup: function(parentId) {
    var newId = 1;
    for (var i = this.models.length - 1; i >= 0; i--) {
      if(this.models[i].id >= newId) {
        newId = this.models[i].id + 1;
      }
    }

    this.add({ 
      id:newId, 
      parent_id:parentId,
      name:'New group'} );
  },
  //получает из коллекции моделей массив всех подчиненных элементов родительскому
  //groupId - id родительского элемента, по которому происходит поиск вложенных
  //возвращает массив вложенных элементов
  getInnerGroup: function(parentId) {
    var listGroup = [this.get(parentId)];
    for (var i = 0; i < this.models.length; i++) {
      for (var c = 0; c < listGroup.length; c++) {
        if (this.models[i].get('parent_id') === listGroup[c].id) {
          listGroup.push(this.models[i]);
        }
      }
    }
    
    return listGroup;
  },
  //удаляет указанную группу из коллекции и все вложенные группы
  //selectedId - id группы, которую необходимо удалить
  removeGroup: function(selectedId) {
    var listGroup = this.getInnerGroup(selectedId);
    
    for (var i = listGroup.length - 1; i >= 0; i--) {
      this.remove(listGroup[i]);
    }
  },
  //перемещает элемент коллекции на 1 позицию вверх вместе со всеми вложенными элементами
  //перемещение происходит в пределах одного уровня
  //selectedId - id группы, которую необходимо переместить
  moveUp: function(selectedId) {
    //получаем перемещаемый элемент и его индекс
    var currentElement = this.get(selectedId);
    var currentElementIndex = this.models.indexOf(currentElement);
    //если элемент с индексом 0, то он находится в самом начале списка и не требует дальнейшего перемещения
    if (currentElementIndex === 0) { return; }
    
    //получаем элемент перед перемещаемым
    var previousElementIndex = currentElementIndex;
    var previousElement = this.models[previousElementIndex];
    do {
      previousElementIndex = previousElementIndex - 1;
      previousElement = this.models[previousElementIndex];
    } while(previousElement.get('parent_id')  != currentElement.get('parent_id'));
    
    //получаем список вложенных элементов и индекс последнего, мы вырежем этот интервал из массива
    //и переместим весь на позицию вверх
    var listGroup = this.getInnerGroup(selectedId);
    //var lastElementIndex = this.models.indexOf(listGroup[listGroup.length - 1]);
   
    //удаляем вложенные элементы из массива
    var deletedElements = this.models.splice(currentElementIndex, listGroup.length);
      //var previousElementIndex = this.models.indexOf(previousElement);
    //помещаем удаленные элементы в новую позицию
    for (var i = 0; i < deletedElements.length; i++) {
      this.models.splice(previousElementIndex + i, 0, deletedElements[i]);
    }
    
    this.trigger("moveUp", selectedId);
  },
  moveDown: function(selectedId) {
    
  },
  moveUpLevel: function(selectedId) {
    
  },
  moveDownLevel: function(selectedId) {
    
  }
});