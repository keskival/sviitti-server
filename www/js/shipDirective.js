angular.module('sviitti.directives', []);

angular.module('sviitti.directives').directive('sviittiShip', function(
    Ship, $q, $timeout, $rootScope, $window) {
  const extrudeAmount = 12;
  const plan = Ship.plan;
  const imagesLoadedPromise = $q.defer();
  var friendCircles = {},
    userCircle;

  return {
    restrict: 'E',

    compile: function (element, attrs) {
      const parentElement = element; // element[0].childNodes[0];
      const game = new Phaser.Game(Number(attrs.canvasWidth), Number(attrs.canvasHeight), Phaser.CANVAS,
          parentElement[0],
          { preload: preload, create: create });
      var maxWidth = 0, maxHeight = 0;
      var minX = 0;
      
      var height = $window.innerHeight,
        width = $window.innerWidth;
      console.log("Resolution: " + width + " x " + height);
      
      function preload() {
        game.input.mouse.capture = false;
        game.input.touch.preventDefault = false;

        game.load.image("person_side", "/img/person_side.png");
        game.load.image("background", "/img/background.png");
        plan.floors.forEach(function(floor) {
          game.load.image(floor.floorImage, floor.floorImage);
          game.load.image(floor.sideImage, floor.sideImage);
        });
        game.load.start();
        game.load.onLoadComplete.add(function() {
          imagesLoadedPromise.resolve(true);
        }, this);

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
      return function(scope, elem, attrs) {
        scope.onScroll = function() {
          // FIXME: Not sure how to fix the pinch zoom without screwing up the touch positions.
          /*console.log("Scrolled. Should update Phaser zoom now.");
          game.scale.scaleMode = Phaser.ScaleManager.NONE;
          // game.scale.setShowAll();
          game.scale.refresh();*/
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
        function drawLocationSide(floor, offset, bssidInfo, user, isSelf, scalingFactor,
            height) {
          var personImage = game.add.image(0, 0, "person_side");
          var sprite = game.add.sprite(bssidInfo.x / scalingFactor, offset);
          sprite.addChild(personImage);
          sprite.height = height;
          sprite.inputEnabled = true;
          return sprite;
        };
        function drawFloor() {
          imagesLoadedPromise.promise.then(function() {
            drawFloor2();
          });
        };
        function drawFloor2() {
          var floor = _.findWhere(plan.floors, {floor: $rootScope.floor});
          game.world.removeAll();
          if (floor != null && !attrs.side) {
            game.add.image(0, 0, "background");
            game.add.image(10 + floor.alignX, 10 + floor.alignY, floor.floorImage);
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
                    $rootScope.$apply(function() {
                      if ($rootScope.selectedFriend == friend.btAddress) {
                        $rootScope.selectedFriend = undefined;
                      } else {
                        $rootScope.selectedFriend = friend.btAddress;
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
                  $rootScope.$apply(function() {
                    $rootScope.selectedFriend = undefined;
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
            if ($rootScope.selectedFriend && friendCircles[$rootScope.selectedFriend]) {
              bounce(friendCircles[$rootScope.selectedFriend]);
            } else if (userCircle) {
              bounce(userCircle);
            }
          }
          if (attrs.side) {
            plan.floors.forEach(function(floor, index) {
              var offset = 5 + index * extrudeAmount;
              var floorImage = game.add.image(0, 0, floor.sideImage);
              // ~ 1400 / 360
              var scalingFactor = 5.0;
              var sprite = game.add.sprite(floor.alignX / scalingFactor, offset);
              
              sprite.addChild(floorImage);
              // Not a clue why 3.0 is needed here.
              sprite.height = extrudeAmount - 3.0;
              sprite.width = sprite.width / scalingFactor;
              sprite.inputEnabled = true;
              sprite.events.onInputDown.add(function() {
                $timeout(function() {
                  scope.$apply(function() {
                    $rootScope.floor = floor.floor;
                  });
                }, 0);
              }, game);

              scope.friends.forEach(function (friend) {
                if (plan.bssids[friend.bestBssid].floor == floor.floor) {
                  // The friend is on this floor.
                  var sideSprite = drawLocationSide(floor, offset, plan.bssids[friend.bestBssid],
                      friend, false, scalingFactor, sprite.height);
                  sideSprite.bringToTop();
                }
              });
              if ($rootScope.bssid && plan.bssids[$rootScope.bssid].floor == floor.floor) {
                var userSideSprite = drawLocationSide(floor, offset, plan.bssids[$rootScope.bssid],
                    $rootScope.user, true, scalingFactor, sprite.height);
                userSideSprite.bringToTop();
              }
            });
          }
        };
        $rootScope.$watch("floor", drawFloor);
        scope.$watch("friends", drawFloor);
        $rootScope.$watch("selectedFriend", drawFloor);
        $rootScope.$watch("bssid", drawFloor);
      };
    }
  };
});
