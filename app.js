//The EJS package which we have defined in package.json file is allow us to render HTML pages

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

// Configure app
// app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.set('view engine', '.html');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies

// Use middleware
app.use(express.static(path.join(__dirname, 'bower_components'))); //use bootsrap
app.use(bodyParser());

// Define routes
app.use(require('./actions'));

// Start the server
var port = Number(process.env.PORT || 3000);

var server = app.listen(port, function(){
	console.log("Server is running on port " + port);
});

