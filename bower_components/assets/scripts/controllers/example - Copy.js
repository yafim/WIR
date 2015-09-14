'use strict';
angular.module("angular-google-maps-example", ['uiGmapgoogle-maps', "ui.map", "ui.event"])

// .controller("mainController", function ($scope) {
//         $scope.lat = "0";
//         $scope.lng = "0";
//         $scope.accuracy = "0";
//         $scope.error = "";
//         $scope.model = { myMap: undefined };
//         $scope.myMarkers = [];
 
//         $scope.showResult = function () {
//             return $scope.error == "";
//         }
 
//         $scope.mapOptions = {
//             center: new google.maps.LatLng($scope.lat, $scope.lng),
//             zoom: 15,
//             mapTypeId: google.maps.MapTypeId.ROADMAP
//         };
 
//         $scope.showPosition = function (position) {
//             $scope.lat = position.coords.latitude;
//             $scope.lng = position.coords.longitude;
//             $scope.accuracy = position.coords.accuracy;
//             $scope.$apply();
 
//             var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
//             $scope.model.myMap.setCenter(latlng);
//             $scope.myMarkers.push(new google.maps.Marker({ map: $scope.model.myMap, position: latlng }));
//         }
 
//         $scope.showError = function (error) {
//             switch (error.code) {
//                 case error.PERMISSION_DENIED:
//                     $scope.error = "User denied the request for Geolocation."
//                     break;
//                 case error.POSITION_UNAVAILABLE:
//                     $scope.error = "Location information is unavailable."
//                     break;
//                 case error.TIMEOUT:
//                     $scope.error = "The request to get user location timed out."
//                     break;
//                 case error.UNKNOWN_ERROR:
//                     $scope.error = "An unknown error occurred."
//                     break;
//             }
//             $scope.$apply();
//         }
 
//         $scope.getLocation = function () {
//             if (navigator.geolocation) {
//                 navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
//             }
//             else {
//                 $scope.error = "Geolocation is not supported by this browser.";
//             }
//         }
 
//         $scope.getLocation();
//     })

// NEW CONTROLLER 
.controller("ExampleController",['$scope', '$timeout', 'uiGmapLogger', '$http','uiGmapGoogleMapApi'
    , function ($scope, $timeout, $log, $http ,GoogleMapApi) {

  // .controller("ExampleController", function ($scope) {


var latitude = 0;
var longitude = 0;

// var LatLng = function (position){
//   latitude = position.coords.latitude;
//   longitude = position.coords.longitude;
// };


//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(LatLng);
//         // alert('ok');
//     } else {
//         alert('no');

//     }
var coords;
      function initMap(position) {
        coords = {
          "lat" : position.coords.latitude, "lng" : position.coords.longitude
            };
        // options = {
        //     zoom: 11,
        //     center: coords,
        //     mapTypeControl: false,
        //     navigationControlOptions: {
        //       style: google.maps.NavigationControlStyle.SMALL
        //     },
        //     mapTypeId: google.maps.MapTypeId.ROADMAP
        //   };

        // map = new google.maps.Map(document.getElementById("map"), options);
  angular.extend($scope, {
    map: {
      // show: true,
      // control: {},

      // initial location of the map
      center: {
        latitude: coords.lat,
        longitude: coords.lng
      },
      // options: {
      //   // streetViewControl: false,
      //   // panControl: false,
      //   maxZoom: 20, // max scale
      //   minZoom: 1 // min scale
      // },
      zoom: 20, // initial zoom of the map

      // clickMarkers: [
      //   {id: 1, "latitude": 50.948968, "longitude": 6.944781}
      // ],

      // randomMarkers: []
    }

  });

      }


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(initMap);
  } else {
    error('Geo Location is not supported');
  }
  google.maps.event.addDomListener(window, 'load', initMap);










//NOT MY
  var genRandomMarkers = function (numberOfMarkers, scope) {
    var markers = [];

    // generate marker.. TODO: create genCurrentLocationMarker and apply it here
    var latitude = 30;
    var longitude = 40;

    var ret = {
      latitude: latitude,
      longitude: longitude
    };
    ret['id'] = 1;

    markers.push(ret);


    // for (var i = 0; i < 6; i++){
    //   markers.push(createRandomMarker(i, scope.map.bounds))
    // }

    scope.map.randomMarkers = markers;
  };


  var getLocation = function (scope) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(scope.genGeoMarker);
    } else {
        error('Geo Location is not supported');
    }
  };

    var showPosition = function (position) {
      coords = {
        "latitude" : position.coords.latitude, "longitude" : position.coords.longitude
      };

      var markers = [];

      var ret = {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      ret['id'] = 1;

      markers.push(ret);
      
      scope.map.randomMarkers = markers;
    };




  // TODO: override it... only for debug (clusters...)
  var createRandomMarker = function (i, bounds, idKey) {
    var lat_min = bounds.southwest.latitude,
      lat_range = bounds.northeast.latitude - lat_min,
      lng_min = bounds.southwest.longitude,
      lng_range = bounds.northeast.longitude - lng_min;

    if (idKey == null)
      idKey = "id";

    var latitude = lat_min + (Math.random() * lat_range);
    var longitude = lng_min + (Math.random() * lng_range);
    var ret = {
      latitude: latitude,
      longitude: longitude,
      title: 'm' + i
    };
    ret[idKey] = i;
    return ret;
  };



  // Clear all
  // $scope.removeMarkers = function () {
  //   $log.info("Clearing markers. They should disappear from the map now");
  //   $scope.map.randomMarkers = [];
  //   $scope.map.clickMarkers = [];
  // };

  // $scope.refreshMap = function () {
  //   //optional param if you want to refresh you can pass null undefined or false or empty arg
  //   $scope.map.control.refresh({latitude: 32.779680, longitude: -79.935493});
  //   $scope.map.control.getGMap().setZoom(2);
  //   return;
  // };
  // $scope.getMapInstance = function () {
  //   alert("You have Map Instance of" + $scope.map.control.getGMap().toString());
  //   return;
  // }
  // $scope.genRandomMarkers = function (numberOfMarkers) {
  //   genRandomMarkers(numberOfMarkers, $scope);
  //   // getLocation($scope);
  // };


  // $scope.clackMarker = function (gMarker,eventName, model) {
  //   alert("clackMarker: " + model);
  //   $log.log("from clackMarker");
  //   $log.log(model);
  // };
}]);
