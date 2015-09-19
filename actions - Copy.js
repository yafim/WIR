var express = require('express');
var utils = require('./utils.js');

var router = express.Router();
var isExists;

/* CREATE FAKE DB */
var currentBillId = [];
var indexToPass = 0;

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

var arr = {
    billId: "123",
    billMarkers: billMarkers 
    
}

bills.push(arr);

/* END OF DB*/
var currentBillId = [];
var indexToPass = 0;

var fakeDB = [];

// Each bill 
var places = [
	{
		"name" : 'yafim',
		"lat" : 32.3137373,
		"lng" : 34.8803108
	},

	{
		"name" : 'gotlieb',
		"lat" : 32.069221, 
		"lng" : 34.7734675
	},

	{
		"name" : 'nofar',
		"lat" : 32.084508, 
		"lng" : 34.8731652
	}
];

var arr = {
    billID: "123",
    places: places 
    
}

fakeDB.push(arr);

/* NEW FAKE DB */

/* END */


var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;
var server = new Server('ds035563.mongolab.com', 35563, {auto_reconnect: true});
var db = new Db('rachel', server);
//var db = require('mongoskin').db('localhost:27017/bills');

// The main page
router.get('/', function(req, res){
	// load data from DB here
	res.render('index')
});


router.get('/insertBillId', function(req, res){
	// load data from DB here
	res.render('insertBillId',{
		items : bills
	});
});


router.post('/add', function(req, res){

	//Get variables from req
	var lat = req.body.lat;
	var lng = req.body.lng;
	var name = req.body.name;

	InsertElement(lat, lng, name);

});


// 1. Search for bill Id (exists or not)
// 2. redirect to checkIn with current billId 
// 3. indexToPass - current bill index
router.post('/billId', function(req, res){
	var billId = req.body.billID;
	var name = req.body.name;


	isExists = utils.SearchIdInArray(billId, fakeDB);

	// If no exists, Insert new billId to DB. Otherwise indexToPass = isExists
	if (isExists == -1){
		var places = [];
		fakeDB.push({
			billID: billId,
			places : places
		});
			indexToPass = fakeDB.length - 1;
	} else {
		indexToPass = isExists;
	}

	res.redirect('/#/insertBillId');

});



// Insert an element to array
function InsertElement(lat, lng, name){
	var places = 
	{
		"name" : name,
		"lat" : lat, 
		"lng" : lng 
	};
	

	fakeDB[indexToPass].places.push(places);

}

router.get('/map/data', function(req, res){
	var data = {
		//TODO: DELETE
		bills: bills,
		
		
		indexToPass: indexToPass,
		fakeDB: fakeDB
	};
	res.json(data);
});


// Use as module
module.exports = router;

