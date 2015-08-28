var express = require('express');

var router = express.Router();

var db = require('mongoskin').db('localhost:27017/bills');

router.get('/', function(req, res){
	// load data from DB here
	var bills = db.bills.find()
	res.render('index', {
		title: 'My locations',
		items: bills
	});
});

// post method
//TODO: get from data base 
router.post('/add', function(req, res){
	var newItem = req.body.newItem;
	db.bills.insert(newItem);
	res.redirect('/');
});

// Use as module
module.exports = router;
