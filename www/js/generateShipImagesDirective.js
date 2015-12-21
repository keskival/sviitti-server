angular.module('sviitti.directives').directive('sviittiGenerateShipImages', function(Ship, $q, $timeout) {
  var game;
  const extrudeAmount = 40;
  const plan = Ship.plan;

  /**
   * 
   * @param bitmap The floorplan bitmap
   * @param height The amount we extrude in pixels
   */
  function getSideBitmap(game, bitmap, height) {
    var sideBitmap = game.make.bitmapData(bitmap.width, height);
    for (var x = 0; x < bitmap.width; x++) {
      var count = 0;
      var sum = {
          r: 0,
          b: 0,
          g: 0
      };
      for (var y = 0; y < bitmap.height; y++) {
        // Going through the bitmap vertically, averaging non-white pixels.
        var pixel = bitmap.getPixel32(x, y);
        var r = ( pixel       ) & 0xFF;
        var g = ( pixel >>  8 ) & 0xFF;
        var b = ( pixel >> 16 ) & 0xFF;
        var a = ( pixel >> 24 ) & 0xFF;
        if (a > 100) {
          // Non-alpha.
          count++;
          sum.r = sum.r + r;
          sum.g = sum.g + g;
          sum.b = sum.b + b;
        }
      }
      var avg = {
          r: 255,
          g: 255,
          b: 255,
          a: 0
      };
      if (count > 8) {
        avg = {
            r: sum.r / count,
            g: sum.g / count,
            b: sum.b / count,
            a: 255
        };
      }
      for (var extrusion = 0; extrusion < height; extrusion++) {
        if (avg.a == 255) {
          sideBitmap.setPixel(x, extrusion, avg.r, avg.g, avg.b, avg.a, false);
        }
      }
    }
    sideBitmap.dirty = true;
    return sideBitmap;
  }

  var done = $q.defer();
  return {
    restrict: 'E',
    scope: {urls: '='},
    compile: function (element, attrs) {
      const game = new Phaser.Game(50, 50, Phaser.CANVAS, attrs.id, { preload: preload, create: create });
      var maxWidth = 0, maxHeight = 0;
      var floorPromises = [];
      var minX = 0;

      function preload() {
        plan.floors.forEach(function(floor) {
          game.load.image(floor.image, floor.image);
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
            console.log("Cropping: " + floor.floor);
            var bb = floor.bb;
            floor.bitmap = game.add.bitmapData(floor.w, floor.h);
            floor.bitmap.copyRect(floor.image, 
                new Phaser.Rectangle(bb[0], bb[1], floor.w, floor.h),
                0, 0);
            floor.dataUrlFloor = floor.bitmap.baseTexture.source.toDataURL("image/png");
            floor.bitmap.update();
            console.log("Creating side bitmap for: " + floor.floor);
            floor.sideBitmap = getSideBitmap(game, floor.bitmap, extrudeAmount);
            floor.dataUrlSide = floor.sideBitmap.baseTexture.source.toDataURL("image/png");
            deferred.resolve();
          }, 10);
        });
      }

      function create() {
        $q.all(floorPromises).then(function() {
          var y = 0;
          plan.floors.forEach(function(floor) {
            console.log("Adding floor bitmap: " + floor.floor);
            //floor.bitmap.addToWorld(floor.alignX, y + floor.alignY);
            y = y + maxHeight;
          });
          y = 0;
          plan.floors.forEach(function(floor) {
            console.log("Adding side bitmap: " + floor.floor);
            //floor.sideBitmap.addToWorld(maxWidth + 10 + floor.alignX, y + 10 );
            y = y + extrudeAmount;
          });
          done.resolve();
        });
      }

      return function(scope,elem,attrs) {
        scope.plan = plan;
        done.promise.then(function() {
          $timeout(function() {
            scope.$apply(function() {
              scope.urls = plan.floors.map(function (floor) {
                var item = {dataUrl: floor.dataUrlFloor, name: "floor: " + floor.floor};
                console.log(JSON.stringify(item));
                return item;
              }).concat(plan.floors.map(function(floor) {
                var item = {dataUrl: floor.dataUrlSide, name: "side: " + floor.floor};
                console.log(JSON.stringify(item));
                return item;
              }));
            });
          }, 0);
        });
      };
    }
  };
});
