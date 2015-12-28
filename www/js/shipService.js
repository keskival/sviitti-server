angular.module('sviitti.services')
.service('Ship', function() {
  // All the pictures are horizontally aligned with each other, at least within one image file.
  // The vertical alignment can be deduced from the common center line which can be calculated
  // from the bounding box without the texts respectively.
  const plan = {
      legend: {
        image: '/img/balticprincess_2_4.png',
        bb: [310, 1046, 1223, 1149]
      },
      bssids: {
        "e0:3f:49:6a:72:f0": {
          name: "9D44_ASUS",
          floor: 5,
          x: 100,
          y: 100,
          range: 100
        },
        "00:22:07:1c:8e:de": {
          name: "Inteno_DF",
          floor: 4,
          x: 150,
          y: 120,
          range: 100
        },
        "00:1e:ab:52:33:78": {
          name: "timop",
          floor: 6,
          x: 120,
          y: 200,
          range: 100
        },
        "e0:3f:49:6a:72:f4": {
          name: "9D44_5G",
          floor: 7,
          x: 120,
          y: 100,
          range: 100
        },
        "00:1e:ab:08:7a:ec": {
          name: "9D44_VDSL",
          floor: 5,
          x: 120,
          y: 200,
          range: 100
        },
        "5c:6d:20:7c:37:22": {
          name: "PS3-9333999",
          floor: 7,
          x: 120,
          y: 200,
          range: 100
        },
        "90:72:40:21:f4:94": {
          name: "Bruce's Bar and Grill",
          floor: 10,
          x: 120,
          y: 200,
          range: 100
        }
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
