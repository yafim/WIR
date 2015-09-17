var app = angular.module('pageHolder', [
  'ngRoute',
  'ui.map',
    'facebookUtils'
  // 'ui.event'
]);

app.constant('facebookConfigSettings', {
    'appID' : '927002334009260',
    'routingEnabled' : true

});

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  var path = "views/partials/";

  $routeProvider
    // Home
    .when("/", {templateUrl: path + "home.html", controller: "PageCtrl"})
    // Pages
      .when("/profile", {templateUrl: path + "profile.html", controller: "PageCtrl", needAuth: true})
    .when("/about", {templateUrl: path + "about.html", controller: "PageCtrl"})
    .when("/faq", {templateUrl: path + "faq.html", controller: "PageCtrl"})
    .when("/pricing", {templateUrl: path + "pricing.html", controller: "PageCtrl"})
    .when("/services", {templateUrl: path + "services.html", controller: "PageCtrl"})
    .when("/contact", {templateUrl: path + "contact.html", controller: "PageCtrl"})
    // .when("/map", {templateUrl: path + "map.html", controller: "MapController"})
    .when("/checkIn", {templateUrl: path + "checkIn.html", controller: "MapController"})
    .otherwise("/404", {templateUrl: path + "404.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */

app.controller('PageCtrl', function ($scope, $location, $http, $rootScope) {
  // Activates the Carousel - image changer
  $('.carousel').carousel({
    interval: 5000
  });

  // Activates Tooltips for Social Links 
  //http://www.w3schools.com/bootstrap/bootstrap_tooltip.asp
  $('.tooltip-social').tooltip({
    selector: "a[data-toggle=tooltip]"
  })

    $rootScope.user = null;

    $rootScope.$on('fbLoginSuccess', function(name, response) {
        if(response.status == 'connected'){
            //   $location.url('/'); // I wish to redirect to home page after successful login.

                $rootScope.loggedInUser = response;
                $rootScope.user = user;

        }
    });

    $rootScope.$on('fbLogoutSuccess', function() {
        $scope.$apply(function() {
            $rootScope.loggedInUser = {};
            $location.url('/'); // I wish to redirect to home page after successful login.
            //$rootScope.$broadcast('fbLogoutSuccess');
        });
    });


});

/* Navigation bar controller */
app.controller('NavCtrl', function ($scope, $location, $http, $rootScope) {
    //Search box toggle
    $scope.custom = true;

    //nav bar toggle
    $scope.isCollapsed = true;

    $scope.$on('$routeChangeSuccess', function () {
        $scope.isCollapsed = true;
    });

    $scope.getClass = function (path) {
    if(path === '/') {
        if($location.path() === '/') {
            return "active";
        } else {
            return "";
        }
    }
    if ($location.path().substr(0, path.length) === path) {
        return "active";
    } else {
        return "";
    }
  }


  ////

    $scope.list = [];
    $scope.text;
    $scope.submit = function(){
      alert("Searching");
    }



});



/* My Controller */
app.controller('MapController', function ($scope, $timeout, $log, $http, $route, $window) {

        // Directions - GPS
        $scope.directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.chicago = new google.maps.LatLng(37.334818, -121.884886);

        // Useful variables
        $scope.currentBillID;
        $scope.lat = "0";
        $scope.lng = "0";
        $scope.error = "";
        $scope.model = { map: "" };
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

            $scope.latlng = latlng;
            $scope.model.map.setCenter(latlng);

            $scope.getDataFromServer();


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

    //Useful variables
    var marker;
    var places;
    var data;

      places = $scope.fakeDB[$scope.index].places;

      for (var place in places){
            marker = new google.maps.Marker({
              map: $scope.model.map,
              position: new google.maps.LatLng(places[place].lat, places[place].lng)
            });

        // Add current location - for the Poly route...
        $scope.flightPlanCoordinates.push(marker.position);
      }
  }

  var genGeoMarker = function(scope){
    $scope.currentMarker = new google.maps.Marker({
      map: $scope.model.map,
      position: $scope.latlng
    });
  }

  /* Generate a simple line between all the markers */
  var genPolyRoute = function(scope){
    var flightPath = new google.maps.Polyline({
      path: $scope.flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap($scope.model.map);

  }

  /* Insert Data to the server */
   $scope.sendDataToServer = function (scope, http){
    var currentBill = $scope.fakeDB[$scope.index];


    // Update the DB
      $http.post('/add',{
        'name' : 'tempName',
        'billID':currentBill.billID,
        'lat': $scope.lat,
        'lng': $scope.lng
      })
       .success(function(res){
           // alert('Data sent');
       })
       .error(function(err){
          console.log("SendDataToServer Error: " + err);
       });
  };

  // $scope.genPolyRoute = function (){
  //   genPolyRoute($scope);
  // };

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

  // $scope.getMapInstance = function () {
  //   // alert("getMapInstance");
  //   if ($scope.index){
  //     showAllMarkers($scope);
  //   }
  // };

  $scope.genGeoMarker = function (numberOfMarkers) {
    genGeoMarker($scope);
  };

  $scope.clackMarker = function (gMarker,eventName, model) {
    alert("clackMarker: " + model);
    $log.log("from clackMarker");
    $log.log(model);
  };

  $scope.getDataFromServer = function(){
      // Get data from the server
        $http.get('/map/data')
        .success(function(data) {
          $scope.fakeDB = data.fakeDB;
          $scope.index = data.indexToPass;

          // Trick...
          showAllMarkers($scope);
          genPolyRoute($scope);

      }) //TODO: error handle..
        .error(function(err){
          console.log("getDataFromServer - Error: " + err);
      });
  };


    $scope.list = [];
    $scope.text;
  $scope.submit = function() {

    // temp solution...
      $http.post('/billId',{
        'billID':$scope.text
      })
       .success(function(res){  
            $scope.currentBillID = $scope.text;

            //Create geoLocation
            genGeoMarker($scope);

            $scope.sendDataToServer($scope, $http);

            var successCheckInMessage = "Checked In!" + "\nBill ID : " + $scope.currentBillID + "\nLocation : " + 
            "(" + $scope.lat + " , " +  $scope.lng + ")";

            alert(successCheckInMessage);
            $route.reload();
       })
       .error(function(err){
          alert("ErrorSubmit: " + err);
       });

    
  };

});
