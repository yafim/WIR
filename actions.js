var express = require('express');

var router = express.Router();

/* CREATE FAKE DB */
var bills = [];

// Each bill 
var billMarkers = [
	{
		"currentLocation" : {"lat" : 32.3137373, "lng" : 34.8803108}
	},

	{
		"currentLocation" : {"lat" : 32.069221, "lng" : 34.7734675}
	},

	{
		"currentLocation" : {"lat" : 32.084508, "lng" : 34.8731652}
	}
];

bills.push({
	billId: '123',
	billMarkers : billMarkers
});

/* END OF DB*/

//var db = require('mongoskin').db('localhost:27017/bills');

router.get('/', function(req, res){
	// load data from DB here
	res.render('index', {
		title: 'My locations',
		items: billMarkers
	});
});

// about page
router.get('/about', function(req, res){
	res.render('about')
});

router.get('/insertBillId', function(req, res){
	// load data from DB here
	res.render('insertBillId',{
		bills : bills
	});
});


// post method
//TODO: get from data base 
router.post('/add', function(req, res){
	var newLocation = req.body.newLocation;
	var lat = req.body.lat;
	var lng = req.body.lng;

	billMarkers.push({
		currentLocation: {"lat" : lat, "lng" : lng}
	});

	//var newItem = req.body.newItem;
	//db.bills.insert(newItem);
	res.redirect('/');
});

router.post('/billId', function(req, res){
	var billId = req.body.billId;
	bills.push({
		billId: billId
	});
	res.redirect('/');
});

// Use as module
module.exports = router;
