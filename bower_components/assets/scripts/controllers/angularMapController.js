'use strict';
var app = angular.module('angular-map',['google-maps']);

app.controller('MainCtrl', function($scope){
	$scope.map = {
		center: {
			latitude: 40,
			longtitude: 30
		},
		zoom: 8
	}
});