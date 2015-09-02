var express = require('express');
var utils = require('./utils.js');

var router = express.Router();

/* CREATE FAKE DB */
var currentBillId = [];
var indexToPass;

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
	res.render('index')
});

router.get('/checkIn', function(req, res){
	// var billId = req.query.currentBillId;
	//billToShow = billMarkers;

	// load data from DB here
	res.render('checkIn', {
		title: 'My locations',
		items: bills[indexToPass] // search for billMarker by current billId.
	});
});

// about page
router.get('/about', function(req, res){
	res.render('about')
});

router.get('/insertBillId', function(req, res){
	// load data from DB here
	res.render('insertBillId',{
		items : bills
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

	var newItem = req.body.newItem;
	//db.bills.insert(newItem);
	res.redirect('/checkIn');
});

//TODO: 
// 1. Search for bill Id (exists or not)
// 2. redirect to checkIn with current billId 

router.post('/billId', function(req, res){
	var billId = req.body.billId;

	var isExists = utils.SearchIdInArray(billId, bills);

	if (isExists == -1){

	var newBillMarkers = [
		{
			"currentLocation" : {"lat" : null, "lng" : null}
		}
	];

	bills.push({
		billId: billId,
		billMarkers : newBillMarkers
	});
		indexToPass = bills.length - 1;
	}
	else {
		// currentBillId = bills[isExists];
		// indexToPass = isExists;
		// currentBillId = bills[isExists].concat;
		indexToPass = isExists;
	}

	res.redirect('/checkIn');
	 // res.redirect('/checkIn?billId=' + currentBillId);
	//res.redirect('/isExists=' + isExists);

});


// Use as module
module.exports = router;

