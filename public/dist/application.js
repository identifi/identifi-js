'use strict';
var ApplicationConfiguration = function () {
    var applicationModuleName = 'identifi', applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.bootstrap-slider',
        'angularSpinner',
        'infinite-scroll',
        'persona',
        'angular-parallax',
        'autocomplete'
      ], registerModule = function (moduleName, dependencies) {
        angular.module(moduleName, dependencies || []), angular.module(applicationModuleName).requires.push(moduleName);
      };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule,
      defaultViewpoint: {
        viewpointName: 'Identi.fi',
        viewpointType: 'keyID',
        viewpointValue: '1DqrzTcimQp3Ye88oHgxdU7DBTsM2TRYFj'
      },
      uniqueIdentifierTypes: [
        'url',
        'account',
        'email',
        'bitcoin',
        'bitcoin_address',
        'keyID',
        'gpg_fingerprint',
        'gpg_keyid',
        'phone',
        'tel',
        'google_oauth2'
      ],
      defaultFilters: {
        maxDistance: 0,
        msgType: 'rating',
        receivedOffset: 0,
        sentOffset: 0,
        offset: 0,
        limit: 20
      }
    };
  }();
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies), angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.html5Mode(!0);
  }
]), angular.element(document).ready(function () {
  '#_=_' === window.location.hash && (window.location.hash = '#!'), angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
}), ApplicationConfiguration.registerModule('core'), ApplicationConfiguration.registerModule('identifiers'), ApplicationConfiguration.registerModule('messages'), ApplicationConfiguration.registerModule('users'), angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/'), $stateProvider.state('about', {
      url: '/about',
      templateUrl: 'modules/core/views/about.client.view.html'
    });
  }
]), angular.module('core').controller('HeaderController', [
  '$scope',
  '$location',
  '$http',
  'Authentication',
  'Menus',
  'Persona',
  function ($scope, $location, $http, Authentication, Menus, Persona) {
    if (Persona.watch({
        loggedInUser: Authentication.user.email,
        onlogin: function (assertion) {
          $http.post('/auth/persona', { assertion: assertion }).then(function () {
            location.reload();
          });
        },
        onlogout: function () {
        }
      }), $scope.query = { term: '' }, $scope.addIdentifier = function () {
        $location.path('/id/create/' + $scope.query.term);
      }, $scope.login = function () {
        Persona.request();
      }, $scope.logout = function () {
        Persona.logout();
      }, $scope.logoClicked = function () {
        $scope.query.term = '', $scope.searchKeydown();
      }, $scope.authentication = Authentication, Authentication.user)
      switch (Authentication.user.idType = 'persona' === Authentication.user.provider ? 'email' : 'url', Authentication.user.provider) {
      case 'persona':
        Authentication.user.idValue = Authentication.user.email;
        break;
      case 'twitter':
        Authentication.user.idValue = 'https://twitter.com/' + Authentication.user.username;
        break;
      default:
        Authentication.user.idValue = Authentication.user.providerData.link;
      }
    $scope.isCollapsed = !1, $scope.menu = Menus.getMenu('topbar'), $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    }, $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = !1;
    }), $scope.searchChanged = function () {
      $scope.$root.$broadcast('StartSearch', { queryTerm: $scope.query.term });
    }, $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    }, $scope.searchKeydown = function (e) {
      $scope.$root.$broadcast('SearchKeydown', { event: e });
    };
  }
]), angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    $scope.authentication = Authentication;
  }
]), angular.module('identifi').filter('escape', [function () {
    return function (input) {
      return encodeURIComponent(encodeURIComponent(input));
    };
  }]), angular.module('identifi').filter('encodeURIComponent', [function () {
    return function (input) {
      return encodeURIComponent(input);
    };
  }]), angular.module('core').service('Menus', [function () {
    this.defaultRoles = ['*'], this.menus = {};
    var shouldRender = function (user) {
      if (!user)
        return this.isPublic;
      if (~this.roles.indexOf('*'))
        return !0;
      for (var userRoleIndex in user.roles)
        for (var roleIndex in this.roles)
          if (this.roles[roleIndex] === user.roles[userRoleIndex])
            return !0;
      return !1;
    };
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId])
          return !0;
        throw new Error('Menu does not exists');
      }
      throw new Error('MenuId was not provided');
    }, this.getMenu = function (menuId) {
      return this.validateMenuExistance(menuId), this.menus[menuId];
    }, this.addMenu = function (menuId, isPublic, roles) {
      return this.menus[menuId] = {
        isPublic: isPublic || !1,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      }, this.menus[menuId];
    }, this.removeMenu = function (menuId) {
      this.validateMenuExistance(menuId), delete this.menus[menuId];
    }, this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      return this.validateMenuExistance(menuId), this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: null === isPublic || 'undefined' == typeof isPublic ? this.menus[menuId].isPublic : isPublic,
        roles: null === roles || 'undefined' == typeof roles ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      }), this.menus[menuId];
    }, this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === rootMenuItemURL && this.menus[menuId].items[itemIndex].items.push({
          title: menuItemTitle,
          link: menuItemURL,
          uiRoute: menuItemUIRoute || '/' + menuItemURL,
          isPublic: null === isPublic || 'undefined' == typeof isPublic ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
          roles: null === roles || 'undefined' == typeof roles ? this.menus[menuId].items[itemIndex].roles : roles,
          position: position || 0,
          shouldRender: shouldRender
        });
      return this.menus[menuId];
    }, this.removeMenuItem = function (menuId, menuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === menuItemURL && this.menus[menuId].items.splice(itemIndex, 1);
      return this.menus[menuId];
    }, this.removeSubMenuItem = function (menuId, submenuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items)
          this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL && this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
      return this.menus[menuId];
    }, this.addMenu('topbar');
  }]), angular.module('identifiers').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('search', {
      url: '/',
      templateUrl: 'modules/identifiers/views/list-identifiers.client.view.html'
    }).state('createIdentifier', {
      url: '/id/create/:value',
      templateUrl: 'modules/identifiers/views/create-identifier.client.view.html'
    }).state('viewIdentifier', {
      url: '/id/:idType/:idValue',
      templateUrl: 'modules/identifiers/views/view-identifier.client.view.html'
    }).state('editIdentifier', {
      url: '/id/:idType/:idValue/edit',
      templateUrl: 'modules/identifiers/views/edit-identifier.client.view.html'
    });
  }
]), angular.module('identifiers').controller('IdentifiersController', [
  '$scope',
  '$rootScope',
  '$window',
  '$stateParams',
  '$location',
  '$http',
  'Authentication',
  'Identifiers',
  function ($scope, $rootScope, $window, $stateParams, $location, $http, Authentication, Identifiers) {
    $scope.authentication = Authentication, $scope.tabs = [
      { active: !0 },
      { active: !1 },
      { active: !1 }
    ], $scope.info = {}, $scope.sent = [], $scope.received = [], $scope.trustpaths = [], $rootScope.filters = $rootScope.filters || ApplicationConfiguration.defaultFilters, angular.extend($rootScope.filters, {
      receivedOffset: 0,
      sentOffset: 0
    }), $rootScope.viewpoint = $scope.authentication.user ? {
      viewpointName: $scope.authentication.user.displayName,
      viewpointType: 'email',
      viewpointValue: $scope.authentication.user.email
    } : $rootScope.viewpoint || ApplicationConfiguration.defaultViewpoint, $scope.newIdentifier = {
      type: '',
      value: $stateParams.value
    }, $scope.queryTerm = '', $scope.goToID = function (type, value) {
      $location.path('/id/' + encodeURIComponent(type) + '/' + encodeURIComponent(value));
    }, $scope.dropdownSearchSelect = function (suggestion) {
      $scope.goToID(suggestion.linkTo[0], suggestion.linkTo[1]), $scope.queryTerm = '';
    }, $scope.collapseLevel = {}, $scope.collapseFilters = $window.innerWidth < 992;
    var processMessages = function (messages) {
        for (var key in messages)
          if (!isNaN(key)) {
            var msg = messages[key], gravatarEmail = msg.authorEmail;
            '' === msg.authorEmail && (gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1]), msg.gravatar = CryptoJS.MD5(gravatarEmail).toString(), msg.linkToAuthor = msg.data.signedData.author[0];
            var i;
            for (i = 0; i < msg.data.signedData.author.length; i++)
              if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0]) > -1) {
                msg.linkToAuthor = msg.data.signedData.author[i];
                break;
              }
            for (msg.linkToRecipient = msg.data.signedData.recipient[0], i = 0; i < msg.data.signedData.recipient.length; i++)
              if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.recipient[i][0]) > -1) {
                msg.linkToRecipient = msg.data.signedData.recipient[i];
                break;
              }
            var alpha, signedData = msg.data.signedData;
            switch (msg.panelStyle = 'panel-default', msg.iconStyle = '', msg.hasSuccess = '', msg.bgColor = '', msg.iconCount = new Array(1), signedData.type) {
            case 'confirm_connection':
              msg.iconStyle = 'glyphicon glyphicon-ok', msg.hasSuccess = 'has-success';
              break;
            case 'connection':
              msg.iconStyle = 'glyphicon glyphicon-ok', msg.hasSuccess = 'has-success';
              break;
            case 'refute_connection':
              msg.iconStyle = 'glyphicon glyphicon-remove', msg.hasSuccess = 'has-error';
              break;
            case 'rating':
              var rating = signedData.rating, neutralRating = (signedData.minRating + signedData.maxRating) / 2, maxRatingDiff = signedData.maxRating - neutralRating, minRatingDiff = signedData.minRating - neutralRating;
              rating > neutralRating ? (msg.panelStyle = 'panel-success', msg.iconStyle = 'glyphicon glyphicon-thumbs-up', msg.iconCount = 2 > maxRatingDiff ? msg.iconCount : new Array(Math.ceil(3 * rating / maxRatingDiff)), alpha = (rating - neutralRating - 0.5) / maxRatingDiff / 1.25 + 0.2, msg.bgColor = 'background-image:linear-gradient(rgba(223,240,216,' + alpha + ') 0%, rgba(208,233,198,' + alpha + ') 100%);background-color: rgba(223,240,216,' + alpha + ');') : neutralRating > rating ? (msg.panelStyle = 'panel-danger', msg.iconStyle = 'glyphicon glyphicon-thumbs-down', msg.iconCount = minRatingDiff > -2 ? msg.iconCount : new Array(Math.ceil(3 * rating / minRatingDiff)), alpha = (rating - neutralRating + 0.5) / minRatingDiff / 1.25 + 0.2, msg.bgColor = 'background-image:linear-gradient(rgba(242,222,222,' + alpha + ') 0%, rgba(235,204,204,' + alpha + ') 100%);background-color: rgba(242,222,222,' + alpha + ');') : (msg.panelStyle = 'panel-warning', msg.iconStyle = 'glyphicon glyphicon-question-sign');
            }
          }
      }, scrollTo = function (el) {
        if (el) {
          var pos = el.getBoundingClientRect();
          pos.top && (pos.top - 60 < window.pageYOffset ? window.scrollTo(0, pos.top - 60) : pos.bottom > window.pageYOffset + (window.innerHeight || document.documentElement.clientHeight) && window.scrollTo(0, pos.bottom - (window.innerHeight || document.documentElement.clientHeight) + 15));
        }
      };
    $scope.dropdownSearch = function (query) {
      $scope.search(query, 3);
    }, $scope.search = function (query, limit) {
      $rootScope.pageTitle = '', Identifiers.query(angular.extend({ idValue: query || $scope.queryTerm || '' }, { limit: limit ? limit : 20 }, $rootScope.filters.maxDistance > -1 ? $rootScope.viewpoint : {}), function (res) {
        $scope.identifiers = res, $scope.identifiers.length > 0 && ($scope.identifiers.activeKey = 0, $scope.identifiers[0].active = !0);
        for (var i = 0; i < $scope.identifiers.length; i++) {
          var id = $scope.identifiers[i];
          for (var j in id)
            switch (!id.linkTo && ApplicationConfiguration.uniqueIdentifierTypes.indexOf(id[j][0]) > -1 && (id.linkTo = id[j]), id[j][0]) {
            case 'email':
              id.email = id[j][1], id.gravatar = CryptoJS.MD5(id[j][1]).toString();
              break;
            case 'name':
              id.name = id[j][1];
              break;
            case 'nickname':
              id.nickname = id[j][1];
              break;
            case 'bitcoin_address':
              id.bitcoin = id[j][1];
              break;
            case 'url':
              id[j][1].indexOf('twitter.com/') > -1 && (id.twitter = id[j][1].split('twitter.com/')[1]), id[j][1].indexOf('facebook.com/') > -1 && (id.facebook = id[j][1].split('facebook.com/')[1]), id[j][1].indexOf('plus.google.com/') > -1 && (id.googlePlus = id[j][1].split('plus.google.com/')[1]);
            }
          id.linkTo || (id.linkTo = id[0]), id.gravatar || (id.gravatar = CryptoJS.MD5(id[0][1]).toString()), id.name || (id.name = id.nickname ? id.nickname : id[0][1]);
        }
      });
    }, $scope.resultClicked = function (result) {
      result && result.linkTo && $location.path('/id/' + encodeURIComponent(result.linkTo[0]) + '/' + encodeURIComponent(result.linkTo[1]));
    };
    var messagesAdded = !1;
    $scope.$on('MessageAdded', function (event, args) {
      'confirm_connection' === args.message.data.signedData.type ? (args.id.confirmations += 1, -1 === $scope.connections.indexOf(args.id) && $scope.connections.push(args.id)) : 'refute_connection' === args.message.data.signedData.type ? (args.id.refutations += 1, -1 === $scope.connections.indexOf(args.id) && $scope.connections.push(args.id)) : 'rating' === args.message.data.signedData.type && (messagesAdded && $scope.received.shift(), $scope.received.unshift(args.message), messagesAdded = !0, processMessages($scope.received));
    }), $scope.$on('SearchKeydown', function (event, args) {
      switch (args.event ? args.event.which : -1) {
      case 38:
        args.event.preventDefault(), $scope.identifiers.activeKey > 0 && ($scope.identifiers[$scope.identifiers.activeKey].active = !1, $scope.identifiers[$scope.identifiers.activeKey - 1].active = !0, $scope.identifiers.activeKey--), scrollTo(document.getElementById('result' + $scope.identifiers.activeKey));
        break;
      case 40:
        args.event.preventDefault(), $scope.identifiers.activeKey < $scope.identifiers.length - 1 && ($scope.identifiers[$scope.identifiers.activeKey].active = !1, $scope.identifiers[$scope.identifiers.activeKey + 1].active = !0, $scope.identifiers.activeKey++), scrollTo(document.getElementById('result' + $scope.identifiers.activeKey));
        break;
      case 13:
        args.event.preventDefault();
        var id = $scope.identifiers[$scope.identifiers.activeKey];
        $scope.resultClicked(id);
        break;
      case -1:
        clearTimeout($scope.timer), $scope.queryTerm = '', $scope.search();
        break;
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 39:
        break;
      default:
        var el = angular.element(args.event.currentTarget);
        clearTimeout($scope.timer);
        var wait = setTimeout(function () {
            $scope.queryTerm = el.val(), $scope.search();
          }, 300);
        $scope.timer = wait;
      }
    }), $scope.getConnections = function () {
      $scope.connections = Identifiers.connections(angular.extend($rootScope.filters, {
        idType: $scope.idType,
        idValue: $scope.idValue
      }, $rootScope.filters.maxDistance > -1 ? $rootScope.viewpoint : {}), function () {
        var mostConfirmations = $scope.connections.length > 0 ? $scope.connections[0].confirmations : 1;
        $scope.connections.unshift({
          type: $scope.idType,
          value: $scope.idValue,
          confirmations: 1,
          refutations: 0,
          isCurrent: !0
        });
        for (var key in $scope.connections) {
          var conn = $scope.connections[key];
          switch (conn.type) {
          case 'email':
            conn.iconStyle = 'glyphicon glyphicon-envelope', conn.btnStyle = 'btn-success', conn.link = 'mailto:' + conn.value, conn.quickContact = !0, $scope.info.email = $scope.info.email || conn.value;
            break;
          case 'bitcoin_address':
          case 'bitcoin':
            conn.iconStyle = 'fa fa-bitcoin', conn.btnStyle = 'btn-primary', conn.link = 'https://blockchain.info/address/' + conn.value, conn.quickContact = !0;
            break;
          case 'gpg_fingerprint':
          case 'gpg_keyid':
            conn.iconStyle = 'fa fa-key', conn.btnStyle = 'btn-default', conn.link = 'https://pgp.mit.edu/pks/lookup?op=get&search=0x' + conn.value;
            break;
          case 'account':
            conn.iconStyle = 'fa fa-at';
            break;
          case 'nickname':
            $scope.info.nickname = $scope.info.nickname || conn.value, conn.iconStyle = 'glyphicon glyphicon-font';
            break;
          case 'name':
            $scope.info.name = $scope.info.name || conn.value, conn.iconStyle = 'glyphicon glyphicon-font';
            break;
          case 'phone':
            conn.iconStyle = 'glyphicon glyphicon-earphone', conn.btnStyle = 'btn-success', conn.link = 'tel:' + conn.value, conn.quickContact = !0;
            break;
          case 'url':
            conn.link = conn.value, conn.value.indexOf('facebook.com/') > -1 ? (conn.iconStyle = 'fa fa-facebook', conn.btnStyle = 'btn-facebook', conn.quickContact = !0) : conn.value.indexOf('twitter.com/') > -1 ? (conn.iconStyle = 'fa fa-twitter', conn.btnStyle = 'btn-twitter', conn.quickContact = !0, $scope.getPhotosFromTwitter(conn.value)) : conn.value.indexOf('plus.google.com/') > -1 ? (conn.iconStyle = 'fa fa-google-plus', conn.btnStyle = 'btn-google-plus', conn.quickContact = !0) : conn.value.indexOf('linkedin.com/') > -1 ? (conn.iconStyle = 'fa fa-linkedin', conn.btnStyle = 'btn-linkedin') : conn.value.indexOf('github.com/') > -1 ? (conn.iconStyle = 'fa fa-github', conn.btnStyle = 'btn-github') : (conn.iconStyle = 'glyphicon glyphicon-link', conn.btnStyle = 'btn-default');
          }
          if (conn.confirmations + conn.refutations > 0) {
            var percentage = 100 * conn.confirmations / (conn.confirmations + conn.refutations);
            if (percentage >= 80) {
              var alpha = conn.confirmations / mostConfirmations * 0.7 + 0.3;
              conn.rowStyle = 'background-color: rgba(223,240,216,' + alpha + ')';
            } else
              conn.rowClass = percentage >= 60 ? 'warning' : 'danger';
          }
          $scope.hasQuickContacts = $scope.hasQuickContacts || conn.quickContact;
        }
        $scope.getPhotosFromGravatar(), $scope.connectionClicked = function (event, id) {
          id.collapse = !id.collapse, id.connectingmsgs = id.connectingmsgs || Identifiers.connectingmsgs(angular.extend({
            idType: $scope.idType,
            idValue: $scope.idValue,
            id2Type: id.type,
            id2Value: id.value
          }, $rootScope.filters), function () {
            for (var key in id.connectingmsgs)
              if (!isNaN(key)) {
                var msg = id.connectingmsgs[key];
                msg.gravatar = CryptoJS.MD5(msg.authorEmail || msg.data.signedData.author[0][1]).toString(), msg.linkToAuthor = msg.data.signedData.author[0];
                var i;
                for (i = 0; i < msg.data.signedData.author.length; i++)
                  if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0] > -1)) {
                    msg.linkToAuthor = msg.data.signedData.author[i];
                    break;
                  }
              }
          });
        }, $scope.getOverview(), $scope.getReceivedMsgs(0), $scope.getSentMsgs(0);
      });
    }, $scope.getOverview = function () {
      $scope.overview = Identifiers.get(angular.extend({}, $rootScope.filters, {
        idType: $scope.idType,
        idValue: $scope.idValue,
        method: 'overview'
      }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
        $scope.info.email = $scope.info.email || $scope.overview.email;
      });
    }, $scope.getSentMsgs = function (offset) {
      isNaN(offset) || ($rootScope.filters.sentOffset = offset);
      var sent = Identifiers.sent(angular.extend($rootScope.filters, {
          idType: $scope.idType,
          idValue: $scope.idValue,
          msgType: $rootScope.filters.msgType,
          offset: $rootScope.filters.sentOffset,
          limit: $rootScope.filters.limit
        }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
          if (processMessages(sent), 0 === $rootScope.filters.sentOffset)
            $scope.sent = sent;
          else
            for (var key in sent)
              isNaN(key) || $scope.sent.push(sent[key]);
          $scope.sent.$resolved = sent.$resolved, $rootScope.filters.sentOffset = $rootScope.filters.sentOffset + sent.length, sent.length < $rootScope.filters.limit && ($scope.sent.finished = !0);
        });
      0 === offset && ($scope.sent = {}), $scope.sent.$resolved = sent.$resolved;
    }, $scope.getReceivedMsgs = function (offset) {
      isNaN(offset) || ($rootScope.filters.receivedOffset = offset);
      var received = Identifiers.received(angular.extend($rootScope.filters, {
          idType: $scope.idType,
          idValue: $scope.idValue,
          msgType: $rootScope.filters.msgType,
          offset: $rootScope.filters.receivedOffset,
          limit: $rootScope.filters.limit
        }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
          if (processMessages(received), 0 === $rootScope.filters.receivedOffset)
            $scope.received = received;
          else
            for (var key in received)
              isNaN(key) || $scope.received.push(received[key]);
          $scope.received.$resolved = received.$resolved, $rootScope.filters.receivedOffset = $rootScope.filters.receivedOffset + received.length, received.length < $rootScope.filters.limit && ($scope.received.finished = !0);
        });
      0 === offset && ($scope.received = {}), $scope.received.$resolved = received.$resolved;
    }, $scope.getPhotosFromTwitter = function () {
      return $scope.isUniqueType ? null : void 0;
    }, $scope.getPhotosFromGravatar = function () {
      var email = $scope.info.email || $scope.idValue;
      $scope.gravatar = CryptoJS.MD5(email).toString(), $scope.isUniqueType && ($scope.profilePhotoUrl = $scope.profilePhotoUrl || 'http://www.gravatar.com/avatar/' + $scope.gravatar + '?d=retro&s=210');
    }, $scope.findOne = function () {
      $scope.idType = decodeURIComponent($stateParams.idType), $scope.idValue = decodeURIComponent($stateParams.idValue), $scope.isUniqueType = ApplicationConfiguration.uniqueIdentifierTypes.indexOf($scope.idType) > -1, $scope.isUniqueType || ($scope.tabs[2].active = !0), $rootScope.pageTitle = ' - ' + $scope.idValue, $scope.getConnections();
      var allPaths = Identifiers.trustpaths(angular.extend({
          idType: $scope.idType,
          idValue: $scope.idValue
        }, $rootScope.viewpoint), function () {
          if (0 !== allPaths.length) {
            var shortestPath = Object.keys(allPaths[0]).length;
            angular.forEach(allPaths[0], function (value, i) {
              for (var set = {}, row = [], j = 0; j < allPaths.length && !(Object.keys(allPaths[j]).length > shortestPath); j++) {
                var id = allPaths[j][i];
                id.gravatar = CryptoJS.MD5(id[1]).toString(), set[id[0] + id[1]] = id;
              }
              for (var key in set)
                row.push(set[key]);
              $scope.trustpaths.push(row);
            }), $scope.trustpaths[0][0].name = { name: $rootScope.viewpoint.viewpointName }, $scope.trustpaths[$scope.trustpaths.length - 1][0].name = { name: $scope.info.name };
            for (var i = 1; i < $scope.trustpaths.length - 1; i++) {
              var n = 0;
              for (var key in $scope.trustpaths[i]) {
                var id = $scope.trustpaths[i][key];
                if (id.name = Identifiers.getname({
                    idType: id[0],
                    idValue: id[1]
                  }), 3 === ++n)
                  break;
              }
            }
          }
        });
    }, $scope.setFilters = function (filters) {
      angular.extend($rootScope.filters, filters), angular.extend($rootScope.filters, {
        offset: 0,
        receivedOffset: 0,
        sentOffset: 0
      }), $scope.getConnections();
    };
  }
]), angular.module('identifiers').factory('Identifiers', [
  '$resource',
  function ($resource) {
    return $resource('api/id/:idType/:idValue/:method', {}, {
      connections: {
        action: 'GET',
        params: { method: 'connections' },
        isArray: !0
      },
      sent: {
        action: 'GET',
        params: { method: 'sent' },
        isArray: !0
      },
      received: {
        action: 'GET',
        params: { method: 'received' },
        isArray: !0
      },
      trustpaths: {
        action: 'GET',
        params: { method: 'trustpaths' },
        isArray: !0
      },
      getname: {
        action: 'GET',
        params: { method: 'getname' }
      },
      connectingmsgs: {
        action: 'GET',
        params: { method: 'connectingmsgs' },
        isArray: !0
      }
    });
  }
]), angular.module('messages').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', 'Messages', 'messages', 'dropdown', '/messages(/create)?'), Menus.addSubMenuItem('topbar', 'messages', 'List Messages', 'messages'), Menus.addSubMenuItem('topbar', 'messages', 'New Message', 'messages/create');
  }
]), angular.module('messages').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('listMessages', {
      url: '/messages',
      templateUrl: 'modules/messages/views/list-messages.client.view.html'
    }).state('createMessage', {
      url: '/messages/create',
      templateUrl: 'modules/messages/views/create-message.client.view.html'
    }).state('viewMessage', {
      url: '/messages/:messageId',
      templateUrl: 'modules/messages/views/view-message.client.view.html'
    }).state('editMessage', {
      url: '/messages/:messageId/edit',
      templateUrl: 'modules/messages/views/edit-message.client.view.html'
    });
  }
]), angular.module('messages').controller('MessagesController', [
  '$scope',
  '$rootScope',
  '$window',
  '$stateParams',
  '$location',
  'Authentication',
  'Messages',
  function ($scope, $rootScope, $window, $stateParams, $location, Authentication, Messages) {
    $scope.authentication = Authentication, $scope.idType = decodeURIComponent($stateParams.idType), $scope.idValue = decodeURIComponent($stateParams.idValue), $scope.messages = [], $scope.newMessage = {
      type: 'rating',
      rating: 1,
      comment: ''
    }, $scope.newConnection = {
      type: '',
      value: ''
    }, $scope.iconCount = function (rating) {
      return new Array(Math.max(1, Math.abs(rating)));
    }, $scope.iconStyle = function (rating) {
      var iconStyle = 'neutral';
      return rating > 0 ? iconStyle = 'positive' : 0 > rating && (iconStyle = 'negative'), iconStyle;
    }, $scope.iconClass = function (rating) {
      var iconStyle = 'glyphicon-question-sign';
      return rating > 0 ? iconStyle = 'glyphicon-thumbs-up' : 0 > rating && (iconStyle = 'glyphicon-thumbs-down'), iconStyle;
    }, $rootScope.filters = $rootScope.filters || ApplicationConfiguration.defaultFilters, angular.extend($rootScope.filters, { offset: 0 }), $rootScope.viewpoint = $scope.authentication.user ? {
      viewpointName: $scope.authentication.user.displayName,
      viewpointType: 'email',
      viewpointValue: $scope.authentication.user.email
    } : $rootScope.viewpoint || ApplicationConfiguration.defaultViewpoint, $scope.collapseFilters = $window.innerWidth < 992;
    var processMessages = function (messages) {
      for (var key in messages)
        if (!isNaN(key)) {
          var msg = messages[key], gravatarEmail = msg.authorEmail;
          '' === msg.authorEmail && (gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1]), msg.gravatar = CryptoJS.MD5(gravatarEmail).toString(), msg.linkToAuthor = msg.data.signedData.author[0];
          var i;
          for (i = 0; i < msg.data.signedData.author.length; i++)
            if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0]) > -1) {
              msg.linkToAuthor = msg.data.signedData.author[i];
              break;
            }
          for (msg.linkToRecipient = msg.data.signedData.recipient[0], i = 0; i < msg.data.signedData.recipient.length; i++)
            if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.recipient[i][0]) > -1) {
              msg.linkToRecipient = msg.data.signedData.recipient[i];
              break;
            }
          var alpha, signedData = msg.data.signedData;
          switch (msg.panelStyle = 'panel-default', msg.iconStyle = '', msg.hasSuccess = '', msg.bgColor = '', msg.iconCount = new Array(1), signedData.type) {
          case 'confirm_connection':
            msg.iconStyle = 'glyphicon glyphicon-ok', msg.hasSuccess = 'has-success';
            break;
          case 'connection':
            msg.iconStyle = 'glyphicon glyphicon-ok', msg.hasSuccess = 'has-success';
            break;
          case 'refute_connection':
            msg.iconStyle = 'glyphicon glyphicon-remove', msg.hasSuccess = 'has-error';
            break;
          case 'rating':
            var rating = signedData.rating, neutralRating = (signedData.minRating + signedData.maxRating) / 2, maxRatingDiff = signedData.maxRating - neutralRating, minRatingDiff = signedData.minRating - neutralRating;
            rating > neutralRating ? (msg.panelStyle = 'panel-success', msg.iconStyle = 'glyphicon glyphicon-thumbs-up', msg.iconCount = 2 > maxRatingDiff ? msg.iconCount : new Array(Math.ceil(3 * rating / maxRatingDiff)), alpha = (rating - neutralRating - 0.5) / maxRatingDiff / 1.25 + 0.2, msg.bgColor = 'background-image:linear-gradient(rgba(223,240,216,' + alpha + ') 0%, rgba(208,233,198,' + alpha + ') 100%);background-color: rgba(223,240,216,' + alpha + ');') : neutralRating > rating ? (msg.panelStyle = 'panel-danger', msg.iconStyle = 'glyphicon glyphicon-thumbs-down', msg.iconCount = minRatingDiff > -2 ? msg.iconCount : new Array(Math.ceil(3 * rating / minRatingDiff)), alpha = (rating - neutralRating + 0.5) / minRatingDiff / 1.25 + 0.2, msg.bgColor = 'background-image:linear-gradient(rgba(242,222,222,' + alpha + ') 0%, rgba(235,204,204,' + alpha + ') 100%);background-color: rgba(242,222,222,' + alpha + ');') : (msg.panelStyle = 'panel-warning', msg.iconStyle = 'glyphicon glyphicon-question-sign');
          }
        }
    };
    $scope.create = function (event, params, id) {
      event.stopPropagation();
      var message = new Messages({
          recipientType: $scope.idType,
          recipientValue: $scope.idValue
        });
      angular.extend(message, params), message.$save(function () {
        $scope.newMessage.comment = '', $scope.newMessage.rating = 1, $scope.newConnection.type = '', $scope.newConnection.value = '', $scope.$root.$broadcast('MessageAdded', {
          message: message,
          id: id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function (offset) {
      $rootScope.pageTitle = ' - Latest messages', isNaN(offset) || ($rootScope.filters.offset = offset);
      var params = angular.extend({
          idType: $scope.idType,
          idValue: $scope.idValue
        }, $rootScope.filters, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : {}), messages = Messages.query(params, function () {
          if (processMessages(messages), 0 === $rootScope.filters.offset)
            $scope.messages = messages;
          else
            for (var key in messages)
              isNaN(key) || $scope.messages.push(messages[key]);
          $scope.messages.$resolved = messages.$resolved, $rootScope.filters.offset = $rootScope.filters.offset + (messages.length || 0), messages.length < $rootScope.filters.limit && ($scope.messages.finished = !0);
        });
      0 === offset && ($scope.messages = {}), $scope.messages.$resolved = messages.$resolved;
    }, $scope.findOne = function () {
      $scope.message = Messages.get({ messageId: $stateParams.messageId }, function () {
        $rootScope.pageTitle = ' - Message ' + $stateParams.messageId, $scope.message.strData = JSON.stringify($scope.message.data, void 0, 2), $scope.message.authorGravatar = CryptoJS.MD5($scope.message.authorEmail || $scope.message.data.signedData.author[0][1]).toString(), $scope.message.recipientGravatar = CryptoJS.MD5($scope.message.recipientEmail || $scope.message.data.signedData.recipient[0][1]).toString();
      });
    }, $scope.setFilters = function (filters) {
      angular.extend($rootScope.filters, filters), angular.extend($rootScope.filters, {
        offset: 0,
        receivedOffset: 0,
        sentOffset: 0
      }), $scope.find(0);
    };
  }
]), angular.module('messages').factory('Messages', [
  '$resource',
  function ($resource) {
    return $resource('api/messages/:messageId', { messageId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              Authentication.user = null, $location.path('signin');
              break;
            case 403:
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]), angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]), angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$rootScope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $rootScope, $http, $location, Authentication) {
    $scope.authentication = Authentication, $scope.authentication.user && $location.path('/'), $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication, $scope.authentication.user && $location.path('/'), $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null, $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        $scope.credentials = null, $scope.success = response.message;
      }).error(function (response) {
        $scope.credentials = null, $scope.error = response.message;
      });
    }, $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null, $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        $scope.passwordDetails = null, Authentication.user = response, $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user, $scope.user || $location.path('/'), $scope.hasConnectedAdditionalSocialAccounts = function () {
      for (var i in $scope.user.additionalProvidersData)
        return !0;
      return !1;
    }, $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    }, $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null, $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        $scope.success = !0, $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = !0, Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else
        $scope.submitted = !0;
    }, $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null, $http.post('/users/password', $scope.passwordDetails).success(function () {
        $scope.success = !0, $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').factory('Authentication', [function () {
    var _this = this;
    return _this._data = { user: window.user }, _this._data;
  }]), angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);