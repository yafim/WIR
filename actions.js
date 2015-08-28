var express = require('express');

var router = express.Router();

// Fake DB
var billMarkers = [];

router.get('/', function(req, res){
	// load data from DB here
	res.render('index', {
		title: 'My locations',
		items: billMarkers
	});
});


router.get('/map', function(req, res){
	res.render('map');
});


// post method
//TODO: get from data base 
router.post('/add', function(req, res){
	var newItem = req.body.newItem;
	billMarkers.push({
		id: billMarkers.length + 1,
		desc: newItem
	});

	res.redirect('/');
});

// Use as module
module.exports = router;
