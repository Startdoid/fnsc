/**
* Модуль глобальных переменных
* @module Global
* @author bruian
*/

module.exports = {
  // the database url to connect
	//url    : 'mongodb://testman:testman@kahana.mongohq.com:10036/testio',
	//url_pg : 'postgres://spmehfcwqqeixv:7yoBcix92QnkjG-Gena3yBneFg@ec2-54-163-255-191.compute-1.amazonaws.com:5432/ddbggkp3jlbmc4?ssl=true',
	url    : 'mongodb://fns.club:27017/testio',
	url_pg : 'postgres://intask:inmaus@fns.club:5432/intask?ssl=true',
	imgs   : ['.png', '.jpg', '.jpeg', '.gif', '.bmp'], // only make thumbnail for these
	state  : {
    id: 0,
    mainUserLogged: false,
    usrCRC: null,
    serverRoute: '',
    userId : 0
  },
  pg_query_getAllGroupsForUser: 'SELECT     \
    "TableGroups"."id",                     \
    "TableGroups"."parent_id",              \
    "TableGroups"."groupVisible",           \
    "TableGroups"."name",                   \
    "TableGroups"."description",            \
    "TableGroups"."email",                  \
    "TableGroups"."hasChildren",            \
    CASE WHEN "GroupsMembers"."user_type" IS NOT NULL THEN "GroupsMembers"."user_type" \
    ELSE 3 END as "user_type",              \
    CASE WHEN "GroupsMembers"."order" IS NOT NULL THEN "GroupsMembers"."order" \
    ELSE 0 END as "order"                   \
  FROM                                      \
    ((SELECT                                \
      "GenUserView"."id",                   \
      "GenUserView"."parent_id",            \
      "GenUserView"."groupVisible",         \
      "GenUserView"."name",                 \
      "GenUserView"."description",          \
      "GenUserView"."email",                \
      "GenUserView"."hasChildren"           \
    FROM                                    \
    (SELECT                                 \
      "Groups"."id",                        \
      "Groups"."parent_id",                 \
      "Groups"."groupVisible",              \
      "Groups"."name",                      \
      "Groups"."description",               \
      "Groups"."email",                     \
      "Groups"."hasChildren"                \
    FROM                                    \
      public."Groups"                       \
    INNER JOIN public."GroupsMembers" ON "Groups".id = "GroupsMembers".id AND "Groups"."groupVisible" >= "GroupsMembers"."user_type" AND "GroupsMembers".user_id = $1 \
    WHERE "Groups"."parent_id" = $2) AS "GenUserView" \
    INNER JOIN public."GroupsMembers" ON "GenUserView".id = "GroupsMembers".id AND "GroupsMembers".user_id = $3) \
  UNION                                     \
    (SELECT                                 \
      "Groups"."id",                        \
      "Groups"."parent_id",                 \
      "Groups"."groupVisible",              \
      "Groups"."name",                      \
      "Groups"."description",               \
      "Groups"."email",                     \
      "Groups"."hasChildren"                \
    FROM                                    \
      public."Groups"                       \
    WHERE                                   \
      "Groups"."groupVisible" = 3 AND "Groups"."parent_id" = $2)) as "TableGroups" \
  LEFT JOIN public."GroupsMembers" ON "TableGroups".id = "GroupsMembers".id AND "GroupsMembers".user_id = $1 \
  ORDER BY "order"'  
}; 