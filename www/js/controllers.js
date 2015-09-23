angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.run(['storage', function(storage) {
   var ref = new Firebase("https://openmicnight.firebaseio.com/");
   console.log("auth response", ref.getAuth());

   // auth = $firebaseAuth(ref);
   var user = ref.getAuth();

   if (user === null) {

     } else {
       storage.set("userId", user.uid);
     }
}])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB, $firebaseArray, storage) {

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
        } else {
          console.log('Facebook login failed');
        }
      })
      .then(
        ngFB.api({
          path: '/me',
          params: {fields: 'id,name'}
        }).then(
          function (user) {
            if (user !== null){
              console.log(user);
              $scope.user = user;
              storage.set('userId', user.id);

              var ref = new Firebase('https://openmicnight.firebaseio.com/users');
              $scope.users = $firebaseArray(ref);

          // prevent duplicate users
              $scope.users.$loaded()
                .then(function (users) {
                  var userExists = 0;
                  for (var i = 0; i < users.length; i++) {
                    if(users[i].uid === user.id) {
                      userExists = 1;

                     // store firebase ID
                      $scope.userFireId = users[i].$id;
                      storage.set('firebaseId', $scope.userFireId);
                      console.log("$scope.userFireId", $scope.userFireId)

                      $location.path('app/' + $scope.userId + '/profile');

                    } else {
                      console.log("New user ID: ", users[i].uid);
                    }
                  }
                  console.log(userExists);
                  if (userExists === 0) {
                    $scope.users.$add({
                      "name": user.name,
                      "uid": user.id,
                      "email": "",
                      "phone": "",
                      "facebook": "",
                      "instagram": "",
                      "reverbnation": "",
                      "twitter": "",
                      "linkedin": "",
                      "favorites": []
                    })
                  }
                })
            }
            else {
              console.log(user);
            }
          }
        )
      )
    $scope.closeLogin();
  };
})

.controller('ProfileCtrl', function($scope, ngFB, storage, $firebaseArray, $firebaseObject, $location, $ionicModal) {
  
  $scope.userId = storage.get("userId");
  $scope.userFireId = storage.get("firebaseId");

  console.log("$scope.userId", $scope.userId);
  console.log("$scope.userFireId", $scope.userFireId);

  var ref = new Firebase('https://openmicnight.firebaseio.com/users');
  $scope.users = $firebaseArray(ref);

  $scope.users.$loaded()
    .then(function (users) {
      console.log("users", users)
      for (var i = 0; i < users.length; i++) {
        if(users[i].uid === $scope.userId) {
          console.log("Match");

          var ref = new Firebase('https://openmicnight.firebaseio.com/users/' + $scope.userFireId);
          $scope.user = $firebaseObject(ref);
          console.log("$scope.user", $scope.user);

        } else {
          console.log("No Match");
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

  $scope.fbLogout = function(){
    ngFB.logout().then(
      function() {
          console.log('Logout successful');
      }
    )
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

.controller('EditProfileCtrl', function($scope, $firebaseArray, $firebaseObject, storage, $ionicModal){
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.userEdit = storage.get('firebaseId'); 
  console.log("$scope.userEdit", $scope.userEdit);

  $scope.name = "";
  $scope.email = "";
  $scope.phone = "";
  $scope.facebook = "";
  $scope.instagram = "";
  $scope.reverbnation = "";
  $scope.twitter = "";
  $scope.linkedin = "";

  $scope.profileChanges = function (value) {
    console.log("save changes clicked");

    var ref = new Firebase('https://openmicnight.firebaseio.com/users');
    $scope.users = $firebaseArray(ref);

    $scope.closeModal();
  }
})


