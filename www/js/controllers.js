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

.controller('WelcomeCtrl', function($scope, $rootScope, $cordovaOauth) {
  $scope.setNickname = function (nickname) {
    $rootScope.nickname = nickname;
  }
  $scope.login = function() {
    $cordovaOauth.facebook("1678939655686347", ["email", "public_profile"],
        {redirect_uri: "http://www.10.90.135.95.xip.io:8080/callback"})
    .then(function(result){
      displayData($http, result.access_token);
    },  function(error){
      alert("Error: " + error);
    });
  };
})

.controller('WirelessCtrl', function($scope, $rootScope, $timeout, Wireless) {
  Wireless.init($scope);
  Wireless.getBleInfo(function(info) {
    $timeout(function() {
      $scope.$apply(function() {
        $scope.bleInfo = info;
      });
    }, 0);
  });
  $scope.bssid = Wireless.getBssid();
  $scope.wifiInfo = Wireless.getWifiInfo();
})

.controller('ShipCtrl', function($scope, $rootScope) {
});
