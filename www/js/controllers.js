angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.run(['storage', function(storage) {
   var ref = new Firebase("https://openmicnight.firebaseio.com/");
   console.log("authdata", ref.getAuth());

   // auth = $firebaseAuth(ref);
   var user = ref.getAuth();

   if (user === null) {

     } else {
       storage.set("userId", user.uid);
     }
}])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB, $firebaseArray, storage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
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
    ngFB.login({scope: 'email,public_profile,user_friends'}).then(
      function (response) {
        if (response.status === 'connected') {
          console.log('Facebook login succeeded');
          console.log('response.authResponse.accessToken', response.authResponse.accessToken);
          console.log('response', response);
          $scope.closeLogin();
          $location.path("/app/profile");
        } else {
          console.log('Facebook login failed');
        }
      });
  };

  ngFB.api({
    path: '/me',
    params: {fields: 'id,name,picture'}
  }).then(
    function (user) {
      $scope.user = user;
      console.log(user);
      storage.set('userId', user.id);

      var ref = new Firebase('https://openmicnight.firebaseio.com/users');
      $scope.users = $firebaseArray(ref);

  // prevent duplicate users
      $scope.users.$loaded()
        .then(function (users) {
          console.log("users", users)
          var userExists = 0;
          for (var i = 0; i < users.length; i++) {
            if(users[i].uid === user.id) {
              userExists = 1;
            } else {
              console.log("New user ID: ", users[i].uid);
            }
          }
          console.log(userExists);
          if (userExists === 0) {
            $scope.users.$add({
              "name": user.name,
              "uid": user.id
            })
          }
        })
    },
    function (error) {
      console.log('Facebook error: ' + error.error_description);
    });

  $scope.userId = storage.get('userId');
})

.controller('ProfileCtrl', function ($scope, ngFB, storage, $firebaseArray, $firebaseObject, $location) {

  $scope.userId = storage.get("userId");
  console.log("$scope.userId", $scope.userId);

  var ref = new Firebase('https://openmicnight.firebaseio.com/users');
  $scope.users = $firebaseArray(ref);

  $scope.users.$loaded()
    .then(function (users) {
      console.log("users", users)
      for (var i = 0; i < users.length; i++) {
        if(users[i].uid === $scope.userId) {
          $scope.userFireId = users[i].$id;
          console.log("$scope.userFireId", $scope.userFireId)
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
          $scope.user[key] = "Add Link";
        }
      }
    })

// Currently redirecting to facebook home page
  // $scope.fbLogout = function(user) {
  //   ngFB.logout(user).then(
  //     function() {
  //       console.log('Logout successful');
  //     }
  //   )
  // }

})

.controller('LocationsCtrl', function($scope, $ionicModal, allLocations) {

  $scope.locations = allLocations;
  console.log('$scope.locations', $scope.locations);

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



