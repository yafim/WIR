'use strict';
angular.module("angular-google-maps", ['ui.map', 'ui.event'])
 .controller('MapController'
    , function ($scope, $timeout, $log, $http) {

      // Get data from the server
        $http.get('/map/data').success(function(data) {
        $scope.bills = data.bills;
        $scope.index = data.indexToPass;
      });

        // Usful variables
        $scope.lat = "0";
        $scope.lng = "0";
        $scope.accuracy = "0";
        $scope.error = "";
        $scope.model = { map: undefined };
        $scope.myMarkers = [];
        $scope.latlng = new google.maps.LatLng(0, 0);

        $scope.flightPlanCoordinates = [];
        $scope.currentMarker;

        $scope.mapOptions = {
            zoom: 11,
            center: new google.maps.LatLng($scope.lat, $scope.lng),
            mapTypeControl: false,
            navigationControlOptions: {
              style: google.maps.NavigationControlStyle.SMALL
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.showPosition = function (position) {
            $scope.lat = position.coords.latitude;
            $scope.lng = position.coords.longitude;
            
            $scope.$apply();
 
            var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
            $scope.model.map.setCenter(latlng);
            $scope.latlng = latlng;
        }

        $scope.showError = function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    $scope.error = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    $scope.error = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    $scope.error = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    $scope.error = "An unknown error occurred."
                    break;
            }
            $scope.$apply();
        }
 
        $scope.getLocation = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
            }
            else {
                $scope.error = "Geolocation is not supported by this browser.";
            }
        }

        $scope.getLocation();

  /* LOGIC */
  var showAllMarkers = function(scope){
  var marker;
  var index = $scope.index;
    $scope.bills[index].billMarkers.push();

      for (var key in $scope.bills[index].billMarkers){

          var data = $scope.bills[index].billMarkers[key];
        
          marker = new google.maps.Marker({
            map: $scope.model.map,
            position: new google.maps.LatLng(data.currentLocation.lat, data.currentLocation.lng)
          });

          // Add current location
         $scope.flightPlanCoordinates.push(marker.position);

      }
  }

  var genGeoMarker = function(scope){
    $scope.currentMarker = new google.maps.Marker({
      map: $scope.model.map,
      position: $scope.latlng
    });

    $scope.flightPlanCoordinates.push($scope.currentMarker.position);
  }

  var genPolyRoute = function(scope){
    var flightPath = new google.maps.Polyline({
      path: $scope.flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap($scope.model.map);

    $scope.flightPlanCoordinates.push($scope.currentMarker.position);
  }

  var sendDataToServer = function (scope, http){
    var currentBill = $scope.bills[$scope.index];

      $http.post('/add',{
        'billId':currentBill.billId,
        'lat': $scope.lat,
        'lng': $scope.lng
      })
       .success(function(res){
           alert('Data sent');
       })
       .error(function(err){
          alert("Error: " + err);
       });
  };

  $scope.sendDataToServer = function (){
    sendDataToServer($scope, $http);
  };

  $scope.genPolyRoute = function (){
    genPolyRoute($scope);
  };

  // Clear all
  $scope.removeMarkers = function () {
  };

  $scope.refreshMap = function () {
    //optional param if you want to refresh you can pass null undefined or false or empty arg
    $scope.model.map.setCenter({
      lat : $scope.lat,
      lng : $scope.lng
    });

    $scope.model.map.setZoom(11);

    return;
  };

  $scope.getMapInstance = function () {
    showAllMarkers($scope);
  };

  $scope.genGeoMarker = function (numberOfMarkers) {
    genGeoMarker($scope);
  };

  $scope.clackMarker = function (gMarker,eventName, model) {
    alert("clackMarker: " + model);
    $log.log("from clackMarker");
    $log.log(model);
  };

});
