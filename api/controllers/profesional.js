var Request = require('../models/request');
var Profile = require('../models/profile');
var User = require('../models/user');
var Request = require('../models/request');
var Measure = require('../models/measure');
var Notification = require('../models/notification');
var Connection = require('../models/connection');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var Firebase = require("../helpers/firebase");


module.exports =  {
	newRequest,
	saveProfesionalProfile,
	updateProfesionalProfile,
	getProfesionalProfile,
	getPendantRequests,
	removeRequest,
	getPatients,
	removePatient,
	newProfesionalMeasure

}
function saveProfesionalProfile(req,res){
	User.findById(req.auth.sub, function(err, user) {
			if(!err) {
				if(user!=null) {
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					//TODO create id with bcryp
					Profile.findOne({user:encryptId},function(err, profile) {
						if (err) {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else if(!profile) {
							var profile = new Profile({
								user:encryptId,
								name:Crypt.encrypt(req.body.name),
								surname:Crypt.encrypt(req.body.surname),
								specialty:Crypt.encrypt(req.body.specialty),
							});
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
function updateProfesionalProfile(req,res){
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
							profile.surname=Crypt.encrypt(req.body.surname),
							profile.specialty=Crypt.encrypt(req.body.specialty),
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
function getProfesionalProfile(req,res){
	User.findOne({user: req.swagger.params.user.value.toLowerCase()}, function(err, user) {
		if(!err){
			if(user){
				var access=false;
				if(req.auth.role=="admin" || (req.auth.role=="profesional" && user._id==req.auth.sub)){
					retrieveProfile(user).then(function(response){
						res.status(response.statusCode);
						res.json(response);
					});
				}else if(req.auth.role=="patient"){
					Connection.findOne({patient:req.auth.sub, profesional:user},function(err,connection){
						if(!err){
							if(connection!=null){
								retrieveProfile(user).then(function(response){
									res.status(response.statusCode);
									res.json(response);
								});
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
		Profile.findOne({user:encryptId},function(err, profile) {
			if (!err) {
				if(profile!=null){
					var decryptProfile= {
						name:Crypt.decrypt(profile.name),
						surname:Crypt.decrypt(profile.surname),
						specialty:Crypt.decrypt(profile.specialty)
					};
					resolve({message:"Success",statusCode:200, profile:decryptProfile});
				}else{
					resolve({message:"Profile not found",statusCode:404})

				} 
			}else {
				resolve({message:err.message,statusCode:500})
			}
		});
	});
}


function newRequest(req,res){
	User.findOne({user:req.body.user.toLowerCase()}).populate("push").exec(function(err, patient) {
		if(!err) {
			if(patient!=null) {
				User.findById(req.auth.sub, function(err, profesional) {
					if (!err){
						if(profesional!=null){
							Request.findOne({$and: [{patient: patient._id}, {profesional: profesional}]},function(err,request){
								if (err) {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}else{
									if(request!=null){
										res.status(409);
										response={message:"Request already existed",statusCode:409}
										res.json(response);
									}else{
										var request = new Request({
											patient:patient,
											profesional: profesional,
											approved: false,
											message: req.body.message,
											created:   new Date(),
											updated:   new Date()
										});
										request.save(function(err,user) {
											if (err) {
												res.status(500);
												response={message:err.message,statusCode:500}
												res.json(response);
											}else{
												//TODO send Notification patient.
												var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
												var notification = new Notification({
													user:encryptId,
													type:1,
													variables:[profesional.user],
													created:new Date(),
													view: false
												})
												notification.save(function(err,not){
													if(!err){
														if(patient.push!=null && patient.push.token!=null && patient.push.os=="android"){
															firebase= new Firebase();
															langauge=global.gConfig.languages.includes(req.headers['Accept-Language'] && req.headers['Accept-Language'].substring(0,2).toLowerCase())?req.headers['Accept-Language'].substring(0,2):global.gConfig.languages[0];
															body=Notification.getMessage(1,langauge,[profesional.user]);
															title=Notification.getTitle(1,langauge);
															//TODO add data with not._id firebase error
															firebase.sendNotification(title,body,Crypt.decrypt(patient.push.token))
														}
														res.status(201);
														response={message:"Success",statusCode:201}
														res.json(response);
													}else{
														res.status(500);
														response={message:err.message,statusCode:500}
														res.json(response);
													}
												});
												
											}
										});
									}
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
				res.status(404);
				response={message:"User not found 2",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function newProfesionalMeasure(req,res){
	if(Measure.isValidType(req.body.measure)){
		User.findById(req.auth.sub, function(err, user) {
			if(!err) {
					User.findOne({user: req.body.user.toLowerCase()}, function(err, patient) {
						if(!err){
							if(patient!=null){
								Connection.findOne({patient:patient, profesional:user},function(err,connection){
									if(!err){
										if(connection!=null){
											var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
											var measure = new Measure({
												user:encryptId,
												measure:req.body.type,
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
											res.status(403);
											response={message:"Access Denied",statusCode:403}
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
								response={message:"Patient not found",statusCode:404}
								res.json(response);
							}
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
		res.status(400);
		response={message:"Measure type not valid",statusCode:400}
		res.json(response);
	}
}

function getPendantRequests(req,res){

	Request.find({$and: [{profesional: req.auth.sub}, {approved: false}]}).select("-profesional").populate('patient').exec(function (err, requests) {
		if (!err){

			var requestsFinal =[];
			for(i=0;i<requests.length;i++){
				requestsFinal.push({
					_id:requests[i]._id,
					message:requests[i].message,
					user:requests[i].patient.user,
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

function removeRequest(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				Request.findOne({_id:req.swagger.params.id.value, approved:false},function(err,request){
					if(!err){
						if(request){
							if(request.profesional==req.auth.sub){
								Request.findByIdAndRemove(req.swagger.params.id.value,function (err){
									if(!err){
										res.status(200);
										response={message:"Request removed",statusCode:200}
										res.json(response);
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


function getPatients(req,res){
		Connection.find({profesional: req.auth.sub}).populate('patient').exec(function (err, patients) {
		if (!err){
			var nicknames=[];
			for(i=0;i<patients.length;i++){
				nicknames.push(patients[i].patient.user)
			}
			res.status(200);
			response={message:"Succees",statusCode:200,patients:nicknames}
			res.json(response);
		
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}

function removePatient(req,res){
	User.findOne({user:req.swagger.params.patient.value.toLowerCase()},function(err,patient){
		if(!err){
			if(patient!=null){
				Connection.findOneAndDelete({patient:patient ,profesional:req.auth.sub},function (err,connection) {
					if (!err){
						if(connection){
							Request.findOneAndDelete({patient:patient,profesional:req.auth.sub},function (err,request) {
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
				response={message:"Patient not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}


