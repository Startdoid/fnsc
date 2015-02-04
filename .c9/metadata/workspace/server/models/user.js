{"filter":false,"title":"user.js","tooltip":"/server/models/user.js","undoManager":{"mark":95,"position":95,"stack":[[{"group":"doc","deltas":[{"start":{"row":148,"column":82},"end":{"row":148,"column":96},"action":"insert","lines":["where \"id\"<>$3"]},{"start":{"row":159,"column":63},"end":{"row":159,"column":64},"action":"remove","lines":["'"]},{"start":{"row":159,"column":63},"end":{"row":159,"column":94},"action":"insert","lines":["where \"id\"<>$1',[loggedUser.id]"]},{"start":{"row":165,"column":50},"end":{"row":165,"column":65},"action":"insert","lines":[", loggedUser.id"]},{"start":{"row":171,"column":11},"end":{"row":174,"column":35},"action":"remove","lines":["//usersList.data = new Array();","        \t  //usersList.data.push(arrUsrs);","        \t  usersList.data = arrUsrs;","        \t  //console.log(usersList)"]},{"start":{"row":171,"column":11},"end":{"row":171,"column":35},"action":"insert","lines":["usersList.data = arrUsrs"]},{"start":{"row":180,"column":50},"end":{"row":180,"column":65},"action":"insert","lines":[", loggedUser.id"]},{"start":{"row":186,"column":0},"end":{"row":188,"column":0},"action":"remove","lines":["        \t  //usersList.data = new Array();","        \t  //usersList.data.push(arrUsrs);",""]},{"start":{"row":188,"column":0},"end":{"row":189,"column":0},"action":"remove","lines":["        \t  //console.log(usersList);",""]},{"start":{"row":191,"column":4},"end":{"row":221,"column":9},"action":"insert","lines":["}      ","    });","  },","  ","  /****************************************************************************","  * getFriends list","  *","  * Result:","      (array)(array) - Массив с пользователями","  */","  getFriends: function(callback) {","    ","    var usersList = { data: [{}] };","    ","    pg.connect(database.url_pg, function(err, client, done) {","      if(err){console.log(err); return usersList}","      ","      var querySelect = 'SELECT \"Users\".id, \"Users\".username, \"Users\".email, \"Users\".\"visibleProfile\", \"UserFriends\".\"Status\" \\","                        FROM public.\"UserFriends\" left join public.\"Users\" on \"Users\".id = \"UserFriends\".\"FriendId\" \\","                        WHERE \"UserFriends\".\"UserId\" = $1';","      ","      //получаем список","      client.query(querySelect,[loggedUser.id], function(err, result){","    \t  if(err) {callback(errors.restStat_DbReadError, err, usersList); return usersList}","    \t  ","    \t  var arrUsrs = result.rows.map(function(object) { ","        \t    return { id: object.id, username: object.username, email: object.email, img:'avtr' + object.id + '.png', status:object.Status };","        \t  });","        \t  usersList.data = arrUsrs;","        \t  done();","        \t"]},{"start":{"row":221,"column":11},"end":{"row":221,"column":13},"action":"remove","lines":["//"]},{"start":{"row":222,"column":0},"end":{"row":223,"column":2},"action":"insert","lines":["        \t  return usersList;","  "]},{"start":{"row":223,"column":7},"end":{"row":224,"column":0},"action":"insert","lines":[");",""]},{"start":{"row":224,"column":4},"end":{"row":224,"column":6},"action":"remove","lines":["  "]},{"start":{"row":224,"column":4},"end":{"row":225,"column":4},"action":"insert","lines":["});","  },"]},{"start":{"row":226,"column":2},"end":{"row":227,"column":0},"action":"insert","lines":["",""]},{"start":{"row":227,"column":2},"end":{"row":228,"column":4},"action":"remove","lines":["});","  },"]},{"start":{"row":227,"column":2},"end":{"row":257,"column":2},"action":"insert","lines":["/*","  * addFriend","  * Добавляет пользователя в список друзей со статусом \"заявка\"","  * По идеи, нужно когда другой пользователь подтверждает, здесь же организовать эту логику","  * id - id пользователя которого хотят добавить","  * Result:","  * (boolean)","  */","  addFriend: function(friendId){","    ","    pg.connect(database.url_pg, function(err, client, done) {","      if(err){console.log(err); return false}","      ","      var queryInsert = 'INSERT INTO \"UserFriends\"(\"UserId\", \"FriendId\", \"Status\") VALUES ($1, $2, $3);';","      ","      //добавляем друга","      client.query('BEGIN', function(err){","    \t  if(err) {rollback(client, done); return false}","    \t        ","    \t  client.query(queryInsert, [loggedUser.id, friendId, 0], function(err, result) {","      \t  if(err) { console.log(err); rollback(client, done); return false }","      \t  ","      \t  client.query('COMMIT');","          done();","          return true;","    \t  });","      });","    });","    ","  },","  "]}]}],[{"group":"doc","deltas":[{"start":{"row":235,"column":30},"end":{"row":235,"column":40},"action":"insert","lines":[", callback"]},{"start":{"row":238,"column":32},"end":{"row":238,"column":39},"action":"remove","lines":["return "]},{"start":{"row":238,"column":32},"end":{"row":238,"column":41},"action":"insert","lines":["callback("]},{"start":{"row":238,"column":46},"end":{"row":238,"column":47},"action":"insert","lines":[")"]},{"start":{"row":244,"column":40},"end":{"row":244,"column":47},"action":"remove","lines":["return "]},{"start":{"row":244,"column":40},"end":{"row":244,"column":49},"action":"insert","lines":["callback("]},{"start":{"row":244,"column":54},"end":{"row":244,"column":55},"action":"insert","lines":[")"]},{"start":{"row":247,"column":61},"end":{"row":247,"column":73},"action":"remove","lines":["return false"]},{"start":{"row":247,"column":61},"end":{"row":273,"column":76},"action":"insert","lines":["callback(false) }","      \t  ","      \t  client.query('COMMIT');","          done();","          callback(true);","    \t  });","      });","    });","    ","  },","  /*","  * deleteFriend","  *","  */","  deleteFriend: function(friendId, callback){","    ","    pg.connect(database.url_pg, function(err, client, done) {","      if(err){console.log(err); callback(false)}","      ","      var queryDelete = 'DELETE FROM \"UserFriends\" WHERE FriendId=$1 and UserId=$2;';","      ","      //добавляем друга","      client.query('BEGIN', function(err){","    \t  if(err) {rollback(client, done); callback(false)}","    \t        ","    \t  client.query(queryDelete, [friendId, loggedUser.id], function(err, result) {","      \t  if(err) { console.log(err); rollback(client, done); callback(false)"]},{"start":{"row":277,"column":10},"end":{"row":277,"column":17},"action":"remove","lines":["return "]},{"start":{"row":277,"column":10},"end":{"row":277,"column":19},"action":"insert","lines":["callback("]},{"start":{"row":277,"column":23},"end":{"row":277,"column":24},"action":"insert","lines":[")"]},{"start":{"row":282,"column":0},"end":{"row":283,"column":0},"action":"insert","lines":["    ",""]}]}],[{"group":"doc","deltas":[{"start":{"row":201,"column":23},"end":{"row":201,"column":31},"action":"insert","lines":["UserId, "]},{"start":{"row":213,"column":32},"end":{"row":213,"column":38},"action":"remove","lines":["logged"]},{"start":{"row":213,"column":32},"end":{"row":213,"column":39},"action":"insert","lines":["Number("]},{"start":{"row":213,"column":43},"end":{"row":213,"column":46},"action":"remove","lines":[".id"]},{"start":{"row":213,"column":43},"end":{"row":213,"column":46},"action":"insert","lines":["Id)"]},{"start":{"row":266,"column":57},"end":{"row":266,"column":58},"action":"insert","lines":["\""]},{"start":{"row":266,"column":66},"end":{"row":266,"column":67},"action":"insert","lines":["\""]},{"start":{"row":266,"column":75},"end":{"row":266,"column":76},"action":"insert","lines":["\""]},{"start":{"row":266,"column":82},"end":{"row":266,"column":83},"action":"insert","lines":["\""]}]}],[{"group":"doc","deltas":[{"start":{"row":8,"column":2},"end":{"row":8,"column":3},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":8,"column":3},"end":{"row":8,"column":4},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":9,"column":2},"end":{"row":9,"column":3},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":9,"column":3},"end":{"row":9,"column":4},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":10,"column":2},"end":{"row":10,"column":3},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":10,"column":3},"end":{"row":10,"column":4},"action":"insert","lines":["/"]}]}],[{"group":"doc","deltas":[{"start":{"row":219,"column":10},"end":{"row":219,"column":11},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":219,"column":9},"end":{"row":219,"column":10},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":219,"column":8},"end":{"row":219,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":220,"column":8},"end":{"row":220,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":220,"column":8},"end":{"row":220,"column":10},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":221,"column":8},"end":{"row":221,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":221,"column":8},"end":{"row":221,"column":10},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":222,"column":8},"end":{"row":222,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":222,"column":8},"end":{"row":222,"column":10},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":213,"column":70},"end":{"row":213,"column":71},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":214,"column":16},"end":{"row":214,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":214,"column":88},"end":{"row":214,"column":89},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":217,"column":12},"end":{"row":217,"column":13},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":217,"column":10},"end":{"row":217,"column":12},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":217,"column":9},"end":{"row":217,"column":10},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":217,"column":8},"end":{"row":217,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":217,"column":8},"end":{"row":217,"column":10},"action":"insert","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":218,"column":9},"end":{"row":218,"column":10},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":218,"column":9},"end":{"row":218,"column":10},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":218,"column":8},"end":{"row":218,"column":9},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":214,"column":79},"end":{"row":214,"column":88},"action":"remove","lines":["usersList"]}]}],[{"group":"doc","deltas":[{"start":{"row":214,"column":79},"end":{"row":214,"column":80},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":206,"column":14},"end":{"row":206,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":206,"column":49},"end":{"row":206,"column":50},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":206,"column":13},"end":{"row":206,"column":14},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":202,"column":0},"end":{"row":202,"column":2},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":202,"column":0},"end":{"row":202,"column":2},"action":"remove","lines":["  "]}]}],[{"group":"doc","deltas":[{"start":{"row":202,"column":0},"end":{"row":203,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":205,"column":41},"end":{"row":205,"column":50},"action":"remove","lines":["usersList"]}]}],[{"group":"doc","deltas":[{"start":{"row":205,"column":40},"end":{"row":205,"column":41},"action":"remove","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":221,"column":0},"end":{"row":221,"column":25},"action":"remove","lines":["        return usersList;"]}]}],[{"group":"doc","deltas":[{"start":{"row":221,"column":0},"end":{"row":222,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":8,"column":2},"end":{"row":8,"column":4},"action":"remove","lines":["//"]},{"start":{"row":9,"column":2},"end":{"row":9,"column":4},"action":"remove","lines":["//"]},{"start":{"row":10,"column":2},"end":{"row":10,"column":4},"action":"remove","lines":["//"]},{"start":{"row":202,"column":4},"end":{"row":203,"column":4},"action":"insert","lines":["","    "]},{"start":{"row":206,"column":13},"end":{"row":206,"column":16},"action":"remove","lines":[" { "]},{"start":{"row":206,"column":13},"end":{"row":206,"column":14},"action":"insert","lines":["{"]},{"start":{"row":206,"column":39},"end":{"row":206,"column":48},"action":"insert","lines":["usersList"]},{"start":{"row":213,"column":70},"end":{"row":213,"column":71},"action":"remove","lines":[" "]},{"start":{"row":214,"column":16},"end":{"row":214,"column":17},"action":"remove","lines":[" "]},{"start":{"row":214,"column":78},"end":{"row":214,"column":87},"action":"insert","lines":["usersList"]},{"start":{"row":217,"column":8},"end":{"row":217,"column":11},"action":"insert","lines":["\t  "]},{"start":{"row":218,"column":8},"end":{"row":218,"column":11},"action":"insert","lines":["\t  "]},{"start":{"row":219,"column":8},"end":{"row":219,"column":11},"action":"insert","lines":["\t  "]},{"start":{"row":220,"column":8},"end":{"row":220,"column":11},"action":"insert","lines":["\t  "]},{"start":{"row":221,"column":8},"end":{"row":221,"column":11},"action":"insert","lines":["\t  "]},{"start":{"row":222,"column":0},"end":{"row":223,"column":0},"action":"insert","lines":["        \t  return usersList;",""]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":30},"end":{"row":4,"column":38},"action":"remove","lines":["database"]},{"start":{"row":4,"column":30},"end":{"row":4,"column":31},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":31},"end":{"row":4,"column":32},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":32},"end":{"row":4,"column":33},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":33},"end":{"row":4,"column":34},"action":"insert","lines":["b"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":34},"end":{"row":4,"column":35},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":35},"end":{"row":4,"column":36},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":8},"end":{"row":0,"column":18},"action":"remove","lines":["          "]},{"start":{"row":0,"column":8},"end":{"row":0,"column":9},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":9},"end":{"row":0,"column":10},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":10},"end":{"row":0,"column":11},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":11},"end":{"row":0,"column":12},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":12},"end":{"row":0,"column":13},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":13},"end":{"row":0,"column":14},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":14},"end":{"row":0,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":15},"end":{"row":0,"column":16},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":16},"end":{"row":0,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":17},"end":{"row":0,"column":18},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":12},"end":{"row":1,"column":18},"action":"remove","lines":["      "]},{"start":{"row":1,"column":12},"end":{"row":1,"column":13},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":13},"end":{"row":1,"column":14},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":14},"end":{"row":1,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":15},"end":{"row":1,"column":16},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":16},"end":{"row":1,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":17},"end":{"row":1,"column":18},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":6},"end":{"row":3,"column":18},"action":"remove","lines":["            "]},{"start":{"row":3,"column":6},"end":{"row":3,"column":7},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":7},"end":{"row":3,"column":8},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":8},"end":{"row":3,"column":9},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":9},"end":{"row":3,"column":10},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":10},"end":{"row":3,"column":11},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":11},"end":{"row":3,"column":12},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":12},"end":{"row":3,"column":13},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":13},"end":{"row":3,"column":14},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":14},"end":{"row":3,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":15},"end":{"row":3,"column":16},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":16},"end":{"row":3,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":3,"column":17},"end":{"row":3,"column":18},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":12},"end":{"row":4,"column":16},"action":"remove","lines":[" \t\t\t"]},{"start":{"row":4,"column":12},"end":{"row":4,"column":13},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":13},"end":{"row":4,"column":14},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":14},"end":{"row":4,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":15},"end":{"row":4,"column":16},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":16},"end":{"row":4,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":17},"end":{"row":4,"column":18},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":4},"end":{"row":4,"column":12},"action":"remove","lines":["database"]},{"start":{"row":4,"column":4},"end":{"row":4,"column":5},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":5},"end":{"row":4,"column":6},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":6},"end":{"row":4,"column":7},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":7},"end":{"row":4,"column":8},"action":"insert","lines":["b"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":8},"end":{"row":4,"column":9},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":9},"end":{"row":4,"column":10},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":10},"end":{"row":4,"column":11},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":112,"column":17},"end":{"row":112,"column":25},"action":"remove","lines":["database"]},{"start":{"row":112,"column":17},"end":{"row":112,"column":23},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":150,"column":15},"end":{"row":150,"column":23},"action":"remove","lines":["database"]},{"start":{"row":150,"column":15},"end":{"row":150,"column":21},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":205,"column":15},"end":{"row":205,"column":23},"action":"remove","lines":["database"]},{"start":{"row":205,"column":15},"end":{"row":205,"column":21},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":237,"column":15},"end":{"row":237,"column":23},"action":"remove","lines":["database"]},{"start":{"row":237,"column":15},"end":{"row":237,"column":21},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":263,"column":15},"end":{"row":263,"column":23},"action":"remove","lines":["database"]},{"start":{"row":263,"column":15},"end":{"row":263,"column":21},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":326,"column":17},"end":{"row":326,"column":25},"action":"remove","lines":["database"]},{"start":{"row":326,"column":17},"end":{"row":326,"column":23},"action":"insert","lines":["global"]}]}],[{"group":"doc","deltas":[{"start":{"row":138,"column":4},"end":{"row":138,"column":80},"action":"insert","lines":["****************************************************************************"]},{"start":{"row":144,"column":3},"end":{"row":144,"column":79},"action":"insert","lines":["****************************************************************************"]},{"start":{"row":148,"column":0},"end":{"row":149,"column":0},"action":"insert","lines":["    ",""]},{"start":{"row":155,"column":7},"end":{"row":155,"column":9},"action":"remove","lines":["//"]},{"start":{"row":155,"column":39},"end":{"row":155,"column":47},"action":"remove","lines":["isOk, ''"]},{"start":{"row":155,"column":39},"end":{"row":155,"column":55},"action":"insert","lines":["DbReadError, err"]},{"start":{"row":167,"column":39},"end":{"row":167,"column":100},"action":"insert","lines":["return callback(errors.restStat_DbReadError, err, usersList);"]},{"start":{"row":170,"column":116},"end":{"row":170,"column":143},"action":"insert","lines":[", isFriend: object.isfriend"]},{"start":{"row":182,"column":39},"end":{"row":182,"column":100},"action":"insert","lines":["return callback(errors.restStat_DbReadError, err, usersList);"]},{"start":{"row":197,"column":2},"end":{"row":197,"column":3},"action":"remove","lines":["*"]},{"start":{"row":198,"column":2},"end":{"row":198,"column":3},"action":"remove","lines":["*"]},{"start":{"row":198,"column":2},"end":{"row":198,"column":38},"action":"insert","lines":[" UserId - Друзья какого пользователя"]},{"start":{"row":199,"column":2},"end":{"row":199,"column":3},"action":"remove","lines":["*"]},{"start":{"row":201,"column":2},"end":{"row":201,"column":78},"action":"insert","lines":["****************************************************************************"]},{"start":{"row":202,"column":30},"end":{"row":202,"column":43},"action":"insert","lines":[" from, count,"]},{"start":{"row":209,"column":6},"end":{"row":209,"column":125},"action":"remove","lines":["var querySelect = 'SELECT \"Users\".id, \"Users\".username, \"Users\".email, \"Users\".\"visibleProfile\", \"UserFriends\".\"Status\""]},{"start":{"row":209,"column":6},"end":{"row":225,"column":43},"action":"insert","lines":["/*$1 - чьи друзья","      * $2 - текущий пользователь","        $3 - количество","        $4 - начальная позиция*/","      ","      var queryCount = 'SELECT count(\"Users\".id) as count \\","                        FROM \"UserFriends\" left join \"Users\" on \"Users\".id = \"UserFriends\".\"FriendId\" \\","                                left join \"UserFriends\" as \"UF2\" on \"Users\".id = \"UF2\".\"FriendId\" and \"UF2\".\"UserId\"=$2 \\","                        WHERE \"UserFriends\".\"UserId\" = $1 \\","                        GROUP by \"Users\".\"id\" \\","                        Order by \"Users\".\"id\" ;';","        ","      var querySelect = 'SELECT \"Users\".id, \"Users\".username, \"Users\".email, \"Users\".\"visibleProfile\", \"UserFriends\".\"Status\", \\","                            CASE \\","                            \tWHEN \"UF2\".\"FriendId\" IS NOT NULL THEN 1 \\","                            \tELSE 0 \\","                            END as isfriend"]},{"start":{"row":226,"column":29},"end":{"row":226,"column":36},"action":"remove","lines":["public."]},{"start":{"row":226,"column":53},"end":{"row":226,"column":60},"action":"remove","lines":["public."]},{"start":{"row":227,"column":24},"end":{"row":229,"column":0},"action":"remove","lines":["WHERE \"UserFriends\".\"UserId\" = $1';","      ",""]},{"start":{"row":227,"column":24},"end":{"row":237,"column":2},"action":"insert","lines":["        left join \"UserFriends\" as \"UF2\" on \"Users\".id = \"UF2\".\"FriendId\" and \"UF2\".\"UserId\"=$2 \\","                        WHERE \"UserFriends\".\"UserId\" = $1 \\","                        Order by \"Users\".\"id\" LIMIT $3 OFFSET $4;';","      ","      //количество для списка","      client.query(queryCount,[Number(UserId), Number(loggedUser.id)], function(err, result){","        if(err) {callback(errors.restStat_DbReadError, err, usersList); return usersList;}","        ","        usersList.total_count = Number(result.rows[0].count);","        ","  "]},{"start":{"row":238,"column":0},"end":{"row":238,"column":2},"action":"insert","lines":["  "]},{"start":{"row":238,"column":48},"end":{"row":238,"column":100},"action":"insert","lines":[", Number(loggedUser.id), Number(count), Number(from)"]},{"start":{"row":242,"column":132},"end":{"row":242,"column":133},"action":"remove","lines":["S"]},{"start":{"row":242,"column":132},"end":{"row":242,"column":133},"action":"insert","lines":["s"]},{"start":{"row":242,"column":138},"end":{"row":242,"column":164},"action":"insert","lines":[", isFriend:object.isfriend"]},{"start":{"row":247,"column":27},"end":{"row":248,"column":10},"action":"insert","lines":[";","        })"]}]}]]},"ace":{"folds":[],"customSyntax":"javascript","scrolltop":2342.5,"scrollleft":0,"selection":{"start":{"row":235,"column":0},"end":{"row":235,"column":0},"isBackwards":true},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":537,"mode":"ace/mode/javascript"}},"timestamp":1422873859000,"hash":"2695827d958dcc1a44ba6be3713e7794263d6bad"}