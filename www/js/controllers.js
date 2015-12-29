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

.controller('ShipCtrl', function($scope, $rootScope, Ship, Friends) {
  $scope.plan = Ship.plan;
  $scope.friends = Friends.friends();
  $scope.floors = Ship.plan.floors.map(function(floor) {
    return floor.floor;
  });
  $scope.selectFloor = function(floor) {
    $scope.floor = floor;
  };
})

.controller('GenerateImagesCtrl', function($scope, $rootScope) {
  $scope.urls = [];
  $scope.$watch("urls", function() {
    console.log("URLs changed!");
  });
})

.controller('MockCtrl', function($scope, $rootScope, $timeout, Ship) {
  $scope.plan = Ship.plan;
  $scope.form = {
      fbid: $rootScope.user.fbid || "",
      btAddress: $rootScope.btAddress || ""
  };
  
  $scope.bssids = Object.keys($scope.plan.bssids).map(function(bssid) {
    return {
      bssid: bssid,
      name: $scope.plan.bssids[bssid].name
    };
  });
  $scope.$watch("form.selectedBssid", function() {
    if ($scope.form.selectedBssid != null) {
      $timeout(function() {
        $rootScope.$apply(function() {
          $rootScope.bssid = $scope.form.selectedBssid;
        });
      }, 0);
    }
  });
  $scope.$watch("form.btAddress", function() {
    if ($scope.form.btAddress !== "") {
      $timeout(function() {
        $rootScope.$apply(function() {
          $rootScope.btAddress = $scope.form.btAddress;
        });
      }, 0);
    }
  });
  $scope.$watch("form.fbid", function() {
    if ($scope.form.fbid !== "" && $scope.form.fbid != null) {
      $timeout(function() {
        $rootScope.$apply(function() {
          $rootScope.user.fbid = $scope.form.fbid;
        });
      }, 0);
    }
  });
  $rootScope.$watch("user.fbid", function() {
    if ($rootScope.user.fbid !== "" && $rootScope.user.fbid != null) {
      $rootScope.user.photo = "https://graph.facebook.com/v2.5/" + $rootScope.user.fbid + "/picture";
    }
  });
});
