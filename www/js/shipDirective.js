angular.module('sviitti.directives', []);

angular.module('sviitti.directives').directive('sviittiShip', function(Ship, $q, $timeout, $rootScope) {
  const extrudeAmount = 40;
  const plan = Ship.plan;
  var friendCircles = {},
    userCircle;

  return {
    restrict: 'E',

    compile: function (element, attrs) {
      const parentElement = element; // element[0].childNodes[0];
      const game = new Phaser.Game(Number(attrs.canvasWidth), Number(attrs.canvasHeight), Phaser.CANVAS,
          parentElement[0],
          { preload: preload, create: create });
      // Allowing scrolling.
      // input.enabled = false;      
      var maxWidth = 0, maxHeight = 0;
      var minX = 0;
      
      function preload() {
        game.input.mouse.capture = false;
        game.input.touch.preventDefault = false;

        game.load.image("background", "/img/background.png");
        plan.floors.forEach(function(floor) {
          game.load.image(floor.floorImage, floor.floorImage);
          game.load.image(floor.sideImage, floor.sideImage);
        });
        plan.floors.forEach(function(floor) {
          var bb = floor.bb; // floor.bb_no_text || floor.bb;
          var w = bb[2] - bb[0];
          var h = bb[3] - bb[1];
          if (w > maxWidth) {
            maxWidth = w;
          }
          if (h > maxHeight) {
            maxHeight = h;
          }
          if (bb[0] < minX) {
            minX = bb[0];
          }
          floor.w = w;
          floor.h = h;
        });
        plan.floors.forEach(function(floor) {
          // This is used to calculate the respective alignments.
          var bb_no_text = floor.bb_no_text || floor.bb;
          var w_no_text = bb_no_text[2] - bb_no_text[0];
          var h_no_text = bb_no_text[3] - bb_no_text[1];
          // How much we must add to y to make this align so that centers are aligned.
          // Always positive.
          floor.alignY = (maxHeight - h_no_text) / 2;
          // How much we must add to x to make this align so that left sides are aligned.
          // Always positive.
          floor.alignX = bb_no_text[0] - minX;
        });
      }

      function create() {
      }
      return function(scope,elem,attrs) {
        scope.onScroll = function() {
          console.log("Scrolled. Should update Phaser zoom now.");
          game.scale.scaleMode = Phaser.ScaleManager.NONE;
          // game.scale.setShowAll();
          game.scale.refresh();
        };
        
        function drawCircle(x, y, color, dotColor, range) {
          var circle = game.add.graphics(0, 0);

          circle.lineStyle(1, 0x202020);
          circle.beginFill(color, 0.5);
          circle.drawCircle(0, 0, range);
          circle.endFill();
          circle.lineStyle(1, 0xa0a0a0);
          circle.beginFill(dotColor, 1);
          circle.drawCircle(0, 0, 4);
          circle.endFill();

          var sprite = game.add.sprite(x, y);
          sprite.addChild(circle);
          sprite.inputEnabled = true;
          // sprite.hitArea = new PIXI.Rectangle(0, 0, range, range);
          return sprite;
        };
        function drawLocation(bssidInfo, user, isSelf) {
          var color = 0x1010a0;
          var dotColor = 0x000000;
          if (isSelf) {
            color = 0x10a010;
            dotColor = 0xff0000;
          }
          return drawCircle(bssidInfo.x, bssidInfo.y, color, dotColor, bssidInfo.range);
        };
        function drawFloor() {
          var floor = _.findWhere(plan.floors, {floor: scope.floor});
          if (floor != null) {
            game.world.removeAll();
            game.add.image(0, 0, "background");
            game.add.image(10 + floor.alignX, 10 + floor.alignY, floor.floorImage);
            game.add.image(10 + floor.alignX, maxHeight + 60, floor.sideImage);
            // Draw the friends.
            friendCircles = {};
            scope.friends.forEach(function (friend) {
              if (plan.bssids[friend.bestBssid].floor == floor.floor) {
                // The friend is on this floor.
                var sprite = drawLocation(plan.bssids[friend.bestBssid], friend, false);
                friendCircles[friend.btAddress] = sprite;
                function friendTapped() {
                  console.log("Clicked friend: " + friend.btAddress);
                  $timeout(function() {
                    scope.$apply(function() {
                      if (scope.selectedFriend == friend.btAddress) {
                        scope.selectedFriend = undefined;
                      } else {
                        scope.selectedFriend = friend.btAddress;
                      }
                    });
                  }, 0);
                };
                sprite.events.onInputDown.add(friendTapped, game);
              }
            });
            // Draw the user.
            userCircle = undefined;
            if ($rootScope.bssid && plan.bssids[$rootScope.bssid].floor == floor.floor) {
              userCircle = drawLocation(plan.bssids[$rootScope.bssid], $rootScope.user, true);
              function selfTapped() {
                console.log("Clicked self.");
                $timeout(function() {
                  scope.$apply(function() {
                    scope.selectedFriend = undefined;
                  });
                }, 0);
              };
              userCircle.events.onInputDown.add(selfTapped, game);
            }
            function bounce(circle) {
              function enlarge() {
                var tween = game.add.tween(circle.scale).to( { x: 1.1, y: 1.1 }, 100, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(shrink, game);
                return tween;
              };
              function shrink() {
                var tween = game.add.tween(circle.scale).to( { x: 1, y: 1 }, 100, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(enlarge, game);
                return tween;
              };
              return enlarge();
            }
            // Animating the user self, or the selected friend.
            if (scope.selectedFriend && friendCircles[scope.selectedFriend]) {
              bounce(friendCircles[scope.selectedFriend]);
            } else if (userCircle) {
              bounce(userCircle);
            }
          }
        };
        scope.$watch("floor", drawFloor);
        scope.$watch("friends", drawFloor);
        scope.$watch("selectedFriend", drawFloor);
        $rootScope.$watch("bssid", drawFloor);
      };
    }
  };
});
