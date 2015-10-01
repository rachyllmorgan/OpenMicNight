angular.module('starter.services', [])

.factory('allLocations', function ($firebaseArray) {
  var locationsRef = new Firebase('https://openmicnight.firebaseio.com/locations/');
  return $firebaseArray(locationsRef);
})

.factory('allUsers', function ($firebaseArray) {
  var usersRef = new Firebase('https://openmicnight.firebaseio.com/users/');
  return $firebaseArray(usersRef);
})