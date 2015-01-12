//***************************************************************************
//TREE MANAGER
//объект организует работу с деревьями, для того что бы линейную бэкбоновскую коллекцию
//разворачивать в древовидную структуру и выводить в webix-овые вьюхи
var treeManager = function (collection) {
  //древовидный массив
  var tree = [];
  var views = [];

  //рекурсивный перебор
  var treeRecursively = function(branch, list) {
    if (typeof branch === 'undefined') return null;
    var tr = [];
    for(var i = 0; i < branch.length; i++) {
      if(branch.length > 1) {
        branch[i].data = treeRecursively(list[ branch[i].id ], list);
      }
      tr.push(branch[i]);
    }
    return tr;
  };

  //функция рекурсивного обхода дерева, корень дерева представлен, как branch
  //ветка дерева содержится в массиве data корня branch т.е. branch->data[branch->data[branch->data]] и т.д.
  var recursively = function(branch, element, oper) {
    //проверка на то что корень является данными типа - объект
    if (typeof branch === 'undefined') return false;
    //проверка на то что корень не обнулен
    if (branch === null) return false;
    
    //Если родитель корневой элемент, то добавим в корень
    if ((oper === 'add') && (element.parent_id === 0)) {
      branch.push(element);
      return true;        
    } 

    for (var i = 0; i<branch.length; i++) {
      if (branch[i] === null) continue;
      
      if (oper === 'add') {
        if (element.parent_id === branch[i].id) {
          if ((branch[i].data === null) || (typeof branch[i].data === 'undefined')) {
            branch[i].data = [];
          }
          branch[i].data.push(element);
          return true;
        } else {
          if(recursively(branch[i].data, element, oper)) { return true }
        }
      } else {
        if (element.id === branch[i].id) {
          //var deletedElements = this.models.splice(delElementIndex, 1); ПОПРОБУЙ
          branch[i] = null;
          //delete branch[i];
          return true;
        }
        else
        {
          if(recursively(branch[i].data, element, oper)) { return true }
        }
      }
    }
  };

  this.treeBuild = function(collection) {
    //преобразуем в линейный массив бэкбоновскую коллекцию (разворачиваем атрибуты объекта)
    var maplist = collection.map(function(object) { return object.attributes });
    if(maplist.length > 0) {
      //сгруппируем элементы массива по родителю
      var list = _.groupBy(maplist, 'parent_id');
      //рекурсивно перебирая сгруппированный массив построим дерево
      tree = treeRecursively(list[0], list);
    } else {
      tree = [];
    }
  };
  
  //добавление элемента в дерево, автоматическое обновление элементов во вьюхах из массива views
  this.treeAdd = function(element) {
    var result = recursively(tree, webix.copy(element.attributes), 'add');
    if(result) {
      //var currentItem = views[0].getItem(element.attributes.parent_id);
      //views[0].data.sync(tree);
      for (var i = views.length; i--; ) {
        //var insertIndex = tree.getIndexById(element.attributes.parent_id);
        views[i].add(webix.copy(element.attributes), -1, element.attributes.parent_id);
        views[i].refresh();
      }
    }
  };
  
  this.treeRemove = function(element) {
    var result = recursively(tree, element.attributes, 'delete');
    if(result) {
      for (var i = views.length; i--; ) {
        views[i].remove(element.attributes.id);
        views[i].refresh();
      }
    }
  };
  
  this.treeChange = function(element) {
    for (var i = views.length; i--; ) {
      var record = views[i].getItem(element.get('id'));
      var chgAtr = element.changedAttributes();
      var keysArr = _.keys(chgAtr);
      var valuesArr = _.values(chgAtr);
      for (var j = keysArr.length; j--; ) {
        record[keysArr[j]] = valuesArr[j];
      }
      views[i].refresh();
    }
  };
  
  this.move = function(currentPosId, newPosId, parentId) {
    for (var i = views.length; i--; ) {
      //var newPosIndex = views[i].getBranchIndex(newPosId, views[i].getParentId(newPosId));
      //views[i].move(currentPosId, newPosIndex, null, { parent: views[i].getParentId(newPosId) });
      //views[i].refresh();
      var newPosIndex = views[i].getBranchIndex(newPosId, parentId);
      views[i].move(currentPosId, newPosIndex, null, { parent: parentId });
      views[i].refresh();
    }      
  };
  
  //добавление вьюхи в масс��в для датабиндинга
  this.viewsAdd = function(view) {
    if (typeof view === 'object')
    {
      //добавим в массив, если нет такой
      if(views.indexOf(view) === -1) {
        views.push(view);
        
        //обновим вновь добавленную вьюху информцией из дерева
        view.clearAll();
        view.parse(JSON.stringify(tree));
      }
    }
  };
  
  //удаление вьюхи из массива датабиндинга
  this.viewsDelete = function(view) {
    console.log('view delete');
  };
  
  //если при создании объекта передан не пустой параметр, то формируется дерево
  if (typeof collection !== 'undefined')
  {
    this.treeBuild(collection);
  }
};