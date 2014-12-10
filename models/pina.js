/**
 * Created by Usuario on 10/12/2014.
 */

var express = require('express');
var cradle = require('cradle');
var http = require('http');

var db = new (cradle.Connection)().database('frutas');
db.exists(function (err, exists) {
	if (err) {
		console.log('error', err);
	}else if (!exists) {
		console.log('database does not exists.');
		db.create();
		console.log('database created.');

		db.save('_design/frutas', {
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



//config Routes
var router = express.Router();
router.route('/').get(function(req, res){
	console.log("Api para consultar frutas");
	res.json({'message':'Api para consultar frutas'});
});

router.route('/frutas/:fruta').get(function(req, res){
	var params = req.params;
	var self = this;
	self.res = res;

	if(params.fruta=='kiwi'){
		db.view('frutas/allKiwi', function (err, res) {
			console.log('fruta kiwi, ', res);
			self.res.json(res);
		});
	}
	else if(params.fruta=='pina'){
		db.view('frutas/allPinas', function (err, res) {
			console.log('fruta pina, ', res);
			self.res.json(res);
		});
	}
	else if(params.fruta=='fresa'){
		db.view('frutas/allFresas', function (err, res) {
			console.log('fruta fresa, ', res);
			self.res.json(res);
		});
	}
	else {
		res.json({'status':'failed'});
	}
});

// Solicitar fruta
router.route('/frutas').post (function (req, res){
	var type = req.body.type;
	console.log('type: ', type);

	var body = JSON.stringify({
		fruta: type
	});

	var options = {
		host: '127.0.0.1',
		path: '/api/distribuidora/comprarfruta',
		port: '3050',
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
					res.json({'status':'succes','fruta':str});
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
		host: '127.0.0.1',
		path: '/api/distribuidora/' + user + '/mandarproducir',
		port: '3050',
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

router.route('/frutas/:id').put(function(req, res){
	var params = req.params;
	var self = this;
	self.res = res;

	db.merge(params.id,{"status":"vendido"},function(err, res){
		if(err){
			self.res.json({'status':'failed','reason':err});
		}
		else{
			self.res.json({'status':'succes','fruta':res});
		}
	});
});

router.route('/frutas/:id').delete(function(req, res){
	var params = req.params;

	db.get(params.id,function(err,ress){
		if(err){
			res.json({'status':'failed','reason':err});
		}
		else{
			db.remove(params.id, function(err, resss){
				if(err){
					res.json({'status':'failed','reason':err});
				}
				else{
					console.log(resss);
					res.json({'status':'succes'});
				}
			});
		}
	});

});

module.exports = router;