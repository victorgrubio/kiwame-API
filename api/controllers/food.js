var uuid = require('uuid');
var fs = require('fs');
var path = require('path')
var User = require('../models/user');
var Food = require('../models/food');
var Ingredient = require('../models/ingredient');
var Profile = require('../models/profile');
var Connection = require('../models/connection');
var Message = require('../models/message');
var Config=require('../helpers/config.js');
var crypto =require('crypto');
var Crypt = require('../helpers/crypt');
var Jimp = require('jimp');
var Kafka = require('../helpers/kafka');
var Diary =require('../models/diary')
var Eat =require('../models/eat')
var Nutrient =require('../models/nutrient')
module.exports =	{
	newFood,
	getFoods,
	getFoodImage,
	getNutrientTypes,
	getNutrients,
	getFoodById,
	getUntranslatedFoods,
	newFoodName,
	updateFoodName,
	getFoodName,
	getFoodImageSize,
	verifyFood,
	getUnverifiedFoods


}

function getNutrientTypes(req,res){
	var nutrients=[];
	var types=Nutrient.getNutrientTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			nutrients.push({nutrient:types[i].type,description:types[i].description[langauge]});
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
function newFood(req, res) {
	User.findById(req.auth.sub, function(err, user) {
	 if(!err) {
		if(user!=null) {
			var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
			var eat = new Eat({
				user:encryptId,
				recognised:false,
				verified:false,
				created:new Date()
			});
			eat.save(function(err,eat) {
				if (err) {
					res.status(500);
					response={message:err.message,statusCode:500}
					res.json(response);
				}else{	
					Jimp.read(req.files.image.file, (err, image) => {
						if (err){
							res.status(500);
							response={message:err.message,statusCode:500}
							res.json(response);
						}else{	
							console.log("WRITING IMAGE")
							image
							.write(global.gConfig.images_path+"/"+eat._id+".jpg"); // save
							image
							.resize(512, 512) // resize
							.write(global.gConfig.images_path+"/"+eat._id+"_big.jpg"); // save
							image
							.resize(256, 256) // resize
							.write(global.gConfig.images_path+"/"+eat._id+"_small.jpg");
							res.status(201);
							response={message:'Image succesfully uploaded',statusCode:201,"food_id":eat._id}
							res.json(response);
							try{
								Kafka.sendKafkaMessageCVM(req.app.get('producer'),global.gConfig.images_url+"/"+eat._id,user._id);	
							}catch(err){
								console.log(err)
							}
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
	})
}

function getUnverifiedFoods(req,res){
	Eat.find({verified:false,recognised:true}).select("-user").sort("-created").populate({ 
		path: 'food',
		populate: [{
			path: 'ingredients',
			model: 'Ingredient',
			select: '-_id '
			},{
			path: 'composition',
			model: 'Nutrient',
			select: '-_id '
		}]
	}).exec(function(err,eats){
		if(!err) {
			res.status(200);
			response={message:'Sucess',statusCode:200,foods:eats}
			res.json(response);
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function getFoods(req, res) {

	var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
	User.findById(req.auth.sub, function(err, user) {
	 if(!err) {
		if(user!=null) {
			var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
			var pag=0
			if(req.swagger.params.next.value){
				pag=req.swagger.params.next.value
			}
			Eat.countDocuments({user:encryptId},function(err,count){
				if(!err){
					skip=global.gConfig.limit*pag;
					limit=global.gConfig.limit;
					Eat.find({user:encryptId}).select("-user").skip(skip).limit(limit).sort("-created").populate({ 
					path: 'food',
					select: '-name',
					populate: [{
						path: 'ingredients',
						model: 'Ingredient',
						select: '-_id '
						},{
						path: 'composition',
						model: 'Nutrient',
						select: '-_id '
					}]}).lean().exec(function(err,eats){
						if(!err) {
							for (i=0;i<eats.length;i++){
								if(eats[i].food && eats[i].food.ingredients){
									eats[i].image_url=global.gConfig.images_url+"/"+eats[i]._id;
									for (j=0;j<eats[i].food.ingredients.length;j++){
										var language= user.language || language;
										if(eats[i].food.ingredients[j].name[language]){
											eats[i].food.ingredients[j].name=eats[i].food.ingredients[j].name[language];
										}else if(eats[i].food.ingredients[j].name[global.gConfig.languages[0]]){
											eats[i].food.ingredients[j].name=eats[i].food.ingredients[j].name[global.gConfig.languages[0]];
										}
									}
								}
							}
							res.status(200);
							if(count>global.gConfig.limit*(pag+1)){
								response={message:'Sucess',statusCode:200,foods:eats,next:"/food/history/"+user.user+"?next="+(pag+1)};	
							
							}else{
								response={message:'Sucess',statusCode:200,foods:eats};
							}
							res.json(response);
							
						}else{
							console.log(err);
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
			res.status(404);
			response={message:"User not found",statusCode:404}
			res.json(response);
		}
	 }else{
		res.status(500);
		response={message:err.message,statusCode:500}
		res.json(response);
	 }
	})
}


function getUntranslatedFoods(req, res) {
		Food.find({ $or:[ {"name.en":""}, {"name.es":""}]}).select("_id name").exec(function(err, foods) {
		if(!err) {
			
			res.status(200);
			response={message:"Success",statusCode:200,foods:foods}
			res.json(response);
			

		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});

}
function getFoodById(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err){
			if(user!=null){
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				var query={_id:req.swagger.params.id.value}
				if(req.auth.role=="patient"){
					query.user=encryptId;
				}
				
				Eat.findOne(query).populate({
					path: 'food',
					select: '-name -user',
					populate: [{
						path: 'ingredients',
						model: 'Ingredient',
						select: '-_id '
						},{
						path: 'composition',
						model: 'Nutrient',
						select: '-_id '
				}]})
				.lean().exec(function(err,eat){
					if(!err) {
						if(eat){
							res.status(200);
							if(eat.food && eat.food.ingredients){
								for (j=0;j<eat.food.ingredients.length;j++){
									if(eat.food.ingredients[j].name[user.language]){
										eat.food.ingredients[j].name=eat.food.ingredients[j].name[user.language];
									}else if(eat.food.ingredients[j].name[global.gConfig.languages[0]]){
										eat.food.ingredients[j].name=eat.food.ingredients[j].name[global.gConfig.languages[0]];
									}
										
								}
							}
							response={message:"Success",statusCode:200,food:eat}
							res.json(response);

						}else{
							res.status(404);
							response={message:"Food not found",statusCode:404}
							res.json(response);
						}
					}else{
						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				})
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

function verifyFood(req,res){
	User.findById(req.auth.sub, function(err, user) {
		if(!err){
			if(user!=null){
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				Eat.findById(req.swagger.params.id.value,function(err,eat){
					if(!err) {
						if(eat){
							eat.verified=true;
							eat.save(function(err){
								if(!err){
									res.status(200);
									response={message:"Success",statusCode:200}
									res.json(response);
								}else{
									console.log(err)
									res.status(500);
									response={message:err.message,statusCode:500}
									res.json(response);
								}
							})
						}else{
							res.status(404);
							response={message:"Food not found",statusCode:404}
							res.json(response);
						}
					}else{

						res.status(500);
						response={message:err.message,statusCode:500}
						res.json(response);
					}
				})
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
function getFoodImage(req,res){
	imageName= req.swagger.params.image.value.toLowerCase();
	if(req.auth.key!=null || req.auth.role=="admin"){
		res.sendFile(global.gConfig.images_path+"/"+imageName+".jpg",{ root: "." });
	}else{
		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					Eat.findOne({user:encryptId,_id:imageName},function(err,eat){
						if(!err) {
							if(eat){
								res.sendFile(global.gConfig.images_path+"/"+imageName+".jpg",{ root: "." });
							}else{
								res.status(404);
								response={message:"Image not found",statusCode:404}
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
}
function getFoodImageSize(req,res){
	imageName= req.swagger.params.image.value.toLowerCase();
	size= req.swagger.params.size.value.toLowerCase();
	sufix="";
	if(size=="big"){
		sufix="_big"
	}else if(size="small"){
		sufix="_small"
	}

	if(req.auth.key!=null || req.auth.role=="admin"){
		res.sendFile(global.gConfig.images_path+"/"+imageName+sufix+".jpg",{ root: "." });
	}else{
		User.findById(req.auth.sub, function(err, user) {
			if(!err){
				if(user!=null){
					var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
					Eat.findOne({user:encryptId,_id:imageName},function(err,eat){
						if(!err) {
							if(eat){
								res.sendFile(global.gConfig.images_path+"/"+imageName+".jpg",{ root: "." });
							}else{
								res.status(404);
								response={message:"Image not found",statusCode:404}
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
function newFoodName(req,res){
	query=[]
	keys = Object.keys(req.body.name)
	for(i=0;i<keys.length;i++){
			if(req.body.name[keys[i]]!=""){
				stringObject="{\"name."+keys[i]+"\":\""+req.body.name[keys[i]]+"\"}";
				query.push(JSON.parse(stringObject));
			}
	}
	Food.findOne({$or:query}, function(err, food) {
		if(!err) {
			if(food) {
				res.status(409);
				response={message:"Food already exists",statusCode:409}
				res.json(response);
			}else{
				var food = new Food({
					created: new Date(),
					updated: new Date()
				});
					food.name={};
					keys = Object.keys(req.body.name)
					for(i=0;i<keys.length;i++){
						food.name[keys[i]]=req.body.name[keys[i]]
					}
				food.save(function(err,item) {
					if(!err) {
						res.status(201);
						response={message:"Success",statusCode:201,food:food}
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

function updateFoodName(req,res){
	Food.findOne({_id:req.swagger.params.id.value},function(err, food) {
		if(!err) {
			if (food!=null){
				food.name=JSON.stringify(req.body.name);
				keys = Object.keys(req.body.name)
				for(i=0;i<keys.length;i++){
					console.log(food.name[keys[i]]);
					food.name[keys[i]]=req.body.name[keys[i]];
				}
			
				food.save(function(err){
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
				response={message:"Food not Found",statusCode:404}
				res.json(response);
			}
			
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}

	}); 
}

function getFoodName(req,res){
Food.findById(req.swagger.params.id.value).populate("composition ingredients").exec(function(err, food) {
		if(!err) {
			if (food!=null){
				
				res.status(200);
				response={message:"Success",statusCode:200,food:food}
				res.json(response);
			}else{
				res.status(404);
				response={message:"food not Found",statusCode:404}
				res.json(response);
			}
			
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}

	}); 
}
