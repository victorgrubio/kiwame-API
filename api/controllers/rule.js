

var Rule = require('../models/rule.js');
var Notification = require('../models/notification.js');
var User = require('../models/user.js');
var Connection  = require('../models/connection.js');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var Measure = require('../models/measure');
var Nutrient  = require('../models/nutrient');
module.exports =  {
	findById,
	newRule,
	toogleEnabled,
	deleteRule,
	countRules,
	findAll,
	getRuleTypes,
	getConditionTypes,
	defaultRules
}
function getConditionTypes(req,res){
	var conditions=[];
	var types=Rule.getConditionTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			conditions.push({type:types[i].type,description:types[i].description});
		}
		res.status(200);
		response={message:"Success",statusCode:200,conditions:conditions}
		res.json(response);
 
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}

function getRuleTypes(req,res){
	var rules=[];
	var types=Rule.getRuleTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			rules.push({type:types[i].type,name:types[i].name[langauge],description:types[i].description[langauge]});
		}
		res.status(200);
		response={message:"Success",statusCode:200,rules:rules}
		res.json(response);
 
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}

function findById(req, res) {

	if(req.auth.role=="admin"){
		var query={$and: [{_id:req.swagger.params.id.value},{profesional: {$exists: false}}]};
	}else{
		var encryptId= crypto.createHash('sha256').update(req.auth.sub+global.gConfig.secret).digest('hex');
		var query={$and: [{_id:req.swagger.params.id.value},{"profesional":encryptId}]};
	}
	Rule.findOne(query).select("-profesional").exec(function(err, rule) {
		if(!err) {
			if(rule) {
				if(rule.patient!=null){
					rule.patient=Crypt.decrypt(rule.patient)
				}
				
				res.status(200);
				response={message:"Success",statusCode:200,rule:rule}
				res.json(response);
			}else{
				res.status(404);
				response={message:"Rule not found",statusCode:404}
				res.json(response);
			}
		}else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
			
}
	



function newRule(req, res) {
	if( Rule.isValid(req.body.notificationType,req.body.condition,req.body.type)){
		if( Notification.isValidType(req.body.notificationType) ){
			if(req.body.patient){
				User.findOne({user: req.body.patient.toLowerCase()}, function(err, patient) {
					if(!err){

						if(patient!=null){

							Connection.findOne({patient:patient, profesional:req.auth.sub},function(err,connection){
								if(!err){
									if(connection!=null && Notification.isValidType(req.body.notificationType)){
										saveRule(req.body,patient,res,req.auth.sub)
										
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
							response={message:"User not found",statusCode:404}
							res.json(response);
						}
					}
				});

			}else if(req.auth.role=="admin"){
				saveRule(req.body,null,res,null)

			}
		}else{
			res.status(400);
			response={message:"Request validation failed: Invalid Notification Type",statusCode:400}
			res.json(response);
		}
	}else{
			res.status(400);
			response={message:"Invalid notification type for rule and condition",statusCode:400}
			res.json(response);
		
	}
}

function saveRule(body,patient,res,profesional){
	var rule = new Rule({
		type:body.type,
		condition:body.condition,
		value:body.value,
		period:body.period?body.period:1,
		created:new Date(),
		updated:new Date(),
		notificationType:body.notificationType,
		enabled:true
	});
	var badRequest=false;
	if(patient){
		rule.patient=Crypt.encrypt(patient.user)
	}

	if(profesional){
		rule.profesional= crypto.createHash('sha256').update(profesional+global.gConfig.secret).digest('hex');

	}
	if(body.type==2){
		if(body.measureType!=null && Measure.isValidType(body.measureType)){

			rule.measureType=body.measureType;
		}else{

			badRequest=true
			res.status(400);
			res.json({message:"Request validation failed: invalid measureType",statusCode:400})
			validation=false;
		}
	}else if(body.type==3){
		if(body.nutrientType!=null && Nutrient.isValidNutrienType(body.nutrientType)){
			rule.nutrientType=body.nutrientType;
		}else{
			badRequest=true
			res.status(400);
			res.json({message:"Request validation failed: invalid nutrientType",statusCode:400})
			validation=false;
		}
	}

	if (!badRequest){
		rule.save(function(err,rule){
			if(!err){
				res.status(201);
				response={message:"Success",statusCode:201}
				res.json(response);
			}
		})
	}
	
}


function toogleEnabled(req, res) {

	if(req.auth.role=="admin"){
		var query={$and: [{_id:req.swagger.params.id.value},{profesional: {$exists: false}}]};
	}else{
		var encryptId= crypto.createHash('sha256').update(req.auth.sub+global.gConfig.secret).digest('hex');
		var query={$and: [{_id:req.swagger.params.id.value},{"profesional":encryptId}]};
	}
	Rule.findOne(query, function(err, rule) {
		if(!err) {
			if(rule) {
				rule.enabled=!rule.enabled;
				rule.updated=new Date();
				rule.save(function(err,item) {
					if(!err) {
						res.status(200);
						response={message:"Rule enabled:"+item.enabled,statusCode:200}
						res.json(response);
					}else {
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				});
			}else{
				res.status(404);
				response={message:"Rule not found",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
			

}
	
function deleteRule(req, res) {

	if(req.auth.role=="admin"){
		var query={$and: [{_id:req.swagger.params.id.value},{profesional: {$exists: false}}]};
	}else{
		var encryptId= crypto.createHash('sha256').update(req.auth.sub+global.gConfig.secret).digest('hex');
		var query={$and: [{_id:req.swagger.params.id.value},{"profesional":encryptId}]};
	}
	Rule.findOneAndDelete(query,function (err,rule) {
		if (!err){
			if(rule!=null){
				res.status(200);
				response={message:"Removed succsefuly",statusCode:200}
				res.json(response);
			}else{
				res.status(404);
				response={message:"Rule does not  exists",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}
function findAll (req, res) {

	
	 if(req.auth.role=="patient"){
		var query={};
		User.findById(req.auth.sub, function(err, user) {
			if(!err) {
				if(user!=null) {
					Rule.find(query).exec(function(err, rules) {
						var patientRules=[];
						if(!err) {
							for(i=0;i<rules.length;i++){
								if(rules[i].patient!=null){
									rules[i].patient=Crypt.decrypt(rules[i].patient)
									if (rules[i].patient==user.user){
										rule={
											_id: rules[i]._id,
											type: rules[i].type,
											condition: rules[i].condition,
											value: rules[i].value,
											period: rules[i].period,
											created: rules[i].created,
											updated: rules[i].updated,
											notificationType: rules[i].notificationType,
											enabled: rules[i].enabled
										}
										if(rules[i].measureType){
											rule.measureType=rules[i].measureType
										}
										if(rules[i].nutrientType){
											rule.nutrientType=rules[i].nutrientType
										}
										patientRules.push(rule);
									}
								}else if(rules[i].profesional==null){
									patientRules.push(rules[i]);
								}
							}
							res.status(200);
							response={message:"Success",statusCode:200,rules:patientRules}
							res.json(response);
						} else {
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}
					});
				}else{
					res.status(404);
					response={message:"user not found",statusCode:404}
					res.json(response);

				}
			}else{
				res.status(500);
				response={message:err.message,statusCode:500}
				res.json(response);
			}
		})
	}else{
		if(req.auth.role=="admin"){
			var query={profesional: {$exists: false}};
		}else if (req.auth.role=="profesional"){
			var encryptId= crypto.createHash('sha256').update(req.auth.sub+global.gConfig.secret).digest('hex');
			var query={$or:[{profesional: {$exists: false}},{"profesional":encryptId}]};
		}
		Rule.find(query).select("-profesional").exec(function(err, rules) {
			var patientRules=[];
			if(!err) {
				for(i=0;i<rules.length;i++){
					if(rules[i].patient!=null){
						rules[i].patient=Crypt.decrypt(rules[i].patient);
					}
					
				}
				res.status(200);
				response={message:"Success",statusCode:200,rules:rules}
				res.json(response);
			} else {
				res.status(500);
				response={message:err.message,statusCode:500}
				res.json(response);
			}
		});
	}
	
	
}

function defaultRules(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err) {
			if(user!=null) {
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				var query={user:encryptId, type:1};
				Rule.find({}).exec(function(err, rules) {
					var found=false;
					for(i=0;i<rules.length;i++){
						
						if(rules[i].patient!=null){
							rules[i].patient=Crypt.decrypt(rules[i].patient);
							if (rules[i].patient==user.user){
								var found=true;
							}
						}
					}
					if(found){
						res.status(400);
						response={message:"This user has already set some rules ",statusCode:400}
						res.json(response);
						
					}else{
						Measure.find(query).sort('-created').exec(function(err, weight){
							if(!err){
								if(weight.length>0){
									query={user:encryptId, type:4};
									Measure.find(query).sort('-created').exec(function(err, height){
										if(!err){
											if(height.length>0){
												try{
													var rules=[];
													var IMC= weight[0]*100/height[0];
													var calories;
													if (IMC>20.9 && IMC <25){
														calories=2000;
													}else if(IMC>30 && IMC <30.9){
														calories=1500;
													}else if( IMC >40){
														calories=1000;
													}else{
														calories=false;
													}
													var patient=Crypt.encrypt(user.user);
														if(calories){
															var caloriesRule = new Rule({
																patient:patient,
																type:3,
																condition:4,
																nutrientType:16,
																value:calories,
																period:1,
																created:new Date(),
																updated:new Date(),
																notificationType:7,
																enabled:true
															});
															rules.push(caloriesRule);
														}
														var sodiumRule = new Rule({
															patient:patient,
															type:3,
															condition:4,
															nutrientType:4,
															value:2,
															period:1,
															created:new Date(),
															updated:new Date(),
															notificationType:7,
															enabled:true
														});
														rules.push(sodiumRule);
														var stepsRule = new Rule({
															patient:patient,
															type:2,
															condition:1,
															measureType:101,
															value:1500,
															period:1,
															created:new Date(),
															updated:new Date(),
															notificationType:9,
															enabled:true
														});
														rules.push(stepsRule);

														Rule.insertMany(rules).then((docs) => {
																res.status(200);
																response={message:docs.length+" default rules created",statusCode:200}
																res.json(response);
														}).catch((err) => {
																res.status(500);
																response={message:err.message,statusCode:500}
																res.json(response);
														})

												//rule sodium <2g al dia
												}catch(e){
													res.status(404);
													response={message:"IMC can not be calculated, check the height and weght",statusCode:404}
													res.json(response);
												}
												

											}else{
												res.status(404);
												response={message:"Height not found",statusCode:404}
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
									response={message:"Weight not found",statusCode:404}
									res.json(response);
								}
								
							}else{
								res.status(500);
								response={message:err.message,statusCode:500}
								res.json(response);
							}
						});
					}
				});

				
			}else{
					res.status(404);
					response={message:"user not found",statusCode:404}
					res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	})

}
function countRules (req, res) {

	if(req.auth.role=="admin"){
		var query={profesional: {$exists: false}};
	}else{
		var encryptId= crypto.createHash('sha256').update(req.auth.sub+global.gConfig.secret).digest('hex');
		var query={$and: [{_id:req.swagger.params.id.value},{"profesional":encryptId}]};
	}
	Rule.find(query,function(err, rules) {
		if(!err) {
			res.status(200);
			response={message:"Success",statusCode:200,count:rules.length}
			res.json(response);
		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}