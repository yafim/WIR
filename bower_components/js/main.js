var app = angular.module('pageHolder', [
  'ngRoute',
  'ui.map',
  'facebookUtils',
  'angularSpinner'
])

    .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

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
    .when("/contact", {templateUrl: path + "contact.html", controller: "PageCtrl"})
    // .when("/map", {templateUrl: path + "map.html", controller: "MapController"})
    .when("/checkIn", {templateUrl: path + "checkIn.html", controller: "MapController", needAuth: true})
    .when("/myBills", {templateUrl: path + "myBills.html", controller: "MapController", needAuth: true})
    .otherwise("/404", {templateUrl: path + "404.html", controller: "PageCtrl"});
}]);


/**
 * General variables
 */
app.service('sharedVariables', function () {
    var property = '';

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
});

app.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (+input[i].id == +id) {
        return input[i];
      }
    }
    return null;
  }
});


/**
 * Controls all other Pages
 */

app.controller('PageCtrl', function ($scope, $location, $http, $rootScope, sharedVariables) {
  // Activates the Carousel - image changer
  $('.carousel').carousel({
    interval: 5000
  });

  // Activates Tooltips for Social Links 
  //http://www.w3schools.com/bootstrap/bootstrap_tooltip.asp
  $('.tooltip-social').tooltip({
    selector: "a[data-toggle=tooltip]"
  })

    $rootScope.$on('fbLoginSuccess', function(name, response) {
        if(response.status == 'connected'){
            //   $location.url('/'); // I wish to redirect to home page after successful login.
                $rootScope.loggedInUser = response;
                sharedVariables.setProperty(response['authResponse']['userID']);

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
app.controller('NavCtrl', function ($scope, $location,sharedVariables) {
    // $scope.fakeDB = data.fakeDB;
    // $scope.index = data.indexToPass;


    //Search box toggle
    // $scope.custom = true;

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

});



/* My Controller */
app.controller('MapController', function ($scope, $timeout, $log, $http, $route, $window,sharedVariables, $location, $filter, usSpinnerService, $rootScope) {
      //Search box toggle
    $scope.custom = true;

    // FaceBook id
    $scope.fbId = sharedVariables.getProperty();
        
    // Useful variables
    $scope.line = [];
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

    places = $scope.places; 

    for (var place in places){
          marker = new google.maps.Marker({
            map: $scope.model.map,
            position: new google.maps.LatLng(places[place].lat, places[place].lng)
          });

      
      // Add marker to list
      $scope.myMarkers.push(marker);

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
    var polyLine = new google.maps.Polyline({
      path: $scope.flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    polyLine.setMap($scope.model.map);

    $scope.line.push(polyLine);
  };

  /* Insert Data to the server */
  // $scope.sendDataToServer = function (scope, http){
  //   var currentBill = $scope.fakeDB[$scope.index];

  //   // Update the DB
  //     $http.post('/add',{
  //       'name' : 'tempName',
  //       'fbID' : $scope.fbId,
  //       'billID':currentBill.billID,
  //       'lat': $scope.lat,
  //       'lng': $scope.lng
  //     })
  //      .success(function(res){
  //          // alert('Data sent');

  //      })
  //      .error(function(err){
  //         console.log("SendDataToServer Error: " + err);
  //      });
  // };

  // Clear all
  $scope.removeMarkers = function () {
        for (var i = 0; i < $scope.myMarkers.length; i++) {
            $scope.myMarkers[i].setMap(null);
            if (i < $scope.line.length){
            $scope.line[i].setMap(null);
          }
        }

        $scope.myMarkers = [];
        $scope.flightPlanCoordinates = [];
        $scope.line = [];
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

  $scope.genAllMarkers = function(){
    showAllMarkers($scope);
  };

  $scope.genGeoMarker = function () {
    genGeoMarker($scope);
  };

  $scope.clackMarker = function (gMarker,eventName, model) {
    alert("clackMarker: " + model);
    $log.log("from clackMarker");
    $log.log(model);
  };

  $scope.getUserBillsById = function(){

      // Get data from the server
        $http.get('/map/getUserBills', {
          params: { userFBId: $scope.fbId }
        })
        .success(function(data) {
          $scope.fakeDB = data;
          // $scope.index = 0;
// $scope.stopSpin();

      }) //TODO: error handle..
        .error(function(err){
          console.log("getUserBillsById - Error: " + err);
      });
  };


    $scope.list = [];
    $scope.text;
  $scope.submitSearch = function(){

    // $currentBillID = $scope.text;

    $scope.getUserBillsById($scope.text);

    if ($scope.currentBill != null){
            $scope.submit();
            $route.reload();
    }
    else {
      $scope.text='';
    }
  }

  $scope.submit = function() {
    // alert("billID : " + $scope.text);
    // temp solution...
      $http.post('/map/checkIn',{
        'name' : 'tempName',
        'fbID' : $scope.fbId,
        'billID':$scope.text,
        'lat': $scope.lat,
        'lng': $scope.lng
      })
       .success(function(res){  
            $scope.currentBillID = $scope.text;

            //Create geoLocation
            genGeoMarker($scope);

            // $scope.sendDataToServer($scope, $http);

            var successCheckInMessage = "Checked In!" + "\nBill ID : " + $scope.currentBillID + "\nLocation : " + 
            "(" + $scope.lat + " , " +  $scope.lng + ")";

            alert(successCheckInMessage);
            $route.reload();
       })
       .error(function(err){
          alert("ErrorSubmit: " + err);
       });
  };

  // Search for a bill by id
  $scope.searchById = function(arr, id){
   var found = $filter('filter')(arr, {billID: id}, true);
   if (found.length) {
       $scope.selected = found[0];
   } else {
       $scope.selected = 'Not found';
   }
  };


  $scope.showMarkerById = function(arr, id){
    $scope.searchById(arr, id);
    $scope.places = $scope.selected.places;
    $scope.removeMarkers();

    showAllMarkers($scope);
    genPolyRoute($scope);

  };



  // Loading spinner
    $scope.startSpin = function() {
    if (!$scope.spinneractive) {
      usSpinnerService.spin('spinner-1');
      $scope.startcounter++;
    }
  };

    $scope.stopSpin = function() {
    if ($scope.spinneractive) {
      usSpinnerService.stop('spinner-1');
    }
  };
    
    $scope.spinneractive = false;


    $rootScope.$on('us-spinner:spin', function(event, key) {
      $scope.spinneractive = true;
    });

    $rootScope.$on('us-spinner:stop', function(event, key) {
      $scope.spinneractive = false;
    });

    $rootScope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      $scope.stopSpin();
    });

});
