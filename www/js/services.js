angular.module('starter.services', [])

.factory('allLocations', function ($firebaseArray) {
  var locationsRef = new Firebase('https://openmicnight.firebaseio.com/locations/');
  return $firebaseArray(locationsRef);
})

.factory('allUsers', function ($firebaseArray) {
  var usersRef = new Firebase('https://openmicnight.firebaseio.com/users/');
  return $firebaseArray(usersRef);
})

.factory('Markers', function ($firebaseObject) {
	var marker = {}; 

  return {

    getMarkerId: function(locationKey) {
      if (marker.hasOwnProperty(locationKey)) {
        return marker[locationKey];
      }
    },
    setMarkerId: function(key, locationKey){
    	marker[key] = locationKey;
    },
    getMarker: function(barId) {
    	var locationRef = new Firebase('https://openmicnight.firebaseio.com/locations/' + barId);
  		return $firebaseObject(locationRef);
    }
  }
})

.factory('GoogleMaps', function ($cordovaGeolocation, Markers){
	var apiKey = false;
	var map = null;

	function initMap(){

		var options = {timeout: 10000, enableHighAccuracy: true};

		loadMarker();
  }

	function loadMarker() {
		var barId = Markers.getMarkerId("firebaseId");
		var myFirebaseObject = Markers.getMarker(barId);
		console.log("myFirebaseObject", myFirebaseObject);

		myFirebaseObject.$loaded().then(function(){

			var markerPos = new google.maps.LatLng(myFirebaseObject.latitude, myFirebaseObject.longitude);
			var mapOptions = {
		    center: markerPos,
		    zoom: 15,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		  };

		  map = new google.maps.Map(document.getElementById("map"), mapOptions);

		  google.maps.event.addListenerOnce(map, 'idle', function(){

				var marker = new google.maps.Marker({
			    map: map,
			    animation: google.maps.Animation.DROP,
			    icon: 'img/Icons/red-microphone-24.png',
			    position: markerPos
			  });
			  var infoWindowContent = "<h5>" + myFirebaseObject.name + "</h5>" + "<p>" + myFirebaseObject.address + "</p>" + "<p>" + myFirebaseObject.phone + "</p>";          
 
        addInfoWindow(marker, infoWindowContent, myFirebaseObject);
       	})
		})
	}

  function addInfoWindow(marker, message, record) {

    var infoWindow = new google.maps.InfoWindow({
        content: message
    });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
    });
 
  }

	return {
    init: function(){
      initMap();
    }
  }
});

