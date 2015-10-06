angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB, $firebaseArray) {

  var ref = new Firebase('https://openmicnight.firebaseio.com/users');
  $scope.users = $firebaseArray(ref);

  $scope.userId = window.localStorage.getItem("userId");

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email,public_profile,user_friends'})
      .then(
      function (authdata) {
        if (authdata.status === 'connected') {
          console.log('Facebook login succeeded');
          window.localStorage.setItem("userAccessToken", authdata.authResponse.accessToken);

          ngFB.api({
            path: '/me',
            params: {fields: 'id,name,email,link'}
          }).then(
            function (user) {
              if (user !== null){
                console.log(user);
                $scope.user = user;
                window.localStorage.setItem("userId", user.id);

            // prevent duplicate users
                $scope.users.$loaded()
                  .then(function (users) {
                    var userExists = 0;
                    for (var i = 0; i < users.length; i++) {
                      if(users[i].uid === user.id) {
                        userExists = 1;

                      // store firebase ID
                        window.localStorage.setItem('firebaseId', users[i].$id);
                        console.log("firebaseId", users[i].$id);

                        $scope.userId = window.localStorage.getItem("userId");
                        $location.path('app/profile/:userId');
                      }
                      // } else {
                      //   console.log("New user ID: ", users[i].uid);
                      // }
                    }
                    // create new user
                    console.log(userExists);
                    if (userExists === 0) {
                      $scope.users.$add({
                        "name": user.name,
                        "uid": user.id,
                        "email": user.email,
                        "phone": "",
                        "facebook": user.link,
                        "instagram": "",
                        "reverbnation": "",
                        "twitter": "",
                        "linkedin": "",
                        "soundcloud": "",
                        "youtube": "",
                        "favorites": [],
                        "genres": [],
                        "contacts": [],

                      })
                    window.location.reload();
                    $scope.userId = window.localStorage.getItem("userId");
                    $location.path('app/profile/:userId');
                    }
                  })
              }
            }
          )
        } else {
          console.log('Facebook login failed');
        }
      })
    // $scope.closeLogin();
  };
})

.controller('ProfileCtrl', function($scope, ngFB, $firebaseArray, $firebaseObject, $location, $ionicModal, $ionicLoading, $cordovaEmailComposer, $ionicPlatform, $cordovaGeolocation, $state) {

  $scope.$on('$ionicView.enter', function(e) {

    $scope.userId = window.localStorage.getItem("userId");
    $scope.userFireId = window.localStorage.getItem("firebaseId");

    console.log("$scope.userId", $scope.userId);
    console.log("$scope.userFireId", $scope.userFireId);

    // About me Tab
    var ref = new Firebase('https://openmicnight.firebaseio.com/users');
    $scope.users = $firebaseArray(ref);

    $scope.users.$loaded()
      .then(function (users) {
        $scope.userId = window.localStorage.getItem("userId");
        for (var i = 0; i < users.length; i++) {
          if(users[i].uid === $scope.userId) {
            console.log("Found User");

            var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId);
            $scope.user = $firebaseObject(ref);
            console.log("$scope.user", $scope.user);
          }
          // } else {
          //   console.log("# of users");
          // }
        }
      })
      .then(function(){

      // Add string for empty profile
        for (var key in $scope.user) {
          if ($scope.user[key] === undefined || $scope.user[key] === "") {
            $scope.user[key] = "No User Information";
          } 
        }
      })

    // Friends Tab
    var friendref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId + '/contacts');
    $scope.friends = $firebaseArray(friendref); 
    console.log ("$scope.friends", $scope.friends);

    $scope.searchUsers = "";

    $ionicModal.fromTemplateUrl('templates/artist_detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(Artistmodal) {
        $scope.Artistmodal = Artistmodal;

      });
      $scope.openArtistModal = function() {
        $scope.Artistmodal.show();
      };
      $scope.closeArtistModal = function() {
        $scope.Artistmodal.hide();
      };

      $scope.seeUserDetail = function (user) {
        console.log("user", user);
        $scope.Artistmodal.show();
        $scope.userDetail = user;

        // Add link for empty profile
        for (var key in $scope.userDetail) {
          if ($scope.userDetail[key] === undefined || $scope.userDetail[key] === "") {
            $scope.userDetail[key] = "No User Information";
          } 
        }
      }

      // Favorites Tab
    var favoritesref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId + '/favorites');
    $scope.favorites = $firebaseArray(favoritesref); 
    console.log ("$scope.favorites", $scope.favorites);

      $ionicModal.fromTemplateUrl('templates/bar.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(barmodal) {
        $scope.barmodal = barmodal;

      });
      $scope.openBarModal = function() {

        $scope.barmodal.show();
      };
      $scope.closeBarModal = function() {
        $scope.barmodal.hide();
      };

    $scope.seeBarDetail = function (bar) {
      console.log(bar);
      $scope.barmodal.show();
      $scope.barDetail = bar;

    };    

// ***************** reseting localStorage but not removing prof photo or bio info ********** //
    $scope.fbLogout = function(){
      window.localStorage.setItem("userId", null);
      window.localStorage.setItem("firebaseId", null);

      console.log("$scope.user", $scope.user);

      $location.path('app/locations');
      console.log('Logout here');
    }

    // Open edit profile modal
    $ionicModal.fromTemplateUrl('templates/profile_form.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the edit profile modal to close it
    $scope.closeEdit = function() {
      $scope.modal.hide();
    };

    // Open the profile edit modal
    $scope.editProfile = function(user) {
      $scope.modal.show();
      $scope.userDetail = user;
    }

  })
})

.controller('EditProfileCtrl', function($scope, $firebaseObject, $ionicModal, $location){

  $scope.userId = window.localStorage.getItem("userId");
  $scope.firebaseId = window.localStorage.getItem('firebaseId'); 

  var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.firebaseId);
  $scope.user = $firebaseObject(ref);

  $scope.genres = [
    'Acoustic', 
    'Alternative', 
    'Americana', 
    'Bluegrass', 
    'Blues', 
    'Country', 
    'Folk', 
    'Hard Rock', 
    'Hip Hop', 
    'Indie', 
    'Jazz', 
    'Rap', 
    'Rock', 
    'Spoken Word'
  ];

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.profileChanges = function (key, value) {
    console.log("save changes clicked");

    $scope.user.$save().then(function(ref) {
      console.log("$scope.user", $scope.user);
    }, function(error) {
      console.log("promise error", error);
    });

    $scope.userId = window.localStorage.getItem("userId");
    $location.path('app/profile/:userId');
    window.location.reload();
    $scope.closeModal();
  }
})

.controller('LocationsCtrl', function($scope, $ionicModal, $firebaseArray, allLocations, ngFB, $location, $ionicLoading) {
  
  $scope.$on('$ionicView.enter', function(e) {

    $scope.locations = allLocations;
    window.localStorage.getItem("userAccessToken");
    console.log("$scope.userAccessToken", $scope.userAccessToken);

    $scope.searchLocations = "";

    $ionicModal.fromTemplateUrl('templates/bar.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(barmodal) {
        $scope.barmodal = barmodal;

      });
      $scope.openBarModal = function() {

        $scope.barmodal.show();
      };
      $scope.closeBarModal = function() {
        $scope.barmodal.hide();
      };

    $scope.seeBarDetail = function (bar) {
      console.log(bar);
      $scope.barmodal.show();
      $scope.barDetail = bar;


      google.maps.event.addDomListener(window, 'load', function() {
        var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
 
        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
 
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
        navigator.geolocation.getCurrentPosition(function(pos) {
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                title: "My Location"
            });
        });
 
        $scope.map = map;
      });

    // google.maps.event.addDomListener(window, 'load', initialize);

      $scope.addToFavorites = function(bar){
        console.log("bar", bar);
        $scope.bar = bar;

        $scope.firebaseId = window.localStorage.getItem('firebaseId'); 
        console.log("$scope.userId", $scope.userId);

        var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.firebaseId + '/favorites');
        $scope.userFavorites = $firebaseArray(ref);

      // prevent duplicate favorites
        $scope.userFavorites.$loaded()
          .then(function (userFavorites) {
            var favoriteExists = 0;
            for (var i = 0; i < userFavorites.length; i++) {
              if(userFavorites[i].name === bar.name) {
                favoriteExists = 1;
            
                $location.path('app/profile/:userId');

              } else {
                console.log("New Favorite:", userFavorites[i].name);
              }
            }
            // create new user
            console.log(favoriteExists);
            if (favoriteExists === 0) {
              $scope.userFavorites.$add($scope.bar)
              $location.path('app/profile/:userId');
            }
          })

          .then(function(data){
            console.log("Bar added")
          })
 
        $scope.closeBarModal();
      }
    };
  })
})

.controller('SocialCtrl', function($scope, $firebaseArray, $firebaseObject, $ionicModal, allUsers, $location){

  $scope.$on('$ionicView.enter', function(e) {

    var authRequired = true;
    $scope.userId = window.localStorage.getItem("userId");
    $scope.firebaseId = window.localStorage.getItem('firebaseId');

    var userRef = new Firebase('https://openmicnight.firebaseio.com/users/');
    $scope.users = $firebaseArray(userRef); 
    console.log ("$scope.users", $scope.users);

    $scope.searchUsers = "";

    $ionicModal.fromTemplateUrl('templates/artist_detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(Artistmodal) {
        $scope.Artistmodal = Artistmodal;

      });
      $scope.openArtistModal = function() {

        $scope.Artistmodal.show();
      };
      $scope.closeArtistModal = function() {
        $scope.Artistmodal.hide();
      };

      $scope.seeUserDetail = function (user) {
        console.log(user);
        $scope.Artistmodal.show();
        $scope.userDetail = user;

        var favoritesref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId + '/favorites');
        $scope.favorites = $firebaseArray(favoritesref); 
        console.log ("$scope.favorites", $scope.favorites);

        $ionicModal.fromTemplateUrl('templates/bar.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(barmodal) {
          $scope.barmodal = barmodal;

        });
        $scope.openBarModal = function() {

          $scope.barmodal.show();
        };
        $scope.closeBarModal = function() {
          $scope.barmodal.hide();
        };

        $scope.seeBarDetail = function (bar) {
          console.log(bar);
          $scope.barmodal.show();
          $scope.barDetail = bar;
        }

        // Add link for empty profile
        for (var key in $scope.userDetail) {
          if ($scope.userDetail[key] === undefined || $scope.userDetail[key] === "") {
            $scope.userDetail[key] = "No User Information";
          } 
        }
          $scope.addToContacts = function(friend){
            console.log("friend", friend);
            $scope.friend = friend;
            $scope.friendAdded = {};

            $scope.firebaseId = window.localStorage.getItem('firebaseId'); 

            var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.firebaseId + '/contacts');
            $scope.userContacts = $firebaseArray(ref);

                        // prevent duplicate users
                  $scope.userContacts.$loaded()
                    .then(function (userContacts) {
                      var friendExists = 0;
                      for (var i = 0; i < userContacts.length; i++) {
                        if(userContacts[i].uid === friend.uid) {
                          friendExists = 1;
                          

                        // store firebase ID
                          window.localStorage.setItem('userFirebaseId', userContacts[i].uid);
                          console.log("userFirebaseId", userContacts[i].uid);

                          $location.path('app/profile/:userId');

                        } else {
                          console.log("New Contact:", userContacts[i].uid);
                        }
                      }
                      // create new user
                      console.log(friendExists);
                      if (friendExists === 0) {
                        $scope.userContacts.$add($scope.friend)
                        $location.path('app/profile/:userId');
                      }
                    })

                    .then(function(data){
                    console.log("Contact added")
                    })

            $scope.closeArtistModal();
          }
      }

  })
})


