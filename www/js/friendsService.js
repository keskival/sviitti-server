angular.module('sviitti.services')
.service('Friends', function($http, $q, $rootScope) {
  return {
    friends: function() {
      return $q.all($rootScope.friends.map(function(friendBtId) {
        return $http.get("/bt/" + friendBtId);
      }));
    }
  };
});
