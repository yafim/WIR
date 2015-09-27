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
    .when("/map", {templateUrl: path + "map.html", controller: "MapController"})
    .when("/checkIn", {templateUrl: path + "checkIn.html", controller: "MapController", needAuth: true})
    .when("/myBills", {templateUrl: path + "myBills.html", controller: "MapController", needAuth: true})
    .otherwise("/404", {templateUrl: path + "404.html", controller: "PageCtrl"});
}]);


/**
 * General variables
 */
app.service('sharedVariables', function () {
    var property = '';
    var currentBill;

        return {
            getProperty: function () {
                return property;
            },
            getCurrentBill: function (){
                return currentBill;
            },
            setCurrentBill: function(value){
                currentBill = value;
            },
            setProperty: function(value) {
                property = value;
            }
        };
});

// Find bill by id
app.filter('getById', function() {
  return function(input, id) {
    var len=input.length;
    for (var i=0; i<len; i++) {
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
    $(document).ready(function() {
        $(".btn-pref .btn").click(function () {
            $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
            // $(".tab").addClass("active"); // instead of this do the below
            $(this).removeClass("btn-default").addClass("btn-primary");
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

    // alert($scope.fbId);
    
    // $scope.logged = ($scope.fbId) ? "Logged" : null;
        
    // Useful variables
    $scope.onlyNumbers = /^\d+$/; // validate input 
    $scope.currentBillID; // current billId

    // Locations
    $scope.lat = "0"; // latitude
    $scope.lng = "0"; // longtitude
    $scope.latlng = new google.maps.LatLng(0, 0);

    $scope.error = ""; // error message

    $scope.model = { map: "" }; // map id/model
    
    
    $scope.myMarkers = []; // holds markers array 
    $scope.line = []; // holds poly line array
    
    $scope.polyLineCoordinates = []; // poly line coordinates 
    $scope.currentMarker;

    // textbox
    $scope.list = [];
    $scope.text;



    // GoogleMap options
    $scope.mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng($scope.lat, $scope.lng),
        mapTypeControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },

        mapTypeId: google.maps.MapTypeId.ROADMAP 
    };

    // set map with current location - geo location
    $scope.showPosition = function (position) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
        
        $scope.$apply();

        // current location
        var latlng = new google.maps.LatLng($scope.lat, $scope.lng);

        $scope.latlng = latlng;
        $scope.model.map.setCenter(latlng);

        $scope.startSpin(); // start loading spinner
        
        // if bill exists - show markers
        if ($scope.currentBill){
            showAllMarkers($scope);
        }
        
    }

    // show errors
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
        alert($scope.error);
        $scope.$apply();
    }

    // get current location
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

    // Create marker from places array 
    for (var place in places){
          marker = new google.maps.Marker({
            map: $scope.model.map,
            position: new google.maps.LatLng(places[place].lat, places[place].lng)
          });

      
      // Add marker to list
      $scope.myMarkers.push(marker);

      // Add current location - for the Poly route...
      $scope.polyLineCoordinates.push(marker.position);
    }

  }

  // Generate geo marker
  var genGeoMarker = function(scope){
    $scope.currentMarker = new google.maps.Marker({
      map: $scope.model.map,
      position: $scope.latlng
    });
  }

  // Generate a simple line between every 2 markers
  var genPolyRoute = function(scope){
    var polyLine = new google.maps.Polyline({
      path: $scope.polyLineCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    polyLine.setMap($scope.model.map);

    $scope.line.push(polyLine);
  };

  // Clear all map
  $scope.removeMarkers = function () {
        for (var i = 0; i < $scope.myMarkers.length; i++) {
            $scope.myMarkers[i].setMap(null);
            if (i < $scope.line.length){
            $scope.line[i].setMap(null);
          }
        }

        $scope.myMarkers = [];
        $scope.polyLineCoordinates = [];
        $scope.line = [];
  };

  // generate all markers
  $scope.genAllMarkers = function(){
    showAllMarkers($scope);
  };

  // generate geo location marker
  $scope.genGeoMarker = function () {
    genGeoMarker($scope);
  };

  // Get bills by id
  $scope.getUserBillsById = function(){
    // if connected get bills by id
    if ($scope.fbId){
          // Get data from the server
            $http.get('/map/getUserBills', {
              params: { userFBId: $scope.fbId }
            })
            .success(function(data) {
              $scope.bills = data;
              $scope.numberOfBills = data.length;

          }) // Error message..
            .error(function(err){
              console.log("getUserBillsById - Error: " + err);
          });
      };
  }

  //search bill id with text box
  $scope.submitSearch = function(){
    $http.get('/map/getBillById', {
        params: { billID: $scope.text }
      })
       .success(function(data){  

        $scope.text = ''; // clear text box 
        if (data[0] != null){
            sharedVariables.setCurrentBill(data[0]);
            $location.path("/map"); // redirect to map
            $route.reload(); // refresh map 
        } 
        else {
            alert("Bill Not Found");
            $scope.removeMarkers();
        }
        


       })
       .error(function(err){
          alert("ErrorSubmitSearch: " + err);
       });


  };

  /** Submit checkIn button
   * 1. connect to the server (if connected with fb profile)
   * 2. submit new/existing bill
   * 3. update relevant fields
   **/
  $scope.submit = function() {
    if ($scope.fbId ){
      $http.post('/map/checkIn',{
        'name' : 'Yafim Vodkov',
        'fbID' : $scope.fbId,
        'billID':$scope.text,
        'lat': $scope.lat,
        'lng': $scope.lng
      })
       .success(function(data){  
            $scope.currentBillID = $scope.text;
            $scope.currentBill = data[0];

            $scope.places = data[0].places; // locations

            $scope.removeMarkers(); // clear map
            
            genGeoMarker($scope); // create marker with current location

            showAllMarkers($scope); // show all other markers

            // show check in message
            var successCheckInMessage = "Checked In!" + "\nBill ID : " + $scope.currentBillID + "\nLocation : " + 
            "(" + $scope.lat + " , " +  $scope.lng + ")";

            alert(successCheckInMessage);

       }) 
       .error(function(err){
          alert("ErrorSubmit: " + err);
       });
     }
     else {
      alert("Please Login with facebook account");
     }
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

  $scope.showMarkerById = function(arr){
    $scope.searchById(arr, $scope.selectBill);
    $scope.places = $scope.selected.places;
    $scope.removeMarkers();

    showAllMarkers($scope);
    genPolyRoute($scope);
    // alert("id");

  };
    
  $scope.initMap = function(){
      $scope.currentBill = sharedVariables.getCurrentBill();
      $scope.places = $scope.currentBill.places;
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

  //Define some listeners

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
