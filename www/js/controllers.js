angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB, $firebaseArray) {

  var ref = new Firebase('https://openmicnight.firebaseio.com/users');
  $scope.users = $firebaseArray(ref);

  $scope.userId = window.localStorage.getItem("userId");

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

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

                        $location.path('app/profile/:userId');

                      } else {
                        console.log("New user ID: ", users[i].uid);
                      }
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
    $scope.closeLogin();
  };
})

.controller('ProfileCtrl', function($scope, ngFB, $firebaseArray, $firebaseObject, $location, $ionicModal) {

  $scope.$on('$ionicView.enter', function(e) {

    $scope.userId = window.localStorage.getItem("userId");
    $scope.userFireId = window.localStorage.getItem("firebaseId");

    console.log("$scope.userId", $scope.userId);
    console.log("$scope.userFireId", $scope.userFireId);

//  ******************** want login to pop up if not logged in ****************************
    if ($scope.userId === null || $scope.userId === undefined) {

      console.log("yes");

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeLogin = function() {
        $scope.modal.hide();
      };

      // Open the login modal
      $scope.login = function() {
        $scope.modal.show();
      };

    } else {
      console.log("no");
    }

    var ref = new Firebase('https://openmicnight.firebaseio.com/users');
    $scope.users = $firebaseArray(ref);

    $scope.users.$loaded()
      .then(function (users) {
        $scope.userId = window.localStorage.getItem("userId");
        console.log("users", users)
        for (var i = 0; i < users.length; i++) {
          if(users[i].uid === $scope.userId) {
            console.log("Found User");

            var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId);
            $scope.user = $firebaseObject(ref);
            console.log("$scope.user", $scope.user);

          } else {
            console.log("# of users");
          }
        }
      })
      .then(function(){

      // Add link for empty profile
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
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.Artistmodal.remove();
      });
      // Execute action on hide modal
      $scope.$on('Artistmodal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('Artistmodal.removed', function() {
        // Execute action
      });

      $scope.seeUserDetail = function (user) {
      console.log(user);
      $scope.Artistmodal.show();
      $scope.userDetail = user;

      console.log("$scope.userDetail.contacts", $scope.userDetail.contacts);

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

.controller('EditProfileCtrl', function($scope, $firebaseObject, $ionicModal){

  $scope.userId = window.localStorage.getItem("userId");
  $scope.firebaseId = window.localStorage.getItem('firebaseId'); 
  console.log("$scope.userId", $scope.userId);

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
      console.log("ref", ref);
    }, function(error) {
      console.log("promise error", error);
    });

    $scope.closeModal();
  }
})

.controller('LocationsCtrl', function($scope, $ionicModal, $firebaseArray, allLocations, ngFB) {
  
  $scope.$on('$ionicView.enter', function(e) {

    $scope.locations = allLocations;
    window.localStorage.getItem("userAccessToken");
    console.log("$scope.userAccessToken", $scope.userAccessToken);

    $scope.searchLocations = "";

    $ionicModal.fromTemplateUrl('templates/bar.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;

      });
      $scope.openModal = function() {

        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });

    $scope.seeBarDetail = function (bar) {
      console.log(bar);
      $scope.modal.show();
      $scope.barDetail = bar;

      $scope.addToFavorites = function(bar){
        console.log("bar", bar);
        $scope.bar = bar;

        $scope.firebaseId = window.localStorage.getItem('firebaseId'); 
        console.log("$scope.userId", $scope.userId);

        var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.firebaseId + '/favorites');
        $scope.userFavorites = $firebaseArray(ref);
        $scope.userFavorites.$add($scope.bar)
          .then(function(data){
            console.log("Bar added")
          })
      }

      // function initialize() {
      //   var mapProp = {
      //     center:new google.maps.LatLng(51.508742,-0.120850),
      //     zoom:5,
      //     mapTypeId:google.maps.MapTypeId.ROADMAP
      //   };
      //   var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
      // }
      // google.maps.event.addDomListener(window, 'load', initialize);
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
      }).then(function(modal) {
        $scope.modal = modal;

      });
      $scope.openModal = function() {

        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });

      $scope.seeUserDetail = function (user) {
      console.log(user);
      $scope.modal.show();
      $scope.userDetail = user;

      console.log("$scope.userDetail.contacts", $scope.userDetail.contacts);

        // Add link for empty profile
        for (var key in $scope.userDetail) {
          if ($scope.userDetail[key] === undefined || $scope.userDetail[key] === "") {
            $scope.userDetail[key] = "No User Information";
          } 
        }
          $scope.addToContacts = function(friend){
            console.log("friend", friend);
            $scope.friend = friend;

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

            $scope.closeModal();
          }
      }

  })
})


