//The EJS package which we have defined in package.json file is allow us to render HTML pages
/*
var express = require('express');
var app = express();

// For exports function
require('./router/main')(app); 

//Defines where our HTML files are placed so that Server can locate 
//and render them.
app.set('views',__dirname + '/views');

//This line set the view engine or simply presentation factor to 
//EJS which is responsible for HTML rendering.
app.set('view engine', 'ejs');

//This final line will tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);


var server = app.listen(3000, function(){
	console.log("Server is running on port 3000");
});

*/

var http = require('http');

var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<h1>Hello</h1>')
});

server.listen(3000);