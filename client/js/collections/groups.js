collectionGroups = Backbone.Collection.extend({
  model: App.Models.Group,
  url:"/groups",
  //создает новую группу вложенную в родительскую
  //parentId - id родительского элемента, в котором создается группа
  newGroup: function(parentId) {
    var newId = 1;
    var curIndex = 0;
    //for (var i = this.models.length - 1; i >= 0; i--) {
    for (var i = 0; i < this.models.length; i++) {
      if(this.models[i].id >= newId) {
        newId = this.models[i].id + 1;
      }
      
      if((this.models[i].get('parent_id') === parentId) || (this.models[i].get('id') === parentId)) {
        curIndex = i;
      }
    }

    //if(curIndex === 0) {}
    var newModel = new App.Models.Group({ 
      id:newId, 
      parent_id:parentId,
      name:'New group'});

    newModel.save();

    this.add( newModel, {at: curIndex + 1} );
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
  moveGroup: function(selectedId, direction, indexDestination, parentDestination)
  {
    //получаем перемещаемый элемент и его индекс
    var currentElement = this.get(selectedId);
    var currentElementIndex = this.models.indexOf(currentElement);

    if ((direction === 'up') || (direction === 'uplevel') || (direction === 'downlevel')) {
      //если элемент с индексом 0, то он находится в самом начале списка и не требует дальнейшего перемещения
      if (currentElementIndex === 0) { return; }
    } else if (direction === 'down') {
      //если элемент с индексом равным размеру массива, то он находится в самом конце списка и не требует дальнейшего перемещения
      if (currentElementIndex === this.models.length - 1) { return; }
    }
    
    //получаем элемент смещения
    var shiftedElementIndex = currentElementIndex;
    var shiftedElement = this.models[shiftedElementIndex];
    
    if (direction === 'jump') {
      var posArray = [ { 
      'parent' : this.models[0].get('parent_id'),
      'index' : -1
      } ];
      var cur = posArray[0];
      
      for (var i = 0; i < this.models.length; i++) {
        var pid = this.models[i].get('parent_id');

        if (cur.parent === pid) {
          cur.index++;
        } else {
          cur = _.findWhere(posArray, { 'parent': pid });
          if (typeof cur === 'undefined') {
            cur = { 'parent' : pid, 'index' : 0 };
            posArray.push(cur);
          }
        }
        
        if (pid === parentDestination && cur.index === indexDestination) {
          shiftedElementIndex = i;
          shiftedElement = this.models[i];
          break;
        }
      }
    } else {
      var shiftedId = ((direction === 'up') || (direction === 'down') || (direction === 'downlevel')) ? 'parent_id' : 'id';
      
      do {
        if ((direction === 'up') || (direction === 'uplevel') || (direction === 'downlevel')) {
          shiftedElementIndex = shiftedElementIndex - 1;
          if(shiftedElementIndex === -1) { return; }
        } else if (direction === 'down') {
          shiftedElementIndex = shiftedElementIndex + 1;
          if(shiftedElementIndex === this.models.length) { return; }
        }
        shiftedElement = this.models[shiftedElementIndex];
      } while(shiftedElement.get(shiftedId)  != currentElement.get('parent_id'));
  
      if (direction === 'uplevel') {
        currentElement.set({ parent_id: shiftedElement.get('parent_id') }, { silent: true });
      } else if (direction === 'downlevel') {
        currentElement.set({ parent_id: shiftedElement.get('id') }, { silent: true });
      }
    }
    
    //получаем список вложенных элементов и индекс последнего, мы вырежем этот интервал из массива
    //и переместим весь на позицию вверх
    var listGroup = this.getInnerGroup(selectedId);

    //удаляем вложенные элементы из массива
    var deletedElements = this.models.splice(currentElementIndex, listGroup.length);

    //переинициализируем индекс сдвигаемого элемента
    if (direction === 'down' || direction === 'downlevel') {
      shiftedElementIndex = this.models.indexOf(shiftedElement);
      shiftedElementIndex = shiftedElementIndex + 1;
    }

    //помещаем удаленные элементы в новую позицию
    if(shiftedElementIndex === this.models.length) {
      for (var i = 0; i < deletedElements.length; i++) {
        this.models.push(deletedElements[i]);
      }
    } else {
      for (var i = 0; i < deletedElements.length; i++) {
        this.models.splice(shiftedElementIndex + i, 0, deletedElements[i]);
      }
    }
    
    //this.trigger('move', selectedId, shiftedElement.get('id'));
    //currentPosId, newPosId, parentId
    if (direction != 'jump') {
      this.trigger('move', selectedId, shiftedElement.get('id'), currentElement.get('parent_id'));
    }
  },
  moveUpLevel: function(selectedId) {
    //получаем перемещаемый элемент и его индекс
    var currentElement = this.get(selectedId);
    var currentElementIndex = this.models.indexOf(currentElement);
    //если элемент с индексом равным размеру массива, то он находится в самом конце списка и не требует дальнейшего перемещения
    if (currentElementIndex === 0) { return; }
    
    //получаем элемент перед перемещаемым
    var previousElementIndex = currentElementIndex;
    var previousElement = this.models[previousElementIndex];
    do {
      previousElementIndex = previousElementIndex - 1;
      if(previousElementIndex === -1) { return; }
      previousElement = this.models[previousElementIndex];
    } while(previousElement.get('id') != currentElement.get('parent_id'));
    
    currentElement.set({ parent_id: previousElement.get('parent_id') }, { silent: true });
    
    //получаем список вложенных элементов и индекс последнего, мы вырежем этот интервал из массива
    //и переместим весь на позицию вниз
    var listGroup = this.getInnerGroup(selectedId);
    
    //удаляем вложенные элементы из массива
    var deletedElements = this.models.splice(currentElementIndex, listGroup.length);

    //помещаем удаленные элементы в новую позицию
    for (var i = 0; i < deletedElements.length; i++) {
      this.models.splice(previousElementIndex + i, 0, deletedElements[i]);
    }
    
    this.trigger('move', selectedId, previousElement.get('id'));    
  },
  moveDownLevel: function(selectedId) {
    
  }
});