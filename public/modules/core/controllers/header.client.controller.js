'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', '$http', 'Authentication', 'Menus', 'Persona',
	function($scope, $location, $http, Authentication, Menus, Persona) {
    Persona.watch({
      loggedInUser: Authentication.user.email,
      onlogin: function(assertion) {
        $http.post(
          '/auth/persona', // This is a URL on your website.
          {assertion: assertion}
        ).then(function () {
            location.reload(); // FIXME
          });
      },
      onlogout: function() {
      }
    });

    $scope.query = { term: '' };

    $scope.addIdentifier = function() {
      $location.path('/id/create/' + $scope.query.term);
    };

    $scope.login = function() {
      Persona.request();
    };

    $scope.logout = function() {
      Persona.logout();
    };

    $scope.logoClicked = function() {
      $scope.query.term = '';
      $scope.searchKeydown();
    };

		$scope.authentication = Authentication;
    if (Authentication.user) {
      if (Authentication.user.provider === 'persona')
        Authentication.user.idType = 'email';
      else
        Authentication.user.idType = 'url';

      switch (Authentication.user.provider) {
        case 'persona':
          Authentication.user.idValue = Authentication.user.email;
          break;
        case 'twitter':
          Authentication.user.idValue = 'https://twitter.com/' + Authentication.user.username;
          break;
        default:
          Authentication.user.idValue = Authentication.user.providerData.link;
          break;
      }
    }


		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

    $scope.searchChanged = function() {
      $scope.$root.$broadcast('StartSearch', { queryTerm: $scope.query.term });
    };

    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.searchKeydown = function(e) {
      $scope.$root.$broadcast('SearchKeydown', { event: e });
    };
	}
]);
