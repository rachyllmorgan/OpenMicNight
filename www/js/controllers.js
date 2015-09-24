angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB, $firebaseArray) {

  var ref = new Firebase('https://openmicnight.firebaseio.com/users');
  $scope.users = $firebaseArray(ref);

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
          console.log(authdata.authResponse.accessToken);

          ngFB.api({
            path: '/me',
            params: {fields: 'id,name,email,link,friends'}
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

                        $location.path('app/' + $scope.userId + '/profile');

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
                        "favorites": [],
                        "friends": user.friends.data
                      })
                    $location.path('app/' + $scope.userId + '/profile');
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

    var authRequired = true;
    $scope.userId = window.localStorage.getItem("userId");
    $scope.userFireId = window.localStorage.getItem("firebaseId");

    console.log("$scope.userId", $scope.userId);
    console.log("$scope.userFireId", $scope.userFireId);

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
        // why am i getting myself as a friend???
    var friendref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId + '/friends');
    $scope.friends = $firebaseArray(ref); 
    console.log ("$scope.friends", $scope.friends, $scope.userFireId);

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

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.profileChanges = function (key, value) {
    console.log("save changes clicked");

    $scope.user.$save().then(function(ref) {
      console.log("ref", ref);
    }, function(error) {
      console.log("promise error", error);
    });

    $scope.closeModal();
  }
})

.controller('LocationsCtrl', function($scope, $ionicModal, allLocations) {
  $scope.$on('$ionicView.enter', function(e) {

    $scope.locations = allLocations;

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
    }
  })
})

.controller('SocialCtrl', function($scope, $firebaseArray, $firebaseObject, $ionicModal){

  var authRequired = true;
  $scope.userId = window.localStorage.getItem("userId");
  $scope.userEdit = window.localStorage.getItem('firebaseId'); 
  console.log("$scope.userEdit", $scope.userEdit);

        // why am i getting myself as a friend???
  var userRef = new Firebase('https://openmicnight.firebaseio.com/users/');
  $scope.users = $firebaseArray(userRef); 
  console.log ("$scope.users", $scope.users);

    $ionicModal.fromTemplateUrl('templates/social_detail.html', {
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
  }
})

