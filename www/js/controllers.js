angular.module('sviitti.controllers', ['ionic-timepicker', 'ionic-datepicker'])

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

.controller('ShipCtrl', function($scope, $rootScope, $timeout, Ship, Friends) {
  $scope.plan = Ship.plan;
  $timeout(function() {
    $scope.$apply(function() {
      if ($rootScope.bssid && Ship.plan.bssids[$rootScope.bssid].floor) {
        $rootScope.floor = Ship.plan.bssids[$rootScope.bssid].floor;
      }
    });
  }, 0);
  
  $rootScope.$watch("mockFriends", function () {
    Friends.friends().then(function(friends) {
      $scope.friends = friends;
    });
  });
  Friends.friends().then(function(friends) {
    $scope.friends = friends;
  });
  $scope.floors = Ship.plan.floors.map(function(floor) {
    return floor.floor;
  });
  $scope.selectFloor = function(floor) {
    $rootScope.floor = floor;
  };
  $scope.selectFriend = function(friend) {
    $rootScope.selectedFriend = friend.btAddress;
    $rootScope.floor = Ship.plan.bssids[friend.bestBssid].floor;
  };
  $scope.highlight = function(floor) {
    if (floor === $rootScope.floor) {
      return "button-positive";
    } else {
      return "button-calm";
    }
  };
})

.controller('FriendsCtrl', function($scope, $rootScope, $timeout, Ship, Friends) {
  $rootScope.$watch("mockFriends", function () {
    Friends.friends().then(function(friends) {
      $scope.friends = friends;
    });
  });
  Friends.friends().then(function(friends) {
    $scope.friends = friends;
  });
  $scope.selectFriend = function(friend) {
    $rootScope.selectedFriend = friend.btAddress;
    $rootScope.floor = Ship.plan.bssids[friend.bestBssid].floor;
  };
  $scope.highlightFriend = function(friend) {
    if (friend.btAddress === $rootScope.selectedFriend) {
      return "button-positive";
    } else {
      return "button-calm";
    }
  };
})

.controller('NearbyCtrl', function($scope, $rootScope, $timeout, Wireless, Friends) {
  Wireless.init();
  Wireless.getBtInfo();
  $rootScope.$watch("mockFriends", function () {
    Friends.peers($rootScope.btPeers).then(function(peers) {
      $timeout(function() {
        $scope.$apply(function() {
          $scope.people = peers;
        });
      }, 0);
    });
  });
  $rootScope.$watch("btPeers", function() {
    Friends.peers($rootScope.btPeers).then(function(peers) {
      $timeout(function() {
        $scope.$apply(function() {
          $scope.people = peers;
        });
      }, 0);
    });
  });
})

.controller('RestaurantsCtrl', function($scope, $rootScope, $timeout, $http, POIs) {
  $scope.restaurants = POIs.restaurants;
  $scope.makeReservation = function(restaurant) {
    $timeout(function() {
      $scope.$apply(function() {
        $scope.showReservationDialog = true;
        $scope.reservation = {
            userName: $rootScope.user.name,
            bestBssid: $rootScope.bssid,
            btAddress: $rootScope.btAddress,
            restaurantName: restaurant.name,
            number: 1
          };
      });
    }, 0);
  };
  $scope.uniqueId = 0;
  $scope.cancel = function() {
    $scope.showReservationDialog = false;
    $scope.reservation = undefined;
  };
  $scope.submit = function() {
    var minutes = "" + $scope.reservation.time.getUTCMinutes();
    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }
    var timeStr = $scope.reservation.time.getUTCHours() + ":" + minutes;
    var reservation = {
        userName: $scope.reservation.user,
        bestBssid: $scope.reservation.bssid,
        btAddress: $scope.reservation.btAddress,
        restaurantName: $scope.reservation.restaurantName,
        number: $scope.reservation.number,
        date: $scope.reservation.date.toISOString().slice(0, 10),
        time: timeStr
        };
    $http.put("reservation", reservation);
    // Now all reservations are just simply accepted, pending restaurant UI.
    console.log("Made reservation for: " + JSON.stringify(reservation));
    if (!$rootScope.user.reservations) {
      $rootScope.user.reservations = [];
    }
    $rootScope.user.reservations.push($scope.reservation);
    // Faking the response.
    var notification = {
        id: $scope.uniqueId,
        text: "Pöytävarauksesi on hyväksytty: " + $scope.reservation.restaurantName + ", kello: " +
          $scope.reservation.date.toISOString().slice(0, 10) + " " + timeStr + ", " + $scope.reservation.number + " henkeä.",
        data: { key: $scope.uniqueId, reservation: reservation
        }
      };
    $scope.uniqueId = $scope.uniqueId + 1;
    console.log("Showing notification: " + JSON.stringify(notification));
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
      window.cordova.plugins.notification.local.schedule(notification);
    }
    $scope.showReservationDialog = false;
    $scope.reservation = undefined;
  };
  $scope.datePickerObject = {
      titleLabel: 'Varauksen päivämäärä',
      todayLabel: 'Tänään',
      closeLabel: 'Peruuta',
      setLabel: 'Aseta',
      setButtonType : 'button-balanced',
      todayButtonType : 'button-positive',
      closeButtonType : 'button-assertive',
      inputDate: new Date(),
      mondayFirst: true,
      templateType: 'popup',
      showTodayButton: 'true',
      modalHeaderColor: 'bar-positive',
      modalFooterColor: 'bar-positive',
      from: new Date(2016,1,12),
      to: new Date(2016, 1, 14),
      callback: function (val) {
        $scope.reservation.date = val;
        $scope.datePickerObject.dateAsString = "";
        if (val) {
          $scope.datePickerObject.dateAsString = val.toISOString().slice(0, 10);
        }
      },
      dateFormat: 'dd-MM-yyyy',
      closeOnSelect: false,
    };
  $scope.timePickerObject = {
      inputEpochTime: (12 * 60 * 60),
      step: 15,
      format: 24,
      titleLabel: 'Varauksen aika',
      setLabel: 'Aseta',
      closeLabel: 'Peruuta',
      setButtonType: 'button-balanced',
      closeButtonType: 'button-assertive',
      callback: function (val) {
        if (val) {
          var selectedTime = new Date(val * 1000);
          $scope.reservation.time = selectedTime;
          var minutes = "" + selectedTime.getUTCMinutes();
          if (minutes.length < 2) {
            minutes = "0" + minutes;
          }
          $scope.timePickerObject.timeAsString = selectedTime.getUTCHours() + ":" +
            minutes;
        } else {
          $scope.reservation.time = undefined;
          $scope.timePickerObject.timeAsString = undefined;
        }
      }
    };
})

.controller('MapCtrl', function($scope, $rootScope) {
  var initialLocation;
  var myOptions = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"), myOptions);

  // Try W3C Geolocation
  // FIXME: Use the offered API here.
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
      var locationCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: initialLocation,
        radius: 100
      });

    }, function() {
      console.log("Error in geolocation.");
    });
  }
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
      btAddress: $rootScope.btAddress || "",
      randomFriends: $rootScope.mockFriends || false
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
  $scope.$watch("form.randomFriends", function() {
    if ($scope.form.randomFriends) {
      $rootScope.mockFriends = Object.keys(Ship.plan.bssids).filter(function (a) {
        return Math.random() > 0.5;
      }).map(function (bssid, index) {
        return {
          user: "MockUser" + index,
          bestBssid: bssid,
          btAddress: "mockBtAddress" + index,
        };
      });
    } else {
      $rootScope.mockFriends = false;
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
