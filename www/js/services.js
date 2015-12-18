angular.module('sviitti.services', [])
.service('Wireless', function($q, $timeout, $rootScope) {
  return {
    init: function($scope) {
      $scope.btPeers = [];
      if (window.ble) {
        window.ble.enable(function() {
          console.log("Bluetooth enabled.");
        }, function() {
          console.log("Could not enable bluetooth.");
        });
      }
    },
    getBssid: function() {
      var deferred = $q.defer();
      if (window.WifiWizard) {
        // Running on mobile
        window.WifiWizard.getScanResults(function(networks) {
          if (networks && networks.length > 0) {
            var best = {};
            networks.forEach(function(network) {
              if (!best.level || best.level < network.level) {
                best.level = network.level;
                best.BSSID = network.BSSID;
              }
            });
            deferred.resolve(best.BSSID);
            $timeout(function() {
              $rootScope.$apply(function() {
                $rootScope.bssid = best.BSSID;
              });
            }, 0);
          } else {
            deferred.resolve("No networks.");
          }
        }, function(error) {
          console.log("Error! " + error);
          deferred.reject(error);
        });
      } else {
        return "No BSSID available for normal browsers. Use the mobile app.";
      }
      return deferred.promise;
    },
    getBleInfo: function() {
      if (window.ble) {
        window.ble.getAddress(function(result) {
          $timeout(function() {
            $rootScope.$apply(function() {
              $rootScope.btAddress = result;
            });
          }, 0);
          console.log("Got BT address: " + result);
        }, function(error) {
          console.log("Got BT error: " + error);
        });
        window.ble.startScan([], function(result) {
          console.log("Got BLE scan result: " + JSON.stringify(result));
          $timeout(function() {
            $rootScope.$apply(function() {
              $rootScope.bleInfo = result;
              $rootScope.btPeers.push(result.id);
            });
          }, 0);
        }, function(error) {
          console.log("Got BLE error: " + error);
        });
      } else {
        console.log("No BLE.");
      }
    },
    getWifiInfo: function() {
      var deferred = $q.defer();
      if (window.WifiWizard) {
        // Running on mobile
        window.WifiWizard.getScanResults(function(networks) {
          console.log("Got networks: " + JSON.stringify(networks));
          if (networks && networks.length > 0) {
            var networksString = networks.map(function(network) {
              return network.SSID + ":" + network.level + ":" + network.BSSID;
            }).join(", ");
            $timeout(function() {
              $rootScope.$apply(function() {
                $rootScope.wifiInfo = networks;
                $rootScope.wifiInfoString = networksString;
              });
            }, 0);
            deferred.resolve(networksString);
          } else {
            deferred.resolve("No networks.");
          }
        }, function(error) {
          console.log("Error! " + error);
          deferred.reject(error);
        });
      } else {
        return "No BSSID available for normal browsers. Use the mobile app.";
      }
      return deferred.promise;
    }
  };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
