var Nutrient  =require('../models/nutrient');
var Measure = require('../models/measure');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	notificationsTypes=[
		{
			type: 1,
			description:"Request received",
			title:{
				en:"New request",
				es:"Nueva petición"
				},
			message:{
				en:"The health profesional {{val1}}, has requested access to your profile",
				es:"El profesional de la salud {{val1}}, quiere tener acceso a tu perfil"
				},
			variables:[
				{
					name:"val1",
					description:"Profesional nickname"
				}
			]
		},
		{
			type: 2,
			description:"Request accepted",
			title:{
				en:"Request accepted",
				es:"Petición aprobada"
				},
			message:{
				en:"{{val1}}, has accepted your request ",
				es:"{{val1}}, ha aceptado tu solicitud"
				},
			variables:[
				{
					name:"val1",
					description:"Patient nickname"
				}
			]
		},
		{
			type: 3,
			description:"Request rejected",
			title:{
				en:"Request rejected",
				es:"Petición rechazada"
				},
			message:{
				en:"{{val1}}, has rejected your request ",
				es:"{{val2}}, ha rechazado tu solicitud"
				},
			variables:[
				{
					name:"val1",
					description:"Patient nickname"
				}
			]
		},
		{
			type: 4,
			description:"Message received",
			title:{
				en:"New message",
				es:"Nuevo mensaje"
				},
			message:{
				en:"{{val1}}, sent you a new message",
				es:"{{val1}}, te ha enviado un nuevo mensaje"
				},
			variables:[
				{
					name:"val1",
					description:"Sender nickname"
				}
			]
		},{
			type: 5,
			description:"Encourage to drink less",
			title:{
				en:"Drink Report",
				es:"Drinks Report"
				},
			message:{
				en:"Has bebido {{val1}} cl. en {{val2}} días, modera la ingesta de liquidos",
				es:"You have drink {{val1}} cl , in the last {{val2}} days, reduce fluid intakes"
				},
			variables:[
				{
					name:"val1",
					description:"Amount of drink"
				},
				{
					name:"val2",
					description:"number of days"
				}
			],
		},{
			type: 6,
			description:"Encourage to drink more",
			title:{
				en:"Drink Report",
				es:"Informe de bebidas"
				},
			message:{
				es:"Has bebido {{val1}} cl. en {{val2}} días, hidratate",
				en:"You have drink {{val1}} cl , in the last {{val2}} days, hydrate yourself "
				},
			variables:[
				{
					name:"val1",
					description:"Amount of drink"
				},
				{
					name:"val2",
					description:"number of days"
				}
			]
		}
		,{
			type: 7,
			description:"Consume less of a nutrient",
			title:{
				en:"Food Report",
				es:"Informe Nutricional"
				},
			message:{
				es:"Estas teniendo una dieta muy alta en {{val1}}, reducela",
				en:"You are having a high {{val1}} diet, reduce it"
				},
			variables:[
				{
					name:"val1",
					description:"nutrientType id "
				}
			]
		}
		,{
			type: 8,
			description:"Consume more of a nutrient",
			title:{
				en:"Food Report",
				es:"Informe Nutricional"
				},
			message:{
				es:"Estas teniendo una dieta muy baja en {{val1}}, aumentala",
				en:"You are having a low {{val1}} diet, raise it"
				},
			variables:[
				{
					name:"val1",
					description:"nutrientType id"
				}
			]
		},
		{
			type: 9,
			description:"Measure is out of range",
			title:{
				en:"Health Alert",
				es:"Alerta de Salud"
				},
			message:{
				es:"Tu {{val1}} está fuera de los estandares, chequeala",
				en:"Your {{val1}} is out of of bounds, have it checked"
				},
			variables:[
				{
					name:"val1",
					description:"Measure Type"
				}
			]
		},
		{
			type: 10,
			description:"Diet Recommendation",
			title:{
				en:"Diet Recommendation",
				es:"Recomendación Nutricional"
				},
			message:{
				es:"Mejora tu dieta siguiendo estos consejos",
				en:"Improve your diet, following this advises"
				}
			
		},
		{
			type: 11,
			description:"Custom Messagge",
			title:{
				en:"{{val1}}",
				es:"{{val1}}"
				},
			message:{
				es:"{{val2}}",
				en:"{{val2}}"
				},
			variables:[
				{
					name:"val1",
					description:"title"
				},
				{
					name:"val2",
					description:"message"
				}
			]
		},
		{
			type: 12,
			description:"Patient triggered a rule",
			title:{
				en:"Patient rule triggered",
				es:"Paciente activo regla"
				},
			message:{
				es:"{{val1}} {{val2}}",
				en:"{{val1}} {{val2}}"
				},
			variables:[
				{
					name:"val1",
					description:"User nickname of the patient"
				},
				{
					name:"val2",
					description:"description of rule triggered"
				},

			]
			
		},

		
	]
		
var notificationSchema = new Schema({
	user:{type:String},
	type:{type: Number},
	variables:[String],
	created:{ type: Date },
	view: {type:Boolean}
	},
	{ 
	versionKey: false ,
	usePushEach: true
	});
notificationSchema.statics.getTypes = function () {
	return notificationsTypes;
}
notificationSchema.statics.getMessage = function (type,language,variables) {
	message="";
	console.log("IN NOTIFICATION GETMESSSAGE")
	for (let i=0;i<notificationsTypes.length;i++){
		console.log(i)
		if(notificationsTypes[i].type==type) {
			if(notificationsTypes[i].type==10){
				message=notificationsTypes[i].variables.val2
			}else if(notificationsTypes[i].type==7 || notificationsTypes[i].type==8){
				message= notificationsTypes[i].message[language];
				message=message.replace("{{val1}}",Nutrient.getNutrientName(variables[0],language));
			}else if(notificationsTypes[i].type==9){
				console.log("TYPE 9 TOP")
				message= notificationsTypes[i].message[language];
				message=message.replace("{{val1}}",Measure.getMeasureName(variables[0],language));
				console.log("TYPE 9 BOT")
			}else{
				message= notificationsTypes[i].message[language];
				for (let j=0;j<notificationsTypes[i].variables.length;j++){
					if(variables[j]!=null){
						message=message.replace("{{"+notificationsTypes[i].variables[j].name+"}}",variables[j]);
					}
				}
			}

		}
	}
	return message;
}
notificationSchema.statics.getProfesionalMessage = function (type,language,variables) {
	message="";
	try{
		for (let i=0;i<notificationsTypes.length;i++){			
			console.log("i :"+i);
			if(notificationsTypes[i].type==type) {
				if(notificationsTypes[i].type==10){
					message=notificationsTypes[i].variables.val2
				}else if(notificationsTypes[i].type==7 || notificationsTypes[i].type==8){
					message= notificationsTypes[i].message[language];
					message=message.replace("{{val1}}",Nutrient.getNutrientName(variables[0],language));
				}else if(notificationsTypes[i].type==9){
					console.log("language :"+language);
					message= notificationsTypes[i].message[language];
					console.log("message:"+message);
					message=message.replace("{{val1}}",Measure.getMeasureName(variables[0],language));
				}else{
					message= notificationsTypes[i].message[language];
					for (let j=0;j<notificationsTypes[i].variables.length;j++){
						if(variables[j]!=null){
							message=message.replace("{{"+notificationsTypes[i].variables[j].name+"}}",variables[j]);
						}
					}
				}

			}
		}
	}catch(e){
		console.log(e);
		message="";
	}
	if (language=="es"){
		message="ha recibido \""+message +"\"";

	}else if (language=="en"){
		message="has received \""+message +"\"";
	}
	return message;
}
notificationSchema.statics.getTitle = function (type,language,variables) {
	message="";
	for (i=0;i<notificationsTypes.length;i++){
		if(notificationsTypes[i].type==type) {
			if(notificationsTypes[i].type==10){
				message=notificationsTypes[i].variables.val1;
			}else{
				message= notificationsTypes[i].title[language];
			}
		}
	}
	return message;
}
notificationSchema.statics.isValidType = function (type) {
	for (i=0;i<notificationsTypes.length;i++){
		if(notificationsTypes[i].type==type) return true;
	}
	return false;
}
notificationSchema.statics.getVariablesFromObject = function (type,language,variables) {
	response=[];
	for (i=0;i<notificationsTypes.length;i++){
		if(notificationsTypes[i].type==type) {
			console.log(type);
			for(j=0;j<notificationsTypes[i].variables.length;j++){
				response.push(variables[notificationsTypes[i].variables[j].name])
			}

		}
	}
	return response;
}
module.exports = mongoose.model('Notification',notificationSchema);
