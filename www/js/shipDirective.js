angular.module('sviitti.directives', []).directive('sviittiShip', function(Ship, $q, $timeout) {
  var game;
  const extrudeAmount = 40;
  const plan = Ship.plan;

  var done = $q.defer();
  return {
    restrict: 'E',

    compile: function (element, attrs) {
      const game = new Phaser.Game(3300, 7000, Phaser.CANVAS, attrs.id, { preload: preload, create: create });
      var maxWidth = 0, maxHeight = 0;
      var floorPromises = [];
      var minX = 0;

      function preload() {
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
        plan.floors.forEach(function(floor) {
          var deferred = $q.defer();
          floorPromises.push(deferred.promise);
          $timeout(function() {
            floor.bitmap = new BitmapData(game, floor.floorImage);
            floor.sideBitmap = new BitmapData(game, floor.sideImage);
            deferred.resolve();
          }, 10);
        });
      }

      function create() {
        $q.all(floorPromises).then(function() {
          var y = 0;
          plan.floors.forEach(function(floor) {
            console.log("Adding floor bitmap: " + floor.floor);
            floor.bitmap.addToWorld(floor.alignX, y + floor.alignY);
            y = y + maxHeight;
          });
          y = 0;
          plan.floors.forEach(function(floor) {
            console.log("Adding side bitmap: " + floor.floor);
            floor.sideBitmap.addToWorld(maxWidth + 10 + floor.alignX, y + 10 );
            y = y + extrudeAmount;
          });
          done.resolve();
        });
      }

      return function(scope,elem,attrs) {
      };
    }
  };
});
