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
})
.service('Ship', function($q, $timeout, $rootScope) {
  // All the pictures are horizontally aligned with each other, at least within one image file.
  // The vertical alignment can be deduced from the common center line which can be calculated
  // from the bounding box without the texts respectively.
  const plan = {
      legend: {
        image: '/img/balticprincess_2_4.png',
        bb: [310, 1046, 1223, 1149]
      },
      floors: [
               {
                 floor: 12,
                 image: '/img/balticprincess_9_12.png',
                 bb: [332, 348, 1386, 488],
                 floorImage: '/img/12.png',
                 sideImage: '/img/12s.png'
               },
               {
                 floor: 11,
                 image: '/img/balticprincess_9_12.png',
                 bb: [244, 588, 1426, 825],
                 floorImage: '/img/11.png',
                 sideImage: '/img/11s.png'
               },
               {
                 floor: 10,
                 image: '/img/balticprincess_9_12.png',
                 bb: [208, 876, 1426, 1113],
                 floorImage: '/img/10.png',
                 sideImage: '/img/10s.png'
               },
               {
                 floor: 9,
                 image: '/img/balticprincess_9_12.png',
                 bb: [142, 1180, 1432, 1385],
                 floorImage: '/img/9.png',
                 sideImage: '/img/9s.png'
               },
               {
                 floor: 8,
                 image: '/img/balticprincess_5_8.png',
                 bb: [142, 208, 1449, 412],
                 floorImage: '/img/8.png',
                 sideImage: '/img/8s.png'
               },
               {
                 floor: 7,
                 image: '/img/balticprincess_5_8.png',
                 bb: [130, 489, 1472, 708],
                 floorImage: '/img/7.png',
                 sideImage: '/img/7s.png'
               },
               {
                 floor: 6,
                 image: '/img/balticprincess_5_8.png',
                 bb: [122, 784, 1492, 1005],
                 bb_no_text: [122, 784, 1491, 990],
                 floorImage: '/img/6.png',
                 sideImage: '/img/6s.png'
               },
               {
                 floor: 5,
                 image: '/img/balticprincess_5_8.png',
                 bb: [116, 1058, 1606, 1304],
                 bb_no_text: [116, 1072, 1606, 1276],
                 floorImage: '/img/5.png',
                 sideImage: '/img/5s.png'
               },
               {
                 floor: 4,
                 image: '/img/balticprincess_2_4.png',
                 bb: [113, 175, 1604, 381],
                 floorImage: '/img/4.png',
                 sideImage: '/img/4s.png'
               },
               {
                 floor: 3,
                 image: '/img/balticprincess_2_4.png',
                 bb: [113, 495, 1589, 701],
                 floorImage: '/img/3.png',
                 sideImage: '/img/3s.png'
               },
               {
                 floor: 2,
                 image: '/img/balticprincess_2_4.png',
                 bb: [114, 784, 1615, 989],
                 floorImage: '/img/2.png',
                 sideImage: '/img/2s.png'
               }
               ]
  };
  return {
    plan: plan
  };
});
