//librerias
var express = require('express');
var bodyParser = require('body-parser');
var pina = require('./models/pina');

//Iniciar la app
var app = express();
app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, X-Titanium-Id, Content-Type");
	res.header("Access-Control-Allow-Methods",'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	next();
});
//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use('/api', pina);

var port = process.env.PORT || 3000;	// Cambiar por el puerto en el que se quiera ejecutar este servidor
app.listen(port);
console.log('Server listening in the port: ' + port);