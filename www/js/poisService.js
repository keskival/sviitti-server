angular.module('sviitti.services')
.service('POIs', function() {
  const restaurants = [
      {
        name: 'BUFFET TALLINK',
        image: 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_Buffet03_princess.jpg',
        icon: '/img/fork.png',
        floor: 7,
        x: 1213,
        y: 109,
        description: "Delicious dishes for every taste. A rich variety of dishes enjoyed together with the ship's magnificent sea view.\n Buffet Tallink is located on deck 7 in the bow of the ship.",
        menu: '', // Baltic Princess has no public menus on the internet
        reservations: false
      },
      {
        name: 'GRILL HOUSE',
        image: 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_grillhouse02_princess.jpg',
        icon: '/img/fork.png',
        floor: 7,
        x: 880,
        y: 148,
        description: "Good food and relaxed atmosphere. The hefty menu of Grill House offers a variety of delicious alternatives that satisfy even the hungriest customers.\n Grill House is located on deck 7 in the middle of the ship. The restaurant seats 266 guests.",
        menu: '',
        reservations: true
      },
      {
        name: 'HAPPY LOBSTER',
        image: 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_gourmet_princess.jpg',
        icon: '/img/fork.png',
        floor: 7,
        x: 790,
        y: 30,
        description: "Fresh fish and seafood! The chef designs the menu based on the day's catch, which means that some of the courses on the menu change daily. The delicious and generous seafood platter is the restaurant's most popular dish.\n Happy Lobster is located on deck 7 in the middle of the ship.",
        menu: 'http://www.digipaper.fi/siljaline/125673/',
        reservations: true
      },
      {
        name: "KATARINA'S KITCHEN",
        image: 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_russiankatarina_princess.jpg',
        icon: '/img/fork.png',
        floor: 7,
        x: 807,
        y: 81,
        description: "The unique delicacies of Russian cuisine served on the waves of the Baltic Sea. Interesting taste combinations encourage you to try less wellknown specialities.\n À la carte restaurant Katarina's Kitchen is located on deck 7 in the middle of the ship.",
        menu: '',
        reservations: true
      },
      {
        name: 'CAFETERIA',
        image: 'http://www.tallinksilja.com/documents/10192/2516825/445x204_food_drink_elcapitan-sign_serenade.jpg/886cb2fd-a4ed-4f55-951e-40f8d24f6c02?t=1339069837000',
        icon: '/img/fork.png',
        floor: 6,
        x: 1167,
        y: 103,
        description: "Small snacks or a proper meal, all served quickly in a pleasant atmosphere.\n Cafeteria is located on deck 6 in the bow of the ship.",
        menu: '',
        reservations: false
      }
  ];
  const cabins = {
    '780': { // The number is guessed here. Just one for example.
      x: 780,
      y: 58,
      floor: 7
    }
  };
  const bars =
    [
     {
       name : 'PUBI',
       image : 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_balticpub_princess.jpg',
       icon : '/img/beer.png',
       floor : 7,
       x : 485,
       y : 59,
       description : "A place to enjoy full-bodied beers and fresh ciders. The Pubi offers a wide selection of the best beers and a relaxed atmosphere. A musician plays live background music.\n Pubi is located in the middle of deck 7.",
       menu : ''
     },
     {
       name : 'PIANO BAR',
       image : 'http://www.tallink.com/documents/10192/2516875/445x204_food_drink_martinibar_princess.jpg',
       icon : '/img/wineglass.png',
       floor : 7,
       x : 685,
       y : 164,
       description : "Classy Piano Bar is a marvellous place to enjoy aperitives or coffee avec. In Piano Bar you can also spend peaceful evening listening to piano music.\n Piano bar is located on deck 7 near dining restaurants.",
       menu : ''
     }
    ];
  const shops = [];
  return {
    restaurants: restaurants,
    bars: bars,
    shops: shops,
    cabins: cabins
  };
});
