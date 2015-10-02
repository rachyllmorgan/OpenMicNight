// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngOpenFB', 'ngMaterial', 'firebase'])

.run(function($ionicPlatform, ngFB, $rootScope) {
  
  ngFB.init({appId: '615934731842861'});

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

        //stateChange event
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.authRequired && !userId){ //Assuming the AuthService holds authentication logic
      // User isn’t authenticated
      $state.transitionTo("/locations");
      event.preventDefault(); 
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html'
      }
    }
  })

  .state('app.locations', {
    url: "/locations",
    views: {
      'menuContent': {
        templateUrl: "templates/locations.html",
        controller: 'LocationsCtrl'
      }
    }
  })

  .state('app.profile', {
    url: "/profile/:userId",
    views: {
      'menuContent': {
        templateUrl: "templates/profile.html",
        controller: "ProfileCtrl",
        authRequired: true
      }
    }
  })

  .state('app.social', {
    url: '/social',
    views: {
      'menuContent': {
        templateUrl: 'templates/social.html',
        controller: "SocialCtrl"
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
