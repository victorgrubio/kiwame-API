var User = require('../models/user');
var Config=require('../helpers/config.js');
var Ingredient=require('../models/ingredient');
module.exports =	{
	newIngredient,
	getIngredients,
	getIngredient,
	updateIngredient,
	deleteIngredient,
	getUntranslatedIngredients

}
function newIngredient(req,res){
	query=[]
	keys = Object.keys(req.body.name)
	for(i=0;i<keys.length;i++){
		if(req.body.name[keys[i]]!=""){
			stringObject="{\"name."+keys[i]+"\":\""+req.body.name[keys[i]]+"\"}";
			query.push(JSON.parse(stringObject));
		}
	}
	Ingredient.findOne({$or:query}, function(err, ingredient) {
		if(!err) {
			if(ingredient) {
				res.status(409);
				response={message:"Ingredient already exists",statusCode:409}
				res.json(response);
			}else{
				var ingredient = new Ingredient({
					name:req.body.name,
					created: new Date(),
					updated: new Date()
				});
				ingredient.save(function(err,item) {
					if(!err) {
						res.status(201);
						response={message:"Success",statusCode:201,ingredient:item}
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
function getIngredients(req,res){
	ingredientsResponse=[]
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		Ingredient.find({},function(err, ingredients) {
		if(!err) {
			for(i=0;i<ingredients.length;i++){
				ingredientsResponse.push({
					id:ingredients[i]._id,
					name:ingredients[i].name[langauge]
				});
			}
			res.status(200);
			response={message:"Success",statusCode:200,ingredients:ingredientsResponse}
			res.json(response);
			

		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}
function getUntranslatedIngredients(req,res){
	ingredientsResponse=[]
		Ingredient.find({ $or:[ {"name.en":""}, {"name.es":""}]},function(err, ingredients) {
		if(!err) {
			
			res.status(200);
			response={message:"Success",statusCode:200,ingredients:ingredients}
			res.json(response);
			

		} else {
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}

function getIngredient(req,res){
	Ingredient.findById(req.swagger.params.id.value,function(err, ingredient) {
		if(!err) {
			if (ingredient!=null){
				ingredientResponse={
					id:ingredient._id,
					name:ingredient.name
				};
				res.status(200);
				response={message:"Success",statusCode:200,ingredient:ingredientResponse}
				res.json(response);
			}else{
				res.status(404);
				response={message:"ingredient not Found",statusCode:404}
				res.json(response);
			}
			
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}

	}); 
}

function updateIngredient(req,res){
	Ingredient.findOne({_id:req.swagger.params.id.value},function(err, ingredient) {
		if(!err) {
			if (ingredient!=null){
				ingredient.name=JSON.stringify(req.body.name);
				keys = Object.keys(req.body.name)
				for(i=0;i<keys.length;i++){
					ingredient.name[keys[i]]=req.body.name[keys[i]];
				}
				ingredient.save(function(err){
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
				response={message:"ingredient not Found",statusCode:404}
				res.json(response);
			}
			
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}

	}); 
}
function deleteIngredient(req,res){
	Ingredient.findOneAndDelete({_id:req.swagger.params.id.value},function (err,ingredient) {
		if (!err){
			if(ingredient!=null){
				res.status(200);
				response={message:"Removed succsefuly",statusCode:200}
				res.json(response);
			}else{
				res.status(404);
				response={message:"Ingredient does not  exists",statusCode:404}
				res.json(response);
			}
		}else{
			res.status(500);
			response={message:err.message,statusCode:500}
			res.json(response);
		}
	});
}