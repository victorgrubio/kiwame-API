
var User = require('../models/user');
var Profile = require('../models/profile');
var Push = require('../models/push');
var Token = require('../models/token');
var Auth = require("../helpers/auth");
var SparkPost = require("../helpers/sparkpost");
var bcrypt = require('bcrypt');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');

var Config=require('../helpers/config.js');

module.exports =  {
	login,
	findAllUsers,
	newUser,
	refreshToken,
	removeUser,
	toggleEnabled,
	findAllUsersEmails,
	forgotPassword,
	resetPassword,
	changePassword,
	searchUser,
	sendVerification,
	verifyEmail,
	newMedicalProfile,
	saveNotifcationsToken,
	updateNotifcationsToken,
	unregisterForNotifications,
	setLanguage

}
function login(req, res) {
	User.findOne({$or: [{email: req.body.user.toLowerCase()}, {user: req.body.user.toLowerCase()}]}, function(err, user) {
		if(!err) {
			if(user!=null) {
				if(user.enabled){
					bcrypt.compare(req.body.password, user.password, function(err, doesMatch){
						if (doesMatch){
							var expiration =  Math.floor(Date.now() / 1000) + (24 * 60 * 60);
							var issuedAt=   Math.floor(user.valid / 1000) ;
							var tokenString = Auth.issueToken(user._id, user.role,expiration,issuedAt);
							var newSecret=(new Date().getTime() * Math.random()	.toString() +user._id);
							var refresh = crypto.createHash('sha256').update(newSecret).digest('hex');
							var encryptToken= crypto.createHash('sha256').update(user._id+refresh+global.gConfig.secret).digest('hex');
							var token=new Token({
								token: encryptToken,
								type:"refresh",
								expires: new Date((Math.floor(Date.now() / 1000) + (100 *24 * 60 * 60))*1000)
							});
							token.save(function(err) {
								if(!err) {
									res.status(200);
									response = {message:"Success",statusCode:200, token: tokenString, role:user.role, expires:expiration, refreshToken:refresh, username:user.user, language:user.language};
									res.json(response);
								} else {
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							});
							
						}else{
							res.status(403);
							response={message:"Invalid password",statusCode:403}
							res.json(response);
						}
					});
				}else{
					res.status(403);
					response={message:"User is not enabled",statusCode:403}
					res.json(response);
					}
			}else{
				res.status(404);
				response={message:"User is not found",statusCode:404}
				res.json(response);
			}
		}else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
};

function refreshToken(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptHash= crypto.createHash('sha256').update(user._id+req.body.refreshToken+	global.gConfig.secret).digest('hex');
				Token.findOne({token:encryptHash},function(err,token){
					if (!err){
						if(token){
							if(token.type=="refresh"){
								if((token.expires.getTime() > new Date().getTime())) {
									var expiration =  Math.floor(Date.now() / 1000) + (24 * 60 * 60);
									var issuedAt =  Math.floor(user.valid / 1000) ;
									var tokenString = Auth.issueToken(user._id, user.role,expiration,issuedAt);
									var newSecret=(new Date().getTime() * Math.random().toString() +user._id);
									var refresh = crypto.createHash('sha256').update(newSecret).digest('hex');
									var encryptToken= crypto.createHash('sha256').update(user._id+refresh+global.gConfig.secret).digest('hex');
									var newToken=new Token({
										token: encryptToken,
										type:"refresh",
										expires: new Date((Math.floor(Date.now() / 1000) + (100 *24 * 60 * 60))*1000)
									});
									newToken.save(function(err) {
										if(!err) {
											res.status(200);
											response = {message:"Success",statusCode:200, token: tokenString, role:user.role, expires:expiration, refreshToken:refresh, username:user.user, language:user.language};
											res.json(response);
										} else {
											res.status(500);
											response={message:err.message,statusCode:500}
											res.json(response);
										}
									});
									token.remove(function(err) {
										if(!err) {
											console.log("token removed")
										}
									});
								}else{
									res.status(403);
									response={message:'Token has expired',statusCode:403}
									res.json(response);
								}
							}else{
								res.status(403);
								response={message:'Token has expired',statusCode:403}
							}
						}else{
							res.status(403);
							response={message:'Token is not valid',statusCode:403}
							res.json(response);
						}
					}else{
						res.status(403);
						response={message:'Token is not valid',statusCode:403}
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

function findAllUsers (req, res) {

	User.find({}).select("-password").exec(function(err, users) {
		if(!err) {
			if (users.length>0){
				res.status(200);
				response={message:"Success",statusCode:200,users:users}
				res.json(response);
			}else{
				res.status(404);
				response={message:"Rule not Found",statusCode:404}
				res.json(response);
			}

		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function findAllUsersEmails (req, res) {

	User.find({}).select("email user").exec(function(err, users) {
		if(!err) {
			if (users.length>0){
				res.status(200);
				response={message:"Success",statusCode:200,users:users}
				res.json(response);
			}else{
				res.status(404);
				response={message:"Rule not Found",statusCode:404}
				res.json(response);
			}

		} else {
			res.status(500);
      response={message:err.message,statusCode:500}
      res.json(response);
		}
	});
}


function removeUser(req, res) {
	User.findById(req.swagger.params.id.value, function(err, user) {
		if(!err) {
			if(user) {
				user.remove(function(err) {
					if(!err) {
						res.status(204).send();
					}else {
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

function  toggleEnabled (req, res) {
	User.findById(req.swagger.params.id.value).select("-password").exec(function(err, user) {
		if(!err) {
			if(user) {
				user.enabled=!user.enabled;
				user.updated=new Date();
				user.valid=new Date();
				user.save(function(err) {
					if(!err) {
						res.status(200);
						response={message:"Success",statusCode:200,user:user}
						res.json(response);
					} else {
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


function searchUser(req, res) {
	User.findOne({$or: [{email: req.body.query.toLowerCase()}, {user: req.body.query.toLowerCase()}]}, function(err, user) {
		if(!err) {
			if(user!=null && user.role=="patient") {
				res.status(200);
				response={message:"patient exists",user:user.user,statusCode:200}
				res.json(response);
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


function changePassword(req, res) {
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				if (req.body.password!=req.body.repeatPassword){
					res.status(400);
					response={message:'Passwords do not match',statusCode:400};
					res.json(response);
				}else if (req.body.password.length<4){
						res.status(400);
						response={message:"Password should be at least 4 digits long",statusCode:400};
						res.json(response);
				}else{
					bcrypt.compare(req.body.oldPassword, user.password, function(err, doesMatch){
						if (!doesMatch){
							res.status(400);
							response={message:"Old password does not match",statusCode:400};
							res.json(response);

						}else{
							bcrypt.hash(req.body.password, global.gConfig.salt_rounds, function(err, password) {
								if(!err){
									user.password=password;
									user.valid=new Date();
									user.save(function(err,user) {
										if (!err) {
											res.status(201);
											var expiration=   Math.floor(Date.now() / 1000) + (24 * 60 * 60);
											var issuedAt=   Math.floor(user.valid / 1000);
											var tokenString = Auth.issueToken(user._id,user.role,expiration,issuedAt);
											var newSecret=(new Date().getTime() * Math.random().toString() +user._id);
											var refreshToken = crypto.createHash('sha256').update(newSecret).digest('hex');
											var encryptToken= crypto.createHash('sha256').update(user._id+refreshToken+global.gConfig.secret).digest('hex');
											var token=new Token({
												token: encryptToken,
												type:"refresh",
												expires: new Date((Math.floor(Date.now() / 1000) + (100 *24 * 60 * 60))*1000)
											});
											token.save(function(err) {
												if(!err) {
													res.status(200);
													response = {message:"Success",statusCode:200, token: tokenString, role:user.role, expires:expiration, refreshToken:refreshToken, username:user.user, language:user.language};
													res.json(response);
												} else {
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
								}
							});
						}
					});
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
};
function forgotPassword(req, res) {
	User.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
		if(!err) {
			if(user!=null) {
				var newSecret=(new Date().getTime() * Math.random()).toString() + user._id;
				var hash = crypto.createHash('sha256').update(newSecret).digest('hex');
				var encryptToken= crypto.createHash('sha256').update(user._id+hash+global.gConfig.secret).digest('hex');
				var token=new Token({
					token: encryptToken,
					type:"password",
					expires:   new Date( new Date().getTime() + 1800000	)
				});
				token.save(function(err,token) {
					if (err) {
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}else{
						variables={
								name:user.user,
								action_url:global.gConfig.dashboardUrl+"/resetpassword/"+hash
						};
						sparkSender =new SparkPost();
						sparkSender.sendTemplate("reset-password",user.email,variables,function(err,data){
							if(!err){
								res.status(200);
								response={message:"You will recieve an email to reset your password",statusCode:201}
								res.json(response);
							}else{
								es.status(500);
								response={message:err.message,statusCode:500}
								res.json(response);
							}
						});


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
};


function resetPassword(req, res) {
	User.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptHash= crypto.createHash('sha256').update(user._id+req.swagger.params.token.value+global.gConfig.secret).digest('hex');
				Token.findOne({token:encryptHash},function(err,token){
					if (!err){
						if(token){
							if(token.type=="password"){
								if((token.expires.getTime() > new Date().getTime())) {
									if (req.body.password!=req.body.repeatPassword){
										res.status(400);
										response={message:'Passwords do not match',statusCode:400};
										res.json(response);
									}else if (req.body.password.length<4){
											res.status(400);
											response={message:"Password should be at least 4 digits long",statusCode:400};
											res.json(response);
									}else{
										bcrypt.compare(req.body.password, user.password, function(err, doesMatch){
											if (doesMatch){
												res.status(400);
												response={message:"Password should not be the same as the last one",statusCode:400};
												res.json(response);
											}else{
												bcrypt.hash(req.body.password, global.gConfig.salt_rounds, function(err, password) {
													if(!err){
														user.password=password;
														user.valid=new Date();
														user.save(function(err,user) {
															if (!err) {
																res.status(201);
																response={message:"Success",statusCode:200}
																res.json(response);

															}else{
																res.status(500);
																response={message:err.message,statusCode:500}
																res.json(response);
															}
														});
														token.remove(function(err) {
														if(!err) {
											            console.log("token removed")
										    			}
														});
													}
												});
											}
										});

									}
								}else{
									res.status(403);
									response={message:'Token has expired',statusCode:403}
									res.json(response);
								}
							}else{
								res.status(403);
								response={message:'Token has expired',statusCode:403}
							}
						}else{
							res.status(403);
							response={message:'Token is not valid',statusCode:403}
							res.json(response);
						}
					}else{
						res.status(403);
						response={message:'Token is not valid',statusCode:403}
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

function verifyEmail(req, res) {
	User.findOne( {email: req.swagger.params.email.value.toLowerCase()}, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptHash= crypto.createHash('sha256').update(user._id+req.swagger.params.token.value+global.gConfig.secret).digest('hex');
				Token.findOne({token:encryptHash},function(err,token){
					if (!err){
						if(token){
							if(token.type=="verify"){
								if((token.expires.getTime() > new Date().getTime())) {
									user.verfied=true;
									user.save(function(err,user) {
										if (!err) {
											res.status(200);
											response={message:"Success",statusCode:200}
											res.json(response);
										}else{
											res.status(500);
											response={message:err.message,statusCode:500}
											res.json(response);
										}
									});
									token.remove(function(err) {
										if(!err) {
											console.log("token removed")
										}
									});
										
									
								}else{
									res.status(403);
									response={message:'Token has expired',statusCode:403}
									res.json(response);
								}
							}else{
								res.status(403);
								response={message:'Token has expired',statusCode:403}
							}
						}else{
							res.status(403);
							response={message:'Token is not valid',statusCode:403}
							res.json(response);
						}
					}else{
						res.status(403);
						response={message:'Token is not valid',statusCode:403}
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
function setLanguage(req, res) {
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				if (global.gConfig.languages.includes(req.body.language)){
					user.language=req.body.language;
					user.save(function(err,user) {
						if (!err) {
							res.status(200);
							response={message:"Success",statusCode:200}
							res.json(response);
						}else{
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}
					});
				}else{
					res.status(400);
					response={message:"Language not available",statusCode:404}
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
};
function sendVerification(req, res) {
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				if(!user.verfied){
					var newSecret=(new Date().getTime() * Math.random()).toString() + user._id;
					var hash = crypto.createHash('sha256').update(newSecret).digest('hex');
					var encryptToken= crypto.createHash('sha256').update(user._id+hash+global.gConfig.secret).digest('hex');
					var token=new Token({
						token: encryptToken,
						type:"verify",
						expires:   new Date( new Date().getTime() + 1800000)
					});
					token.save(function(err,token) {
						if (err) {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else{
							variables={
									name:user.user,
									action_url:global.gConfig.url+":"+global.gConfig.node_port+"/user/verify/"+user.email+"/"+hash
							};
							sparkSender =new SparkPost();
							sparkSender.sendTemplate("verify-email",user.email,variables,function(err,data){
								if(!err){
									res.status(200);
									response={message:"You will recieve an email to verify your account",statusCode:201}
									res.json(response);
								}else{
									es.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							});


						}
					});
				}else{
					res.status(400);
					response={message:"User email already verified",statusCode:400}
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
};
function saveNotifcationsToken(req,res){
	User.findOne({_id:req.auth.sub}).populate("push").exec(function(err, user) {
		if(!err) {
			if(user!=null) {
				if(user.push!=null){
					res.status(409);
					response={message:"User is already Registered",statusCode:409}
					res.json(response);
				}else{
					push=new Push({
						os:req.body.os,
						token:Crypt.encrypt(req.body.token),
						created:new Date(),
						updated:new Date()
					});
					push.save(function(err,push){
						if(!err){
							user.push=push;
							user.save(function(err,user) {
								if (!err) {
									res.status(200);
									response={message:"Success",statusCode:200}
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

function updateNotifcationsToken(req,res){
	User.findOne({_id:req.auth.sub}).populate("push").exec(function(err, user) {
		if(!err) {
			if(user!=null) {
				if(user.push!=null){
					user.push.os=req.body.os;
					user.push.token=Crypt.encrypt(req.body.token);
					user.push.updated=new Date();
					user.push.save(function(err){
						if(!err){
							res.status(200);
							response={message:"Success",statusCode:200}
							res.json(response);
						}else{
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);	
						}
					})
					
				}else{
					res.status(404);
					response={message:"User not registerd yet",statusCode:404}
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

function unregisterForNotifications(req,res){
	User.findOne({_id:req.auth.sub}).populate("push").exec(function(err, user) {
		if(!err) {
			if(user!=null) {
				if(user.push!=null){
					user.push.remove(function(err){
						if(!err){
							res.status(200);
							response={message:"Deleted",statusCode:200}
							res.json(response);
						}else{
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}
					})
				}else{
					res.status(404);
					response={message:"User not registerd yet",statusCode:404}
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

function newMedicalProfile(req, res) {
	if(validateEmail(req.body.email.toLowerCase())){
		var newSecret=(new Date().getTime() * Math.random()).toString() + req.body.email.toLowerCase();
		var hash = crypto.createHash('sha256').update(newSecret).digest('hex');
		var encryptToken= crypto.createHash('sha256').update(req.body.email.toLowerCase()+hash+global.gConfig.secret).digest('hex');
		
		var token=new Token({
			token: encryptToken,
			type:"medical",
			expires:   new Date( new Date().getTime() + 1800000	)
		});
		token.save(function(err,token) {
			if (err) {
				res.status(500);
				response={message:err.message,statusCode:500}
				res.json(response);
			}else{
				variables={
						action_url:global.gConfig.dashboardUrl+"/signup/"+hash
				};
				sparkSender =new SparkPost();
				sparkSender.sendTemplate("medical-profile",req.body.email,variables,function(err,data){
					if(!err){
						res.status(200);
						response={message:"This email will recive a link to create his profile",statusCode:201}
						res.json(response);
					}else{
						es.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				});


			}
		});
	}else{
		res.status(400);
		response={message:"Wrong email",statusCode:400}
		res.json(response);
	}
}



function newUser(req, res) {
		var validation=true;

		if (!validateEmail(req.body.email)){
			res.status(400);
			res.json({message:req.body.email+" is not a valid email",statusCode:400});
			validation=false;
		}
		if (req.body.password.length<4){
			res.status(400);
			res.json({message:"Password should be at least 4 digits long",statusCode:400});
			validation=false;
		}
		if (req.body.password!=req.body.repeatPassword){

			res.status(400);
			res.json({message:"Passwords do not match",statusCode:400});
			validation=false;
		}
		if(req.body.code!=null){
			if(validation){
				var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
				var encryptHash= crypto.createHash('sha256').update(req.body.email+req.body.code+global.gConfig.secret).digest('hex');
					Token.findOne({token:encryptHash},function(err,token){
						if (!err){
							if(token){
								if(token.type=="medical"){
									if((token.expires.getTime() > new Date().getTime())) {
										saveNewUser(req.body.email.toLowerCase(),req.body.user.toLowerCase(),req.body.password,"profesional",true).then(function (response){
											res.status(response.statusCode);
											res.json(response);
										})
									}else{
										res.status(403);
										response={message:'Token has expired',statusCode:403}
										res.json(response);
									}
								}else{
									res.status(403);
									response={message:'Token is not valid',statusCode:403}
								}
							}else{
								res.status(403);
								response={message:'Token is not valid',statusCode:403}
								res.json(response);
							}
						}else{
							res.status(403);
							response={message:'Token is not valid',statusCode:403}
							res.json(response);
						}
					});
			}
		}else{
			if(req.body.email,validation){
			saveNewUser(req.body.email.toLowerCase(),req.body.user.toLowerCase(),req.body.password,"patient",false).then(function (response){
					res.status(response.statusCode);
					res.json(response);
				})
			}
		}
}



function saveNewUser(email,user,password,role,verfied,language){
	return  new Promise(function(resolve) {
		bcrypt.hash(password, global.gConfig.salt_rounds, function(err, hash) {
			if(!err){
				User.findOne({$or: [{email: email.toLowerCase()}, {user: user.toLowerCase()}]},function(err, userAux) {

					if (err) {
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}else if(!userAux) {
						action="New";
						var userAux = new User({
							user:user.toLowerCase(),
							email:email.toLowerCase(),
							password: hash,
							role: role,
							enabled:true,
							verified:verfied,
							language:language,
							valid:	new Date(),
							created:   new Date(),
							updated:   new Date(),
						});
						userAux.save(function(err,user) {
							if (err) {
								resolve({message:err.message,statusCode:500})
							}else{
								resolve({message:"Success",statusCode:201})
							}
						});
					}else{
						if(user==userAux.user){
							var message="User with this name already exists";
						}else {
							var message="User with this email already exists";
						}
						resolve({message:message,statusCode:409});
					}


				});
			}
		});
	});
}
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
