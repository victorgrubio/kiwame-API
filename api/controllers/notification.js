var Notification = require('../models/notification.js');
var Config=require('../helpers/config.js');
var User = require('../models/user');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var uuid = require('uuid');
var mongoose = require('mongoose');

module.exports =	{
	getNotificationTypes,
	getNotifications,
	deleteNotification,
	countNotifications,
	deleteNotification

}


function getNotificationTypes(req,res){
	var notifications=[];
	var types=Notification.getTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
				notifications.push({notification:types[i].type,message:types[i].message[langauge],title:types[i].title[langauge],description:types[i].description,variables:types[i].variables});
		}
		res.status(200);
		response={message:"Success",statusCode:200,notifications:notifications}
		res.json(response);
 
	}catch(err) {
		res.status(500);
		response={message:err.message,statusCode:500}
		res.json(response);
	}
}

function getNotifications(req,res){
		User.findById(req.auth.sub, function(err, user) {
			if(!err) {
				if(user!=null) {
					var notificationsResponse;
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					Notification.find({user:encryptId,view:false}).select(-user).exec(function (err, notifications) {
						if(!err) {
							notificationsResponse=[];
							var language=global.gConfig.languages.includes(req.headers['Accept-Language'] && req.headers['Accept-Language'].substring(0,2).toLowerCase())?req.headers['Accept-Language'].substring(0,2):global.gConfig.languages[0];
							for(k=0;k<notifications.length;k++){
								message=Notification.getMessage(notifications[k].type,language,notifications[k].variables)
								notificationsResponse.push({id:notifications[k].id,notification:notifications[k].type,message:message,variables:notifications[k].variables,created:notifications[k].created});
							}
							res.status(200);
							response={message:"Success",statusCode:200,notifications:notificationsResponse};
							res.json(response);
							
						}else{
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}
					});
				}else{
					res.status(404);
					response={message:"User not Found",statusCode:404}
					res.json(response);
				}
			}else{
				res.status(500);
				response={message:err.message,statusCode:500}
				res.json(response);
			}
		});

}

function setNotificationViewed(req, res) {
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				Notification.find({user:encryptId,view:false,_id:req.swagger.params.id.value}, function(err, notification) {
					if(!err) {
						if(notification) {
							notification.view=true;
							notification.save(function(err) {
								if(!err) {
										res.status(200).send();
								}else {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							});
						}else{
								res.status(404);
								response={message:"Notification not found",statusCode:404}
								res.json(response);
						}
					}else{
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				});
			}else{
				res.status(404);
				response={message:"Notification not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function deleteNotification(req, res) {
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				Notification.findOneAndDelete({_id:req.swagger.params.id.value,user:encryptId},function (err,notification) {
					if (!err){
						if(notification){
							res.status(200);
							response={message:"Removed succsefuly",statusCode:200}
							res.json(response);
						}else{
							res.status(404);
							response={message:"Notification not found",statusCode:404}
							res.json(response);
						}
					}else{
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				});
			}else{
				res.status(404);
				response={message:"User not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}


function countNotifications (req, res) {
	 User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				var notificationsResponse;
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				Notification.find({user:encryptId,view:false}).select(-user).exec(function (err, notifications) {
					if(!err) {
						res.status(200);
						response={message:"Success",statusCode:200,notifications:notifications.length};
						res.json(response);
					}else{
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
					}
				});
			}else{
				res.status(404);
				response={message:"User not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}
