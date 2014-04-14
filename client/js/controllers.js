'use strict';

/* Controllers */

// angular.module('Timesline')
// .controller('AccordionDemoCtrl', function($scope) {
//   $scope.oneAtATime = true;

//   $scope.groups = [
//     {
//       title: "Dynamic Group Header - 1",
//       content: "Dynamic Group Body - 1"
//     },
//     {
//       title: "Dynamic Group Header - 2",
//       content: "Dynamic Group Body - 2"
//     }
//   ];

//   $scope.items = ['Item 1', 'Item 2', 'Item 3'];

//   $scope.addItem = function() {
//     var newItemNo = $scope.items.length + 1;
//     $scope.items.push('Item ' + newItemNo);
//   };
// });

angular.module('Timesline')
.controller('TranslateController', function($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
  };
});

angular.module('Timesline')
.controller('NavCtrl', ['$rootScope', '$scope', '$translate', '$location', 'Auth', function($rootScope, $scope, $translate, $location, Auth) {
  $scope.user = Auth.user;
  $scope.userRoles = Auth.userRoles;
  $scope.accessLevels = Auth.accessLevels;

  $scope.logout = function() {
    Auth.logout(function() {
      $location.path('/login');
    }, function() {
      $rootScope.error = "Failed to logout";
    });
  };
}]);

angular.module('Timesline')
.controller('LoginCtrl', ['$rootScope', '$scope', '$translate', '$location', '$window', 'Auth', function($rootScope, $scope, $translate, $location, $window, Auth) {
  $scope.rememberme = true;
  $scope.login = function() {
    console.log("login");
    Auth.login({
      username: $scope.username,
      password: $scope.password,
      rememberme: $scope.rememberme
    },
    function(res) {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = "Failed to login";
    });
  };

  $scope.loginOauth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
}]);

angular.module('Timesline')
.controller('RegisterCtrl', ['$rootScope', '$scope', '$translate', '$location', 'Auth', function($rootScope, $scope, $translate, $location, Auth) {
  $scope.role = Auth.userRoles.user;
  $scope.userRoles = Auth.userRoles;

  $scope.register = function() {
    Auth.register({
      username: $scope.username,
      password: $scope.password,
      role: $scope.role
    },
    function() {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = err;
    });
    };
}]);

angular.module('Timesline')
.controller('AdminCtrl', ['$rootScope', '$scope', '$translate', 'Users', 'Auth', function($rootScope, $scope, $translate, Users, Auth) {
  $scope.loading = true;
  $scope.userRoles = Auth.userRoles;

  Users.getAll(function(res) {
    $scope.users = res;
    $scope.loading = false;
  }, function(err) {
    $rootScope.error = "Failed to fetch users.";
    $scope.loading = false;
  });
}]);