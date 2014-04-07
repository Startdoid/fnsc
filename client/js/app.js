'use strict';

var Timesline = angular.module('Timesline', []);

angular.module('Timesline', ['ngCookies', 'ui.router'])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  var access = routingConfig.accessLevels;

  // Public routes
  $stateProvider
    .state('public', {
      abstract: true,
      template: "<ui-view/>",
      data: {
        access: access.public
      }
    })
    .state('public.404', {
       url: '/404/',
       templateUrl: '/partials/404.html'
    });

  // Anonymous routes
  $stateProvider
    .state('anon', {
      abstract: true,
      template: "<ui-view/>",
      data: {
        access: access.anon
      }
    })
    .state('anon.login', {
      url: '/login/',
      templateUrl: '/partials/login.html',
      controller: 'LoginCtrl'
    })
    .state('anon.register', {
      url: '/register/',
      templateUrl: '/partials/register.html',
      controller: 'RegisterCtrl'
    });

  // Regular user routes
  $stateProvider
    .state('user', {
      abstract: true,
      template: "<ui-view/>",
      data: {
        access: access.user
      }
    })
    .state('user.home', {
      url: '/',
      templateUrl: '/partials/home.html'
    })
    .state('user.private', {
      abstract: true,
      url: '/private/',
      templateUrl: '/partials/private/layout.html'
    })
    .state('user.private.home', {
      url: '',
      templateUrl: '/partials/private/home.html'
    })
    .state('user.private.nested', {
      url: 'nested/',
      templateUrl: '/partials/private/nested.html'
    })
    .state('user.private.admin', {
      url: 'admin/',
      templateUrl: '/partials/private/nestedAdmin.html',
      data: {
        access: access.admin
      }
    });

  // Admin routes
  $stateProvider
    .state('admin', {
      abstract: true,
      template: "<ui-view/>",
      data: {
        access: access.admin
      }
    })
    .state('admin.admin', {
      url: '/admin/',
      templateUrl: '/partials/admin.html',
      controller: 'AdminCtrl'
    });

  $urlRouterProvider.otherwise('/partials/404.html');

  // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
  $urlRouterProvider.rule(function($injector, $location) {
    if($location.protocol() === 'file')
      return;

    var path = $location.path();
    // Note: misnomer. This returns a query object, not a search string
    var search = $location.search();
    var params;

    // check to see if the path already ends in '/'
    if (path[path.length - 1] === '/') {
      return;
    }

    // If there was no search string / query params, return with a `/`
    if (Object.keys(search).length === 0) {
      return path + '/';
    }

    // Otherwise build the search string and return a `/?` prefix
    params = [];
    angular.forEach(search, function(v, k){
      params.push(k + '=' + v);
    });
    
    return path + '/?' + params.join('&');
  });

  $locationProvider.html5Mode(true);

  $httpProvider.interceptors.push(function($q, $location) {
    return {
      'responseError': function(response) {
        if(response.status === 401 || response.status === 403) {
          $location.path('/login');
        }
        
        return $q.reject(response);
      }
    };
  });
}])

.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    if (!Auth.authorize(toState.data.access)) {
      $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
      event.preventDefault();

      if(fromState.url === '^') {
        if(Auth.isLoggedIn()) {
          $state.go('user.home');
        } else {
          $rootScope.error = null;
          $state.go('anon.login');
        }
      }
    }
  });
}]);

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all tasks and show them
	$http.get('/api/tasks')
		.success(function(data) {
			$scope.tasks = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createTask = function() {
		$http.post('/api/tasks', $scope.formData)
			.success(function(data) {
				$('input').val('');
				$scope.tasks = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a task after checking it
	$scope.deleteTask = function(id) {
		$http.delete('/api/tasks/' + id)
			.success(function(data) {
				$scope.tasks = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
}