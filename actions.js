var express = require('express');

var router = express.Router();

// Fake DB
var billMarkers = [
	{
		"id" : "1",
		"currentLocation" : {"lat" : 32.3137373, "lng" : 34.8803108}
	},

	{
		"id" : "2",
		"currentLocation" : {"lat" : 32.069221, "lng" : 34.7734675}
	},

	{
		"id" : "3",
		"currentLocation" : {"lat" : 32.084508, "lng" : 34.8731652}
	}
];

//var db = require('mongoskin').db('localhost:27017/bills');

router.get('/', function(req, res){
	// load data from DB here
	res.render('index', {
		title: 'My locations',
		items: billMarkers
	});
	
});

// post method
//TODO: get from data base 
router.post('/add', function(req, res){
	var newLocation = req.body.newLocation;
	var lat = req.body.lat;
	var lng = req.body.lng;

	billMarkers.push({
		id: billMarkers.length + 1,
		currentLocation: {"lat" : lat, "lng" : lng}
	});

	//var newItem = req.body.newItem;
	//db.bills.insert(newItem);
	res.redirect('/');
});

// Use as module
module.exports = router;
