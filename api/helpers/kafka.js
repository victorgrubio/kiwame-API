var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var ConsumerGroup =  kafka.ConsumerGroup;
var Measure = require('../models/measure');
var Drink = require('../models/drink');
var Food =require("../models/food");
var Profile =require("../models/profile");
var crypto =require('crypto');
var Connection =require('../models/connection');
var Crypt =require('../helpers/crypt');
var User  =require('../models/user');
var Eat  =require('../models/eat');
var Nutrient  =require('../models/nutrient');
var Ingredient =require("../models/ingredient");
var Rule =require("../models/rule");
var Diary =require("../models/diary");
var Push =require("../models/push");
var Notification=require("../models/notification")
var Firebase = require("../helpers/firebase");

module.exports ={
	start,
	sendKafkaMessageCVM,
	sendKafkaMessageDAM
}

var producer;

function start(broker,time, topicsConsumer){
	var client = new kafka.KafkaClient({kafkaHost:broker});

	producer = new Producer(client, { requireAcks: 1 });
	producer.on('ready', function () {
		console.log("Kafka producer ready");

	});



	producer.on('error', function (err) {
		console.log('error', err);
	});


	var consumerOptions = {
		kafkaHost: broker,
		groupId: 'group1',
		sessionTimeout: 15000,
		protocol: ['roundrobin'],
		fromOffset: 'latest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
	};

	var consumerGroup = new ConsumerGroup(consumerOptions, topicsConsumer);
	consumerGroup.on('error', onError);
	consumerGroup.on('message', onMessage);
	return producer;

}

function onError (error) {
	console.error(error);
	console.error(error.stack);
}


function onMessage (message) {
	try{
		composition=[]
		if(message.topic=="ingredients"){
			var data=JSON.parse(message.value);
			if(data.uuid!=null){
				uuid= Crypt.decrypt(data.uuid).split("\"").join("")
				User.findById(uuid,function(err,user){
					if(!err && user!=null){
						eatId=data.image.split("/").slice(-1)[0];
						Eat.findById(eatId,function(err,eat){
							var promises=[]
							retrieveFood(data.foods[0],data.ingredients[0]).then(function(response){
								eat.food=response.food;
								eat.recognised=true;
								eat.volume=data.volumes[0];
								eat.save(function(err){
									if (!err){
										var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
										sendKafkaMessageDAM(producer,user._id,encryptId,user.user)
									}
								});
							})
						});
					}
				})
			}

		}
		if(message.topic=="recommendations"){
			var data=JSON.parse(message.value);
			if(data.uuid!=null){
				uuid= Crypt.decrypt(data.uuid).split("\"").join("")
				User.findById(uuid).populate("push").exec(function(err,user){
					if(!err && user!=null){
						var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
						if(data.renal_metrics){
							
							saveMeasurement(encryptId,97,data.renal_metrics.analysis.cockcroft_gault);
							saveMeasurement(encryptId,98,data.renal_metrics.analysis.ckd_epi);
							saveMeasurement(encryptId,99,data.renal_metrics.analysis.mdrd_4)
							saveMeasurement(encryptId,100,data.renal_metrics.analysis.bmi);
						}
						//update Nutrients Diary
						var today = new Date(); 
						today. setHours(0,0,0,0); 
						if(data.nutrients_summary.nutrient_analysis.daily_nutrients.length>0){
							Diary.findOne({user:encryptId,created:{$gte:today}}).populate("nutrients").exec(function(err,diary){
								if(!err){
									if(diary==null){
										nutrients = new Nutrient(data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients);
										nutrients.save(function(err, newNutrients){
											diary = new Diary({
												created:new Date(),
												user:encryptId,
												nutrients:newNutrients
											})
											diary.save();
										})
									}else{
										nutrientsId=diary._id;
										diary.nutrients.calories=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.calories;
										diary.nutrients.total_fat=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.total_fat;
										diary.nutrients.saturated_fat=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.saturated_fat;
										diary.nutrients.cholesterol=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.cholesterol;
										diary.nutrients.sodium=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.sodium;
										diary.nutrients.total_carbohydrate=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.total_carbohydrate;
										diary.nutrients.dietary_fiber=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.dietary_fiber;
										diary.nutrients.sugars=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.sugars;
										diary.nutrients.protein=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.protein;
										diary.nutrients.potassium=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.potassium;
										diary.nutrients.phosphorus=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.phosphorus;
										diary.nutrients.water=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.water;
										diary.nutrients.alcohol=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.alcohol;
										diary.nutrients.caffeine=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.caffeine;
										diary.nutrients.calcium=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.calcium;
										diary.nutrients.iron=data.nutrients_summary.nutrient_analysis.daily_nutrients[0].nutrients.iron;
										diary.nutrients.save()
									}
								}
							})
						}
						
						for(let i=0;i<data.nutrients_summary.food_analysis.length;i++){
							Food.findById(data.nutrients_summary.food_analysis[i].food_id,function(err,food){
								if(!err && food!=null){
									if(food.composition==null){
										nutrients= new Nutrient(data.nutrients_summary.food_analysis[i].nutrients);
										nutrients.save(function(err,newNutrients){
											if(!err){
												food.composition=newNutrients;
												food.save(function(err, food){
													if(err){
														console.log(err);
													}
												console.log("Nutrients updated for food " + food._id)
												});
											} else {
												console.log(err);
											}
										})
									}
								}
							})	
						}
						Connection.find({patient: user._id}).populate('profesional').exec(function (err, profesionals) {
							if (!err){
								
								var language=user.language?user.language:global.gConfig.languages[0];
								for(let k=0;k<data.notifications.length;k++){
									var notificationType=data.notifications[k].type;
									var encryptId= crypto.createHash('sha256').update(user._id+global.gConfig.secret).digest('hex');
									var variables=Notification.getVariablesFromObject(notificationType,"en",data.notifications[k].variables);
									var notification = new Notification({
										user:encryptId,
										type:notificationType,
										variables:variables,
										created:new Date(),
										updated:null,
										viewed: false
									})
									notification.save(function(err,not){
										if(!err){
											if(user.push!=null && user.push.token!=null && user.push.os=="android"){
												let firebase = new Firebase()
												let body=Notification.getMessage(notificationType,language,variables);
												let title=Notification.getTitle(notificationType,language);
												//TODO add data with not._id firebase error
												firebase.sendNotification(title,body,Crypt.decrypt(user.push.token))
											} 
										} 
									});
									
									for(let j=0;j<profesionals.length;j++){
										var profesionalNotificationType=12;//Notify PRofesional user triggered
										var encryptProfesionalId= crypto.createHash('sha256').update(profesionals[j]._id+global.gConfig.secret).digest('hex');
										var message=Notification.getProfesionalMessage(notificationType,language,variables);
										var profesionalVariables=[user.user,message]
										var notification = new Notification({
											user:encryptProfesionalId,
											type:profesionalNotificationType,
											variables:profesionalVariables,
											created:new Date(),
											updated:null,
											viewed: false
										})
										notification.save(function(err, not){
											if(!err){
												User.findById(profesionals[j]._id).populate("push").exec(function(err,profesional){
													if(!err){
														if(profesional != null && profesional.push!=null && profesional.push.token!=null && profesional.push.os=="android"){
															let firebase = new Firebase()
															let body=Notification.getMessage(profesionalNotificationType,profesional.language,variables);
															let title=Notification.getTitle(profesionalNotificationType,profesional.language);
															//TODO add data with not._id firebase error
															firebase.sendNotification(title,body,Crypt.decrypt(profesional.push.token))
														}
													}
												})
											}
										});
									}
								}
							}
						});
					}
				})
			}
		}
	}
	catch(err) {
		console.log("error reading Notifications message")
		console.log(err);
	}
}

function sendKafkaMessageCVM(producer,image,uuid){
	var encryptUuid=Crypt.encrypt(JSON.stringify(uuid))
	payload={uuid:encryptUuid,image:image};
	payloads = [{ topic: 'newFoodPicture', messages: JSON.stringify([payload])},];
	producer.send(payloads, function (err, data) {
		if(!err){
			console.log(data);
		}else{
			console.log(err);

		}
	});
	

}

function sendKafkaMessageDAM(producer,uuid,encryptId,name){
	var encryptUuid=Crypt.encrypt(JSON.stringify(uuid))
	var measurements=[];
	var filterDate= new Date();
	var measurementsGrouped=[]
	filterDate.setDate(filterDate.getDate() - 30 );
	Measure.find({"user":encryptId,created:{$gte:filterDate}}).sort({type: 1, created: -1}).select("-user -_id")
	.exec(function(err,data){
		for(i=0;i<data.length;i++){
			if(measurements[data[i].type]==undefined){
				measurements[data[i].type]={type:data[i].type,values:[],created:[]}
			}
			measurements[data[i].type].created.push(data[i].created);
			measurements[data[i].type].values.push(data[i].value);
		}
		for(i=0;i<measurements.length;i++){
			if(measurements[i]){
				measurementsGrouped.push(measurements[i])
			}
		}
		Drink.find({user:encryptId,created:{$gte:filterDate}}).select("-user").exec(function(err,drinks){
			if(err){
				drinks=[];
			}
			Eat.find({user:encryptId,created:{$gte:filterDate}}).select("-user").populate({ path: 'food',populate: [{path: 'ingredients',model: 'Ingredient'},{path: 'composition',model: 'Nutrient'} ]}).exec(function(err,foods){
				if(err){
					foods=[];
				}
				Profile.find({user:encryptId}).select("-user -name -surname").exec(function(err,profile){
					if(err){
						profile={}
					}
					//var query={$or: [{patient: {$exists: false}},{"profesional":encryptId}]};
					Rule.find({}).select("-_id -profesional").exec(function(err,rules){
						if(err){
							rules=[]
						}
						rulesResponse=[]
						for(i=0;i<rules.length;i++){
							if(rules[i].patient==null || Crypt.decrypt(rules[i].patient)==name)
								rulesResponse.push(rules[i])
						}
						payload={uuid:encryptUuid,measurements:measurementsGrouped,drinks:drinks,foods:foods,profile:profile,rules:rulesResponse};
						payloads = [{ topic: 'newMeasure', messages: JSON.stringify([payload])},];
						producer.send(payloads, function (err, data) {
							if(!err){
								console.log(data);
							}else{
								console.log(err);

							}
						});
					});
					
					

				});
				
			})	
			
		})
		
	})
}
function  retrieveIngredient(name){
	return  new Promise(function(resolve) {
		Ingredient.findOne({"name.en":name},function(err, ingredient) {
			if (!err) {
				if(ingredient!=null){
					resolve({ingredient:ingredient});
				}else{
					ingredient= new Ingredient({
						
						created: new Date(),
						updated: new Date()
					});
					ingredient.name={};
					ingredient.name.en=name;
					ingredient.name.es="";
					ingredient.save(function(err,data){
						if (!err) {
							resolve({ingredient:data});
							
						}else {
							resolve(null);
						}
					})
				}
				
			}else {
				resolve(null);
			}
		});
	})
}


function retrieveFood(name,ingredients){
	return  new Promise(function(resolve) {
		Food.findOne({"name.en":name},function(err, food) {
			if (!err) {
				if(food!=null){
					resolve({food:food});
				}else{

					food= new Food({
						
						created: new Date(),
						updated: new Date()
					});
					food.name={};
					food.name.en=name;
					food.name.es="";
					promises=[]
					for(i=0;i<ingredients.length;i++){
						promises.push(retrieveIngredient(ingredients[i]))
					}
					Promise.all(promises)
					.then((results) => {
						var ingredients=[]
						for(i = 0; i < results.length; ++i){
							if (results[i].ingredient){
								ingredients.push(results[i].ingredient)
							}
						}
						food.ingredients=ingredients;
						food.save(function(err,food){
							if (!err){
								resolve({food:food});
							}else{
								resolve(null);

							}

						});
					})

				}
			}else{
				resolve(null);
			}
		})
	})
}
function saveMeasurement(encryptId,type,value){
	if(value!=-1){
		var measure = new Measure({
			user:encryptId,
			type:type,
			value:value,
			created:   new Date()
		});
		measure.save() 
	}
}