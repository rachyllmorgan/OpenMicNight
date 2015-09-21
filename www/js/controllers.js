angular.module('starter.controllers', ['starter.services', 'firebase', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $location, ngFB) {

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

  // Perform the login action when the user submits the login form
  // $scope.doLogin = function() {
  //   console.log('Doing login', $scope.loginData);

    $scope.fbLogin = function () {
      ngFB.login({scope: 'email,public_profile,user_friends'}).then(
        function (response) {
          if (response.status === 'connected') {
            console.log('Facebook login succeeded');
            console.log('response.authResponse.accessToken', response.authResponse.accessToken);
            console.log('response', response);
            $scope.closeLogin();
            $location.path('/app/profile');
          } else {
            alert('Facebook login failed');
          }
        });
    };
  // };
})

.controller('ProfileCtrl', function ($scope, ngFB, storage, $firebaseArray, $ionicModal) {

  ngFB.api({
    path: '/me',
    params: {fields: 'id,name'}
  }).then(
    function (user) {
        $scope.user = user;
        console.log(user);
        storage.set('userId', user.id);

        var ref = new Firebase('https://openmicnight.firebaseio.com/users');
        $scope.users = $firebaseArray(ref);

        $scope.users.$loaded()
           .then(function (users) {
            console.log(users)
            var userExists = 0;
              for (var i = 0; i < users.length; i++) {
               console.log(users[i])
              if(users[i].uid === user.id) {
                userExists = 1;
              } else {
                console.log("New user: ", users[i].uid);
              }
               
             }
             console.log(userExists);
             if (userExists === 0) {
               $scope.users.$add({
                 "name": user.name,
                 "uid": user.id,
               })
             }
           })
    },
    function (error) {
        alert('Facebook error: ' + error.error_description);
    });

  // Add link for empty profile
  for (var key in $scope.user) {
    if ($scope.user[key] === undefined || $scope.user[key] === "") {
      $scope.user[key] = "Add Link";
    }
  }
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

.controller('UserLocationsCtrl', function($scope, $firebaseArray, storage){
  $scope.userId = storage.get("userId");

  var ref = new Firebase("https://openmicnight.firebaseio.com/users");
    $scope.users = $firebaseArray(ref);

    $scope.users.$loaded()
      .then(function (usersArray) {
        for (var i = 0; i < usersArray.length; i ++) {
          if (usersArray[i].uid === $scope.userId) {
            console.log(usersArray[i].$id);

            var ref = new Firebase("https://openmicnight.firebaseio.com/locations");
            $scope.userLocation = $firebaseArray(ref);

          }
        }

      })
})



