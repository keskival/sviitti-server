angular.module('sviitti.directives', []).directive('sviittiShip', function($q, $timeout) {
  var game;
  //All the pictures are horizontally aligned with each other, at least within one image file.
  //The vertical alignment can be deduced from the common center line which can be calculated
  //from the bounding box without the texts respectively.
  const plan = {
      legend: {
        image: '/img/balticprincess_2_4.png',
        bb: [310, 1046, 1223, 1149]
      },
      floors: [
               {
                 floor: 2,
                 image: '/img/balticprincess_2_4.png',
                 bb: [114, 784, 1615, 989]
               },
               {
                 floor: 3,
                 image: '/img/balticprincess_2_4.png',
                 bb: [113, 495, 1589, 701]
               },
               {
                 floor: 4,
                 image: '/img/balticprincess_2_4.png',
                 bb: [113, 175, 1604, 381]
               },
               {
                 floor: 5,
                 image: '/img/balticprincess_5_8.png',
                 bb: [116, 1058, 1606, 1304],
                 bb_no_text: [116, 1072, 1606, 1276]
               },
               {
                 floor: 6,
                 image: '/img/balticprincess_5_8.png',
                 bb: [122, 784, 1492, 1005],
                 bb_no_text: [122, 784, 1491, 990]
               },
               {
                 floor: 7,
                 image: '/img/balticprincess_5_8.png',
                 bb: [130, 489, 1472, 708]
               },
               {
                 floor: 8,
                 image: '/img/balticprincess_5_8.png',
                 bb: [142, 208, 1449, 143]
               },
               {
                 floor: 9,
                 image: '/img/balticprincess_9_12.png',
                 bb: [142, 1180, 1432, 1385]
               },
               {
                 floor: 10,
                 image: '/img/balticprincess_9_12.png',
                 bb: [208, 876, 1426, 1113]
               },
               {
                 floor: 11,
                 image: '/img/balticprincess_9_12.png',
                 bb: [244, 588, 1426, 825]
               },
               {
                 floor: 12,
                 image: '/img/balticprincess_9_12.png',
                 bb: [332, 348, 1386, 488]
               },
               ]
  };
  /**
   * 
   * @param bitmap The floorplan bitmap
   * @param height The amount we extrude in pixels
   */
  function getSideBitmap(game, bitmap, height) {
    console.log("Generating side bitmap.");
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
        if (r < 250 || g < 250 || b < 250) {
          // Non-white.
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
      };
      if (count > 0) {
        avg = {
            r: sum.r / count,
            g: sum.g / count,
            b: sum.b / count,
        };
      }
      for (var extrusion = 0; extrusion < height; extrusion++) {
        sideBitmap.setPixel(x, extrusion, avg.r, avg.g, avg.b, 255);
      }
    }
    console.log("Side bitmap done.");
    return sideBitmap;
  }

  return {
    restrict: 'E',

    compile: function (element, attrs) {
      console.log('Compiling ship-directive: ' + JSON.stringify(attrs));
      
      const game = new Phaser.Game(3100, 7000, Phaser.CANVAS, attrs.id, { preload: preload, create: create });

      function preload() {
        plan.floors.forEach(function(floor) {
          game.load.image(floor.image, floor.image);
        });
      }

      function create() {
        var y = 0,
            maxWidth = 0;
        var floorPromises = [];
        plan.floors.forEach(function(floor) {
          var deferred = $q.defer();
          floorPromises.push(deferred.promise);
          $timeout(function() {
            console.log("Cropping: " + floor.floor);
            var bb = floor.bb; // floor.bb_no_text || floor.bb;
            var w = bb[2] - bb[0];
            var h = bb[3] - bb[1];
            if (w > maxWidth) {
              maxWidth = w;
            }
            floor.bitmap = game.add.bitmapData(w, h);
            floor.bitmap.copyRect(floor.image, 
                new Phaser.Rectangle(bb[0], bb[1], w, h),
                0, 0);
            floor.sideBitmap = getSideBitmap(game, floor.bitmap, 30);
            deferred.resolve();
          }, 0);
        });
        $q.all(floorPromises).then(function() {
          plan.floors.forEach(function(floor) {
            console.log("Adding floor bitmap: " + floor.floor);
            floor.bitmap.addToWorld(0, y);
            y = y + floor.bitmap.height;
          });
          y = 0;
          plan.floors.forEach(function(floor) {
            console.log("Adding side bitmap: " + floor.floor);
            floor.sideBitmap.addToWorld(maxWidth + 1, y);
            y = y + floor.sideBitmap.height;
          });
        });
      }

      return function(scope,elem,attrs) {
      };
    }
  };
});
