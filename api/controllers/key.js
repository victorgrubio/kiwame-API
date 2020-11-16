var Key = require('../models/key.js');
var uuid = require('uuid');
var mongoose = require('mongoose');

module.exports =  {
	newKey,
	deleteKey,
	findAllKeys,
	toggleEnabledKey

}


function newKey(req, res) {

	Key.findOne({'name':req.body.name}, function(err, key) {
		if(!err) {
			if(key) {
				res.status(409);
				response={message:"Key already exists",statusCode:409}
				res.json(response);
			}else{
				var key = new Key({
					key:uuid.v4(),
					name:req.body.name,
					enabled:true,
					created: new Date()
				});
				key.save(function(err,item) {
					if(!err) {
						res.status(201);
						response={message:"Success",statusCode:201,key:item}
						res.json(response);
					} else {
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				});
			}
		}else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}

function deleteKey(req, res) {

	Key.findOneAndDelete({_id:req.swagger.params.id.value}, function(err) {

		if(!err) {
			res.status(204);
			res.json({message:"Key Deleted",statusCode:204});
		}else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}

function findAllKeys (req, res) {

	Key.find({},function(err, keys) {
		if(!err) {
			res.status(200);
			response={message:"Success",statusCode:200,keys:keys}
			res.json(response);
		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}

function  toggleEnabledKey (req, res) {

	Key.findOne({_id:req.swagger.params.id.value},function(err, key) {
		if(!err) {
			if(key) {
					key.enabled=!key.enabled;
					key.updated=new Date();
					key.save(function(err) {
						if(!err) {
							res.status(200);
							response={message:"Success",statusCode:200,key:key}
							res.json(response);
						} else {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}
					});
			}else{
				res.status(404);
				response={message:"Key not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}
