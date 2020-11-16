var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
	ruleTypes=[
		{
			type: 1,
			name:{
				en:"Drink",
				es:"Bebida"
			},
			description:{
				en:"Rule about the amount of drink in a period of time (default period is 1(day)",
				es:"Regla sobre la cantidad de bebida en un periodo de tiempo (el tiempo por defecto es 1 día)"
			}
		},
		{
			type: 2,
			name:{
				en:"Measure",
				es:"Medidas"
			},
			description:{
				en:"Rule about a measure, ,measureType parameternis mandatory ",
				es:"Regla sobre una medida, el parametro measureType es obligatorio"
			}
		},
		{
			type: 3,
			name:{
				en:"Nutrient",
				es:"Nutrient"
			},
			description:{
				en:"Rule about the ingestion of nutrients in the food on a period of time(default period is 1 day), nutrientType parameter is mandatory ",
				es:"Regla sobre la ingesta de nutrientes en la comida dutrante un periodo de tiempo( por defecto 1 día), El parámetro nutrientType es obligatorio"
			}
		}
		,
		{
			type: 4,
			name:{
				en:"MDRD-4",
				es:"MDRD-4"
			},
			description:{
				en:"estimated glomerular filtration ratio (need sex, raze, cretatinine, age)",
				es:"estimación filttración glomerular ( necesario sexo, raza, creatininna, edad)"
			}

		},
		{
			type: 5,
			name:{
				en:"CKD-EPI",
				es:"CKD-EPI"
			},
			description:{
				en:"estimated glomerular filtration ratio (need sex, raze, cretatinine, age)",
				es:"estimación filttración glomerular(need sex, raze, cretatinine, age)"
			}
		},
		{
			type: 6,
			name:{
				en:"BMI",
				es:"IMC"
			},
			description:{
				en:"Body mass index (weight,height)",
				es:"Índice de masa corporal (peso altura)"
			}

		}

	]
var conditionTypes=[
		{
			type: 1,
			description:"<"
			
		},
		{
			type: 2,
			description:"<="
		},
		{
			type: 3,
			description:"="	
		},
		{
			type: 4,
			description:">="
		},
		{
			type: 5,
			description:">"	
			
		}
	]

var ruleSchema = new Schema({
	patient:{type: String},
	profesional:{type: String},
	type:{ type: Number},
	measureType:{ type: Number },
	nutrientType:{type: Number},
	condition:{type: Number},
	value:{type:Number},
	period:{type:Number},
	created:{ type: Date },
	updated:{ type: Date },
	enabled:{ type: Boolean },
	notificationType:{type: Number}
	}, { versionKey: false ,
		usePushEach: true
});
ruleSchema.statics.getRuleTypes = function () {
	return ruleTypes;
}
ruleSchema.statics.getConditionTypes = function () {
	return conditionTypes;
}
ruleSchema.statics.isValid= function(notificationType,condition,type){
	if(type==1 && (condition==1 || condition ==2) && notificationType==6){
		return true
	}else if(type==1 && (condition==4 || condition ==5) && notificationType==5){
		return true
	}else if((type==2 || type==4 || type==5 || type== 6) && notificationType==9){
		return true
	}else if(type==3 && (condition==1 || condition ==2) && notificationType==8){
		return true
	}else if(type==3 && (condition==4 || condition ==5) && notificationType==7){
		return true
	}

}
module.exports = mongoose.model('Rule', ruleSchema);
