angular.module('sviitti.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('WelcomeCtrl', function($scope, $rootScope, $cordovaOauth, $http, $timeout) {
  $scope.setNickname = function (nickname) {
    $timeout(function() {
      $rootScope.$apply(function() {
        $rootScope.user = {
            name: nickname
        };
      });
    }, 0);
  };
  $scope.logout = function() {
    $rootScope.user = null;
  };
  $scope.login = function() {
    $cordovaOauth.facebook(FACEBOOK_APP_ID, ["email", "public_profile"],
        {redirect_uri: "http://www." + SERVER_IP + ".xip.io:8080/callback"})
    .then(function(result) {
      $timeout(function() {
        $rootScope.$apply(function() {
          console.log("Facebook login fine with: " + JSON.stringify(result));
          $rootScope.user = {};
          $rootScope.user.accessToken = result.access_token;
          $http.get("https://graph.facebook.com/v2.5/me", {
            params: {
              access_token: $rootScope.user.accessToken
            }
          }).then(function(meResponse) {
            $timeout(function() {
              $rootScope.$apply(function() {
                console.log("Got Facebook me response: " + JSON.stringify(meResponse));
                $rootScope.user.name = meResponse.data.name;
                $rootScope.user.fbid = meResponse.data.id;
                $rootScope.user.photo = "https://graph.facebook.com/v2.5/" + $rootScope.user.fbid + "/picture";
              });
            }, 0)
          });
        });
      }, 0)
    },  function(error){
      alert("Error: " + error);
    });
  };
})

.controller('WirelessCtrl', function($scope, $rootScope, $timeout, Wireless) {
  $scope.refresh = function() {
    Wireless.getBleInfo();
    Wireless.getBtInfo();
    Wireless.getBssid();
    Wireless.getWifiInfo();
  };
})

.controller('ShipCtrl', function($scope, $rootScope) {
})
.controller('GenerateImagesCtrl', function($scope, $rootScope) {
  $scope.urls = [];
  $scope.$watch("urls", function() {
    console.log("URLs changed!");
  });
});
