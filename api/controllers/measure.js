var Measure = require('../models/measure');
var User = require('../models/user');
var Connection = require('../models/connection');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var Kafka =require('../helpers/kafka');
module.exports =  {
	getMeasurementsTypes,
	getMeasurements,
	newMeasure,
	getStatus
}

function getMeasurementsTypes(req,res){
	var measurements=[];
	var types=Measure.getTypes();

	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(let i=0;i<types.length;i++){
			measurements.push({measure:types[i].type,description:types[i].description[langauge]});
		}
		res.status(200);
		response={message:"Success",statusCode:200,measurements:measurements}
		res.json(response);
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}
function getMeasurements(req,res){
	days=req.swagger.params.days.value
	measure=req.swagger.params.measure.value
	if(Measure.isValidType(req.swagger.params.measure.value)){

		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					User.findOne({"user":req.swagger.params.user.value.toLowerCase()}, function(err, patient) {
						if(!err){
							if(patient!=null && patient.role=="patient"){
								if(req.auth.role=="admin" || (patient.user==user.user)){
									retrieveMeasurements(patient,measure,days).then(function (response){
										res.status(response.statusCode);
										res.json(response);
									})
								}else if(req.auth.role=="profesional"){
									Connection.findOne({patient:patient, profesional:user},function(err,connection){
										if(!err){
											if(connection!=null){
												retrieveMeasurements(patient,measure,days).then(function (response){
													res.status(response.statusCode);
													res.json(response);
												})
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
								}
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

function retrieveMeasurements(patient,measure,days){
	
	return  new Promise(function(resolve) {
		var filterDate= new Date();
		filterDate.setDate(filterDate.getDate() - days );
		var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
		var query={user:encryptId, type:measure,created:{$gte:filterDate}};
		Measure.find(query).select('-user').sort('-created').exec(function(err, measurements){
			if(!err){
					resolve({message:"success",statusCode:200,measurements:measurements});
				
			}else{
				resolve({message:err.message,statusCode:500})
			}
		});
	})
}
function getStatus(req,res){
	

		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					User.findOne({"user":req.swagger.params.user.value.toLowerCase()}, function(err, patient) {
						if(!err){
							if(patient!=null && patient.role=="patient"){
								if(req.auth.role=="admin" || (patient.user==user.user)){
									retrieveStatus(patient).then(function (response){
										res.status(200);
										response={message:"Success",statusCode:200,measurements:response}
										res.json(response);
									})
								}else if(req.auth.role=="profesional"){
									Connection.findOne({patient:patient, profesional:user},function(err,connection){
										if(!err){
											if(connection!=null){
												retrieveStatus(patient).then(function (response){
													res.status(200);
													response={message:"Success",statusCode:200,measurements:response}
													res.json(response);
												})
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
								}
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

function retrieveStatus(patient){
	
	return  new Promise(function(resolve) {
		var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
		measurements=[];
		Measure.aggregate([
			{"$sort":{"created":1}},
			{"$match":{"user":encryptId}},
			{ "$group":{"_id":"$type","result": { "$last": "$$ROOT" }}}
		])
		.exec(function(err,data){
			for(i=0;i<data.length;i++){
				delete(data[i].result._id);
				delete(data[i].result.user);
				measurements.push(data[i].result);
			}
			resolve(measurements)
		})
	})
}
function newMeasure(req,res){
	if(Measure.isValidType(req.body.type)){
		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					if(req.auth.role=="patient"){
						var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
						var measure = new Measure({
							user:encryptId,
							type:req.body.type,
							value:req.body.value,
							created:req.body.timestamp?new Date((req.body.timestamp*1000)) :  new Date()
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
								Kafka.sendKafkaMessageDAM(req.app.get('producer'),user._id,encryptId,user.user)
							}
						});
					}else{
						if(req.body.user!=null){
							User.findOne({user: req.body.user.toLowerCase()}, function(err, patient) {
								if(!err){
									if(patient!=null){
										Connection.findOne({patient:patient, profesional:user},function(err,connection){
											if(!err){
												if(connection!=null){
													var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
													var measure = new Measure({
														user:encryptId,
														type:req.body.type,
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
							res.status(404);
							response={message:"User not found",statusCode:404}
							res.json(response);
						}
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

		
	}else{
		res.status(400);
		response={message:"Measure type not valid",statusCode:400}
		res.json(response);
	}
}


