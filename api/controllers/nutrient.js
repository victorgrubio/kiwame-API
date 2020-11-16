var User = require('../models/user');
var Connection = require('../models/connection');
var Config=require('../helpers/config.js');
var crypto =require('crypto');
var Crypt = require('../helpers/crypt');
var Diary =require('../models/diary')
var Nutrient =require('../models/nutrient')
module.exports =	{

	getNutrientTypes,
	getNutrients


}

function getNutrientTypes(req,res){
	var nutrients=[];
	var types=Nutrient.getNutrientTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			nutrients.push({nutrient:types[i].type,description:types[i].description[langauge],key:types[i].key});
		}
		res.status(200);
		response={message:"Success",statusCode:200,nutrients:nutrients}
		res.json(response);
 
	}catch(error) {
		res.status(500);
		response={message:error.message,statusCode:500}
		res.json(response);
	}
}
function getNutrients(req,res){ //recuperar los nutrientes de los n dias anteriores
	days=req.swagger.params.days.value
		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					User.findOne({"user":req.swagger.params.user.value.toLowerCase()}, function(err, patient) {
						if(!err){
							if(patient!=null && patient.role=="patient"){
								if(req.auth.role=="admin" || (patient.user==user.user)){
									retrieveNutrients(patient,days).then(function (response){
										res.status(response.statusCode);
										res.json(response);
									})
								}else if(req.auth.role=="profesional"){
									Connection.findOne({patient:patient, profesional:user},function(err,connection){
										if(!err){
											if(connection!=null){
												retrieveNutrients(patient,days).then(function (response){
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

}

function retrieveNutrients(patient,days){
	
	return  new Promise(function(resolve) {
		var filterDate= new Date();
		filterDate.setDate(filterDate.getDate() - days );
		var encryptId= crypto.createHash('sha256').update(patient._id+global.gConfig.secret).digest('hex');
		var query={user:encryptId,created:{$gte:filterDate}};
		Diary.find(query).select('-user').populate("nutrients").sort('-created').exec(function(err, historic){
			if(!err){
				resolve({message:"success",statusCode:200,historic:historic});
				
			}else{
				resolve({message:err.message,statusCode:500})
			}
		});
	})
}




