angular.module('sviitti.services')
.service('Friends', function($http, $q, $rootScope, Ship) {
  return {
    friends: function() {
      if ($rootScope.mockFriends) {
        return $q.all([]).then(function () {
          return $rootScope.mockFriends;
        });
      } else {
        return $q.all($rootScope.friends.map(function(friendBtId) {
          return $http.get("/bt/" + friendBtId);
        }));
      }
    },
    peers: function(btIds) {
      if ($rootScope.mockFriends) {
        return $q.all([]).then(function () {
          return $rootScope.mockFriends;
        });
      } else {
        return $q.all(btIds.map(function(peerBtId) {
          return $http.get("/bt/" + peerBtId);
        }));
      }
    }
  };
});
