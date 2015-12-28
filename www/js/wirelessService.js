angular.module('sviitti.services')
.service('Wireless', function($q, $timeout, $rootScope) {
  return {
    init: function($scope) {
      $rootScope.btLePeers = [];
      $rootScope.btPeers = [];
      $rootScope.wifiInfoStrings = [];
      if (window.ble) {
        window.ble.enable(function() {
          console.log("Bluetooth enabled.");
        }, function() {
          console.log("Could not enable bluetooth.");
        });
      }
      if (window.bluetoothSerial) {
        // 0 = permanently discoverable.
        window.bluetoothSerial.setDiscoverable(0);
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
              // The better level is more negative.
              if (!best.level || best.level > network.level) {
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
        $rootScope.blLePeers = [];
        window.ble.startScan([], function(result) {
          console.log("Got BLE scan result: " + JSON.stringify(result));
          $timeout(function() {
            $rootScope.$apply(function() {
              $rootScope.bleInfo = result;
              $rootScope.btLePeers.push(result.id);
            });
          }, 0);
        }, function(error) {
          console.log("Got BLE error: " + error);
        });
      } else {
        console.log("No BLE.");
      }
    },
    getBtInfo: function() {
      if (window.bluetoothSerial) {
        bluetoothSerial.discoverUnpaired(function success(list) {
          $timeout(function() {
            $rootScope.$apply(function() {
              console.log("Got bluetooth device list: " + JSON.stringify(list));
              $rootScope.btPeers = list;
            });
          }, 0);
        }, function failure(error) {
          console.log(error);
        });
      } else {
        console.log("No Bluetooth.");
      }
    },
    getWifiInfo: function() {
      var deferred = $q.defer();
      if (window.WifiWizard) {
        // Running on mobile
        window.WifiWizard.getScanResults(function(networks) {
          console.log("Got networks: " + JSON.stringify(networks));
          if (networks && networks.length > 0) {
            var networksStrings = networks.map(function(network) {
              return network.SSID + ":" + network.level + ":" + network.BSSID;
            });
            $timeout(function() {
              $rootScope.$apply(function() {
                $rootScope.wifiInfo = networks;
                $rootScope.wifiInfoStrings = networksStrings;
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
});
