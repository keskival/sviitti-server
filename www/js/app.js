// Ionic Starter App

var SERVER_IP = "178.217.128.133";
var FACEBOOK_APP_ID = "1678939655686347";

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('sviitti', ['ionic', 'ngCordova', 'LocalStorageModule',
                           'sviitti.controllers', 'sviitti.services', 'sviitti.directives'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
    }
])
.run(function($ionicPlatform, $rootScope, $http, localStorageService, Wireless) {
  $ionicPlatform.ready(function() {
    $rootScope.user = localStorageService.get("user");
    $rootScope.btAddress = localStorageService.get("btAddress");
    $rootScope.friends = localStorageService.get("friends") || [];
    $rootScope.$watch("user", function() {
      if ($rootScope.user != null) {
          localStorageService.set("user", $rootScope.user);
      }
    });
    $rootScope.$watch("btAddress", function() {
      if ($rootScope.btAddress != null) {
          localStorageService.set("btAddress", $rootScope.btAddress);
      }
    });
    $rootScope.$watch("friends", function() {
      if ($rootScope.friends != null) {
          localStorageService.set("friends", $rootScope.friends);
      }
    });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    Wireless.init();
    function update() {
      if ($rootScope.btAddress) {
        $http.put("update", {
          user: $rootScope.user,
          bestBssid: $rootScope.bssid,
          btAddress: $rootScope.btAddress,
          friends: $rootScope.friends
        });
      }
    }
    // When user info, location or BT address changes, update the server info.
    $rootScope.$watch("user", update);
    $rootScope.$watch("bssid", update);
    $rootScope.$watch("btAddress", update);
    $rootScope.$watch("friends", update);
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.welcome', {
    url: '/welcome',
    views: {
        'tab-welcome': {
          templateUrl: 'templates/tab-welcome.html',
          controller: 'WelcomeCtrl'
        }
      }
  })
  .state('tab.ship', {
    url: '/ship',
    views: {
        'tab-ship': {
          templateUrl: 'templates/tab-ship.html',
          controller: 'ShipCtrl'
        }
      }
  })
  .state('tab.nearby', {
    url: '/nearby',
    views: {
        'tab-nearby': {
          templateUrl: 'templates/tab-nearby.html',
          controller: 'NearbyCtrl'
        }
      }
  })
  .state('tab.wireless', {
    url: '/wireless',
    views: {
        'tab-wireless': {
          templateUrl: 'templates/tab-wireless.html',
          controller: 'WirelessCtrl'
        }
      }
  })
  .state('tab.generateImages', {
    url: '/generateImages',
    views: {
        'tab-generateImages': {
          templateUrl: 'templates/tab-generateImages.html',
          controller: 'GenerateImagesCtrl'
        }
      }
  })
  .state('tab.mock', {
    url: '/mock',
    views: {
        'tab-mock': {
          templateUrl: 'templates/tab-mock.html',
          controller: 'MockCtrl'
        }
      }
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/welcome');

});
