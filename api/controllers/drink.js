var User = require('../models/user');
var Drink = require('../models/drink');
var crypto =require('crypto');
var Crypt =require('../helpers/crypt');
var Kafka = require('../helpers/kafka');

module.exports =  {
	getDrinkTypes,
	newDrink,
	getDrinks
}



function getDrinkTypes(req,res){
	var drinksTypes=[];
	var types=Drink.getDrinkTypes();
	try {
		var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];
		for(i=0;i<types.length;i++){
			drinksTypes.push({type:types[i].type,name:types[i].name[langauge],nutrients:types[i].nutrients});
		}
		res.status(200);
		response={message:"Success",statusCode:200,drinks:drinksTypes}
		res.json(response);
 
	}catch(err) {
		res.status(500);
		response={message:err.message,statusCode:500}
		res.json(response);
	}
}


function newDrink(req, res) {
	if(Drink.isValidDrinkType(req.body.type)){
		User.findById(req.auth.sub, function(err, user) {
		 if(!err) {
			if(user!=null) {
				var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
				var drink = new Drink({
					user:encryptId,
					volume:req.body.volume,
					type:req.body.type,
					created:new Date()
				});
				drink.save(function(err,drink) {
				if (err) {
					res.status(500);
					response={message:err.message,statusCode:500}
					res.json(response);
				 }else{
					Kafka.sendKafkaMessageDAM(req.app.get('producer'),user._id,encryptId,user.user)
					res.status(201);
					response={message:'Drink saved',statusCode:201}
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
		})
	}else{
		res.status(400);
		response={message:"Drink type is not valid",statusCode:400}
		res.json(response);
	}
}

function getDrinks(req, res) {
	var	langauge=global.gConfig.languages.includes(req.headers['accept-language'] && req.headers['accept-language'].substring(0,2).toLowerCase())?req.headers['accept-language'].substring(0,2):global.gConfig.languages[0];

	User.findById(req.auth.sub, function(err, user) {
	 if(!err) {
		if(user!=null) {
			var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
			var pag=0
			if(req.swagger.params.next.value){
				pag=req.swagger.params.next.value
				
			}
			Drink.countDocuments({user:encryptId},function(err,count){
				if(!err){
					skip=global.gConfig.limit*pag
					limit=global.gConfig.limit
					Drink.find({user:encryptId}).skip(skip).limit(limit).select("-user").sort([['created', -1]]).exec(function(err,results){
						if(!err) {
							drinks=[]
							results.forEach(function (data) {
								var drink={}
								if(Drink.isValidDrinkType(data.type)) {
									drink._id=data._id;
									drink.created=data.created;
									drink.volume=data.volume;
									drink.type=JSON.parse(JSON.stringify(Drink.getDrinkType(data.type)));
									drink.type.name=drink.type.name[user.language];
									drinks.push(drink);
								}
							});
							
							res.status(200);
							if(count>global.gConfig.limit*(pag+1)){
								response={message:'Sucess',statusCode:200,drinks:drinks,next:"/drinks/history/"+user.user+"?next="+(pag+1)};	
							}else{
								response={message:'Sucess',statusCode:200,drinks:drinks};
							}
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