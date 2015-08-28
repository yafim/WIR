//The EJS package which we have defined in package.json file is allow us to render HTML pages

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();


//Configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use middleware
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'bower_components'))); //use bootsrap

var todoItems = [];

//define routes
app.get('/', function(req, res){
	// load data from DB here
	res.render('index', {
		title: 'My locations',
		items: todoItems
	});
});


app.get('/map', function(req, res){
	res.render('map');
});


// post method
//TODO: get from data base 
app.post('/add', function(req, res){
	var newItem = req.body.newItem;
	todoItems.push({
		id: todoItems.length + 1,
		desc: newItem
	});

	res.redirect('/');
});

var port = Number(process.env.PORT || 3000);

var server = app.listen(port, function(){
	console.log("Server is running on port " + port);
});

