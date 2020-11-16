var User = require('../models/user');
var Profile = require('../models/profile');
var Connection = require('../models/connection');
var Message = require('../models/message');
var Notification = require('../models/notification');
var Firebase = require("../helpers/firebase");
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
module.exports =  {
	newMessage,
	countMessages,
	getMessages,
	markMessageAsRead

}
function countMessages(req, res) {

	 User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				Message.find({$and: [{receiver:req.auth.sub},{viewed:false}]}).select(-user).exec(function (err, messages) {
					if(!err) {
						res.status(200);

						response={message:"Success",statusCode:200,messages:messages.length};
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

function newMessage(req,res){
	User.findOne({user:req.swagger.params.user.value.toLowerCase()}).populate("push").exec(function(err,receiver){
		if(!err){
			if(receiver!=null){
				if (receiver.role=="profesional"){
					var query={patient: req.auth.sub,profesional:receiver};
				}else{
					var query={patient: receiver,profesional:req.auth.sub};
				}
				Connection.findOne(query,function (err,connection) {
					if (!err){
						if(connection!=null){
							var message = new Message({
									sender:req.auth.sub,
									receiver:receiver,
									message:Crypt.encrypt(req.body.message),
									viewed:false,
									created: new Date(),
								});
							message.save(function(err,messge) {
								if (err) {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}else{
									if(!err){
										User.findById(req.auth.sub).populate("push").exec(function(err,sender){
											if(!err){
												if(sender!=null){
													var encryptId= crypto.createHash('sha256').update(receiver._id+global.gConfig.secret).digest('hex');
													var notification = new Notification({
														user:encryptId,
														type:4,
														variables:[sender.user],
														created:new Date(),
														updated:null,
														viewed: false
													})
													notification.save(function(err,not){
														if(!err){
															if(receiver.push!=null && receiver.push.token!=null && receiver.push.os=="android"){
																firebase= new Firebase();
																langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
																body=Notification.getMessage(4,langauge,[sender.user]);
																title=Notification.getTitle(4,langauge);
																//TODO add data with not._id firebase error
																firebase.sendNotification(title,body,Crypt.decrypt(receiver.push.token))
															}
														}
														
													});
												}		
											}
										})
										res.status(201);
										response={message:"Success",statusCode:201}
										res.json(response);
									}else{
										res.status(500);
										response={message:err.message,statusCode:500}
										res.json(response);
									}
								}
							});
						}else{
							res.status(403);
							response={message:"Users not connected",statusCode:403}
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
				response={message:"Receiver not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function getMessages(req,res){
	User.findOne({user:req.swagger.params.user.value.toLowerCase()},function(err,user){
		if(!err){
			if(user!=null){
				if (user.role=="profesional"){
					var query={patient: req.auth.sub,profesional:user};
				}else{
					var query={patient: user,profesional:req.auth.sub};
				}
				Connection.findOne(query,function (err,connection) {
					if (!err){
						if(connection!=null){
							var pag=0
							if(req.swagger.params.next.value){
								pag=req.swagger.params.next.value
							}
							Message.countDocuments({$or:[{$and: [{sender: user},{receiver:req.auth.sub}]},{$and: [{sender: req.auth.sub,receiver:user}]}]},function(err,count){
								if (!err){
									skip=global.gConfig.limit*pag;
									limit=global.gConfig.limit;
									Message.find({
											$or:[
												 {$and: [{sender: user},{receiver:req.auth.sub}]},
												 {$and: [{sender: req.auth.sub,receiver:user}]}
												]
											}).skip(skip).limit(limit).sort("-created").exec(function(err,messages){
										if(!err){
											var messagesResponse=[];
											for(i=0;i<messages.length;i++){
												messagesResponse.push({id:messages[i].id,sender:messages[i].sender==req.auth.sub,message:Crypt.decrypt(messages[i].message),viewed:messages[i].viewed,created:messages[i].created,updated:messages[i].updated});
											}
											res.status(200);
											if(count>global.gConfig.limit*(pag+1)){
												response={message:'Sucess',statusCode:200,messages:messagesResponse,next:"/messages/"+user.user+"?next="+(pag+1)};	
											
											}else{
												response={message:'Sucess',statusCode:200,messages:messagesResponse};
											}
											console.log(response)
											res.json(response);
											
										}else{
											res.status(500);
											response={message:err.message,statusCode:500}
											res.json(response);
										}
									});
								}else{
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							})
							
						}else{
							res.status(403);
							response={message:"Users not connected",statusCode:403}
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
				response={message:"Receiver not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function markMessageAsRead(req,res){
User.findOne({user:req.swagger.params.user.value.toLowerCase()},function(err,sender){
		if(!err){
			if(sender!=null){
				if (sender.role=="profesional"){
					var query={patient: req.auth.sub,profesional:sender};
				}else{
					var query={patient: sender,profesional:req.auth.sub};
				}
				Connection.findOne(query,function (err,connection) {
					if (!err){
						if(connection!=null){
							Message.updateMany({sender: sender,receiver:req.auth.sub}, {"$set":{viewed: true, updated:new Date()}},function(err,messages){
								if(!err){
									
										res.status(200);
										response={message:" messages updated",statusCode:200}
										res.json(response);
									
								}else{
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							});
						}else{
							res.status(403);
							response={message:"Users not connected",statusCode:403}
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
				response={message:"Receiver not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}