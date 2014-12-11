/**
 * Created by Usuario on 09/12/2014.
 */

//routes/pina.js
var express = require('express');
var cradle = require('cradle');
var http = require('http');

var db = new (cradle.Connection)().database('pinatienda');
db.exists(function (err, exists) {
	if (err) {
		console.log('error', err);
	}else if (!exists) {
		console.log('No existe la base de datos.');
		db.create();
		console.log('Base de datos creada.');

		db.save('_design/obtener', {
			views: {
				allFresas:{
					map: function (doc) {
						if(doc.fruta=='fresa')
							emit(null, doc);
					}
				},
				allPinas:{
					map: function (doc) {
						if(doc.fruta=='pina')
							emit(null, doc);
					}
				},
				allKiwi:{
					map: function (doc) {
						if(doc.fruta=='kiwi')
							emit(null, doc);
					}
				}
			}
		});
	}
});

var router = express.Router();
router.route('/pinatienda').get(function(req, res){
	console.log("Iniciado Servidor");
	res.json({message: "Iniciado Servidor"});
});


router.route('/frutas/:frutas').get(function(req, res){
	var params = req.params;
	if(params.frutas=='kiwi'){
		db.view('obtener/allKiwi', function (err, ress) {
			res.json(ress);
			console.log(ress);
		});
	}
	else if(params.frutas=='pina'){
		db.view('obtener/allPinas', function (err, ress) {
			res.json(ress);
			console.log(ress);
		});
	}
	else if(params.frutas=='fresa'){
		db.view('obtener/allFresas', function (err, ress) {
			res.json(ress);
			console.log(ress);
		});
	}
	else
		res.json({'status':'failed'});
});

router.route('/frutas/guardarfuta').post(function(req, res){
	var body = req.body;

	if(body.fruta=='fresa'||body.fruta=='pina'||body.fruta=='kiwi'){
		db.save(body._id,{"fruta":body.fruta,"status":"disponible"},function(err,ress){
			if(err){
				res.json({'status':'failed','reason':err});
				console.log(ress);
			}
			else{
				console.log(ress);
				res.json({'status':'success','fruta':ress});
			}
		});
	}
	else if(body.fruta!='fresa'&&body.fruta!='pina'&&body.fruta!='kiwi'){
		res.json({'status':'failed',"reason":"You have to choose only 'pina', 'kiwi' or 'fresa'"});
	}
	else{
		res.json({'status':'failed',"reason":"You have to choose a fruit"});
	}
});

// Solicitar fruta
router.route('/frutas/:type/solicitarfrutas').post (function (req, res){
	var type = req.params.type;
	var body = JSON.stringify({
		fruta: type
	});

	var options = {
		host: '127.0.0.1', 	// Cambiar por la direccion ip en la que se ejecute el servidor maestro
		path: '/api/distribuidora/comprarfruta',
		port: '3050',		// Cambiar por el puerto en el que se ejecute el servidor maestro
		method: 'POST',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Length": Buffer.byteLength(body)
		}
	};
	callback = function(response) {
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			console.log(str);
			str = JSON.parse(str);

			db.save({fruta: str.fruta.type, status: "disponible"}, function(err, responseSave) {
				if(err){
					res.json({'status':'failed','reason':err});
				}
				else{
					res.json({'status':'success','fruta':str});
				}
			});
		});
	};

	var req = http.request(options, callback);
	req.write(body);
	req.end();
});

// Producir frutas
router.route('/frutas/:user').post(function (req, res){
	var user = req.params.user;
	var body = JSON.stringify({
		type: req.body.type,
		quantity: req.body.quantity
	});

	var options = {
		host: '127.0.0.1',	// Cambiar por la direccion ip en la que se ejecute el servidor maestro
		path: '/api/distribuidora/' + user + '/mandarproducir',
		port: '3050',		// Cambiar por el puerto en el que se ejecute el servidor maestro
		method: 'POST',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Length": Buffer.byteLength(body)
		}
	};
	callback = function(response) {
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			console.log(str);

			res.json({message: str});
		});
	};

	var req = http.request(options, callback);
	req.write(body);
	req.end();
});

router.route('/frutas/venderfruta').put(function(req, res){
	var body = req.body;
	db.merge(body._id,{"status":"vendido"},function(err,ress){
		if(err){
			res.json({'status':'failed','reason':err});
		}
		else{
			res.json({'status':'success','fruta':ress});
		}
	});
});

router.route('/frutas/despacharfruta').delete(function(req, res){
	var body = req.body;
	db.get(body._id,function(err,ress){
		if(err){
			res.json({'status':'failed','reason':err});
		}
		else{
			console.log(ress);

			db.remove(body._id,function(err,resss){
				if(err){
					res.json({'status':'failed','reason':err});
				}
				else{
					console.log(resss);
					res.json({'status':'success'});
				}
			});
		}
	});

});

// Consultar fruta por id
router.route('/frutas/fruta/:id').get(function(req, res){
	var params = req.params;

	if(params.id) {
		db.get(params.id, function(err, doc) {
			if(err) {
				return new Error("Error al tratar de obtener la fruta");
			}

			res.json({message: doc});
		});
	}

});

module.exports = router;