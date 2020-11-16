var User = require('../models/user');
var Profile = require('../models/profile');
var Request = require('../models/request');
var Connection = require('../models/connection');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var Notification = require('../models/notification');
var Firebase = require("../helpers/firebase");

var Measure = require('../models/measure');
module.exports =  {
	saveProfile,
	updateProfile,
	getProfile,
	newMeasure,
	getRequests,
	rejectRequest,
	acceptRequest,
	getProfesionals,
	removeProfesional,
	getRaceTypes,
	getGenderTypes

}

function getRaceTypes(req,res){
	var races=[];
	var types=Profile.getRaceTypes();
	try {
    var langauge=global.gConfig.languages.includes(req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			races.push({type:types[i].type,description:types[i].description[langauge]});
		}
		res.status(200);
		response={message:"Success",statusCode:200,races:races}
		res.json(response);
 
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}
function getGenderTypes(req,res){
	var genders=[];
	var types=Profile.getGenderTypes();
	try {
    var langauge=global.gConfig.languages.includes(req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			genders.push({type:types[i].type,description:types[i].description[langauge]});
		}
		res.status(200);
		response={message:"Success",statusCode:200,genders:genders}
		res.json(response);
 
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}
function saveProfile(req,res){
	User.findById(req.auth.sub, function(err, user) {
			if(!err) {
				if(user!=null) {
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					//TODO create id with bcryp
					Profile.findOne({user: encryptId},function(err, profile) {
						if (err) {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else if(!profile) {
							var profile = new Profile({
								user:encryptId,
								name:Crypt.encrypt(req.body.name),
								surname:Crypt.encrypt(req.body.surname),
								sex:req.body.sex,
								age:req.body.age,
								race:req.body.race,
							});
							if(req.body.diabetes!=null){
								profile.diabetes=req.body.diabetes;
							}
							if(req.body.htn!=null){
								profile.htn=req.body.htn;
							}
							if(req.body.dyslipidemia!=null){
								profile.dyslipidemia=req.body.dyslipidemia;
							}
							if(req.body.hyperuricemia!=null){
								profile.hyperuricemia=req.body.hyperuricemia;
							}
							profile.save(function(err,profile) {
								if (err) {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}else{
									res.status(201);
									response={message:"Success",statusCode:201}
									res.json(response);
								}
							});
						}else{
							res.status(409);
							res.json({message:"Profile already created",statusCode:409});
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
function updateProfile(req,res){
	User.findById(req.auth.sub, function(err, user) {
			if(!err) {
				if(user!=null) {
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					//TODO create id with bcryp
					Profile.findOne({user: encryptId},function(err, profile) {
						if (err) {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else if(profile) {
							profile.name=Crypt.encrypt(req.body.name),
							profile.surname=Crypt.encrypt(req.body.surname);
							profile.sex=req.body.sex;
							profile.age=req.body.age;
							profile.race=req.body.race;
							if(req.body.diabetes!=null){
								profile.diabetes=req.body.diabetes;
							}
							if(req.body.htn!=null){
								profile.htn=req.body.htn;
							}
							if(req.body.dyslipidemia!=null){
								profile.dyslipidemia=req.body.dyslipidemia;
							}
							if(req.body.hyperuricemia!=null){
								profile.hyperuricemia=req.body.hyperuricemia;
							}
							profile.save(function(err,profile) {
								if (err) {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}else{
									res.status(200);
									response={message:"Success",statusCode:201}
									res.json(response);
								}
							});

						}else{
							res.status(404);
							res.json({message:"Profile not found",statusCode:404});
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
function getProfile(req,res){
	User.findOne({user: req.swagger.params.user.value.toLowerCase()}, function(err, user) {
		if(!err){
			if(user){
				var access=false;
					
				if(req.auth.role=="admin" || (req.auth.role=="patient" && user._id==req.auth.sub)){
							retrieveProfile(user).then(function (response){
								res.status(response.statusCode);
								res.json(response);
							})
					
				}else if(req.auth.role=="profesional"){
					Connection.findOne({patient:user, profesional:req.auth.sub},function(err,connection){
						if(!err){
							if(connection!=null){
								retrieveProfile(user).then(function (response){
									res.status(response.statusCode);
									res.json(response);
								})
								
							}else{
								res.status(403);
								response={message:"Access Denied",statusCode:403}
								res.json(response);
							}
						}
					});

				}else{
					res.status(403);
					response={message:"Access Denied",statusCode:403}
					res.json(response);
				}
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

function retrieveProfile(user){
	return  new Promise(function(resolve) {
		var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
		Profile.findOne({user:encryptId}).select("-user -id").exec(function(err, profile) {
			if (!err) {
				if(profile!=null){
					var decryptProfile= {
						name:Crypt.decrypt(profile.name),
						surname:Crypt.decrypt(profile.surname),
						sex:profile.sex,
						race:profile.race,
						age:profile.age,
						diabetes:profile.diabetes,
						htn:profile.htn,
						dyslipidemia:profile.dyslipidemia,
						hyperuricemia:profile.hyperuricemia
					};
					resolve( {message:"Success",statusCode:200, profile:decryptProfile});

				}else{
					resolve({message:"Profile not found",statusCode:404});
					
				} 
			}else {
				resolve({message:err.message,statusCode:500})
			}
		});
	})
}
function getRequests(req,res){

	Request.find({$and: [{patient: req.auth.sub}, {approved: false}]}).select("-patient").populate('profesional').exec(function (err, requests) {
		if (!err){
			
				var requestsFinal =[];
				for(i=0;i<requests.length;i++){
					requestsFinal.push({
						_id:requests[i]._id,
						message:requests[i].message,
						user:requests[i].profesional.user,
						created:requests[i].created
					})
				}
				res.status(200);
				response={message:"Success",statusCode:200,requests:requestsFinal}
				res.json(response);

		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}

function rejectRequest(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				Request.findOne({_id:req.swagger.params.id.value, approved:false},function(err,request){
					if(!err){
						if(request!=null){
							if(request.patient==req.auth.sub){
								Request.findByIdAndRemove(req.swagger.params.id.value,function (err){
									if(!err){
										var encryptId= crypto.createHash('sha256').update(request.profesional+global.gConfig.secret).digest('hex');
										var notification = new Notification({
											user:encryptId,
											type:3,
											variables:[user.user],
											created:new Date(),
											view: false
										})
										notification.save(function(err,not){
											if(!err){
												User.findById(request.profesional).populate("push").exec(function(err,profesional){
													if(!err){
														if(profesional.push!=null && profesional.push.token!=null && profesional.push.os=="android"){
															firebase= new Firebase();
															langauge=global.gConfig.languages.includes(req.headers['Accept-Language'] && req.headers['Accept-Language'].substring(0,2).toLowerCase())?req.headers['Accept-Language'].substring(0,2):global.gConfig.languages[0];
															body=Notification.getMessage(3,langauge,[user.user]);
															title=Notification.getTitle(3,langauge);
															//TODO add data with not._id firebase error
															firebase.sendNotification(title,body,Crypt.decrypt(profesional.push.token))
														}
													}
												})
												res.status(200);
												response={message:"Request Rejected",statusCode:200}
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
								});
							}else{
								res.status(404);
								response={message:"Access Denied",statusCode:404}
								res.json(response);
							}
						}else{
							res.status(404);
							response={message:"Request not found",statusCode:404}
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

function acceptRequest(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				Request.findOne({_id:req.swagger.params.id.value,approved:false},function(err,request){
					if(!err){
						if(request){
							if(request.patient==req.auth.sub){
								request.approved=true;
								request.save(function(err,request){
									if(!err){
										var connection = new Connection({
											patient:request.patient,
											profesional: request.profesional,
											created: new Date()
										});
										connection.save(function(err,connection) {
											if (err) {
												res.status(500);
												response={message:err.message,statusCode:500}
												res.json(response);
											}else{
												var encryptId= crypto.createHash('sha256').update(request.profesional+global.gConfig.secret).digest('hex');
												var notification = new Notification({
													user:encryptId,
													type:2,
													variables:[user.user],
													created:new Date(),
													view: false
												})
												notification.save(function(err,not){
													if(!err){
														User.findById(request.profesional).populate("push").exec(function(err,profesional){
															if(!err){
																if(profesional.push!=null && profesional.push.token!=null && profesional.push.os=="android"){
																	firebase= new Firebase();
																	langauge=global.gConfig.languages.includes(req.headers['Accept-Language'] && req.headers['Accept-Language'].substring(0,2).toLowerCase())?req.headers['Accept-Language'].substring(0,2):global.gConfig.languages[0];
																	body=Notification.getMessage(2,langauge,[user.user]);
																	title=Notification.getTitle(2,langauge);
																	//TODO add data with not._id firebase error
																	firebase.sendNotification(title,body,Crypt.decrypt(profesional.push.token))
																}
															}
														})
														res.status(200);
														response={message:"Request Accepted",statusCode:200}
														res.json(response);
													}else{
														res.status(500);
														response={message:err.message,statusCode:500}
														res.json(response);
													}
												});
											}
										});
										
									}else{
										res.status(500);
										response={message:err.message,statusCode:500}
										res.json(response);
									}
								});
							}else{
								res.status(403);
								response={message:"Access Denied",statusCode:403}
								res.json(response);
							}
						}else{
							res.status(404);
							response={message:"Request not found",statusCode:404}
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

function getProfesionals(req,res){
	Connection.find({patient: req.auth.sub}).populate('profesional').exec(function (err, profesionals) {
		if (!err){

				var nicknames=[];
				for(i=0;i<profesionals.length;i++){
					nicknames.push(profesionals[i].profesional.user)
				}
				res.status(200);
				response={message:"Succees",statusCode:200,profesionals:nicknames}
				res.json(response);
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}
function removeProfesional(req,res){
	User.findOne({user:req.swagger.params.profesional.value.toLowerCase()},function(err,profesional){
		if(!err){
			if(profesional!=null){
				Connection.findOneAndDelete({patient: req.auth.sub,profesional:profesional},function (err,connection) {
					if (!err){
						if(connection){
							Request.findOneAndDelete({patient:req.auth.sub,profesional:profesional},function (err,request) {
								if (!err){
									if(request!=null){
										res.status(200);
										response={message:"Removed succsefuly",statusCode:200}
										res.json(response);
									}else{
										res.status(404);
										response={message:"Request does not  exists",statusCode:404}
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
							response={message:"Connection does not exists",statusCode:404}
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
				response={message:"Profesional not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}
function newMeasure(req,res){
	if(Measure.isValidType(req.body.measure)){
		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					var measure = new Measure({
						user:encryptId,
						type:req.body.measure,
						value:req.body.value,
						created:   new Date()
					});
					measure.save(function(err,measure) {
						if (err) {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else{
							res.status(201);
							response={message:"Success",statusCode:201}
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
	}else{
		res.status(400);
		response={message:"Measure type not valid",statusCode:400}
		res.json(response);
	}
}

