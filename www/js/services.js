angular.module('starter.services', [])

.factory('allLocations', function ($firebaseArray) {
  var locationsRef = new Firebase('https://openmicnight.firebaseio.com/locations/');
  return $firebaseArray(locationsRef);
})

.factory('storage', function () {
    var bucket = {};

    return {
        get: function (junk) {
            if (bucket.hasOwnProperty(junk)) {
                return bucket[junk];
            }
        },
        set: function (key, value) {
            bucket[key] = value;
        }
    };
});