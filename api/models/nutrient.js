var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
	NutrientsTypes=[{
				type: 1,

				description:{
					es:"Grasas",
					en:"Fat"
					},
				key:"total_fat"
			},

			{
				type: 2,

				description:{
					es:"Grasas saturadas",
					en:"Saturated fat"
					},
				key:"saturated_fat"
			},
			{
				type: 3,

				description:{
					es:"Colesterol",
					en:"Cholesterol"
					},
				
				key:"cholesterol"
			},	
			{
				type: 4,

				description:{
					es:"Sodio",
					en:"Sodium"
					},
				key:"sodium"

			},
			{
				type: 5,

				description:{
					es:"Carbohidratos",
					en:"Carbohydrates"
					},
				key:"total_carbohydrate"
			},
			{
			type: 6,

				description:{
					es:"Fibras",
					en:"Fibers"
					},

					key:"dietary_fiber"

			},
			{
				type: 7,
				description:{
					es:"Azucares",
					en:"Sugars"
					},
				key:"sugars"
			},
			{
				type: 8,

				description:{
					es:"Proteinas",
					en:"Proteins"
					},
				key:"protein"

			},
			{
				type: 9,

				description:{
					es:"Potasio",
					en:"Potassium"
					},
				key:"potassium"

			},{
				type: 10,

				description:{
					es:"Fosfor",
					en:"Phosporus"
					},
					key:"phosphorus"

			},
			{
				type: 11,

				description:{
					es:"Agua",
					en:"Water"
					},
					key:"water"
			},
			{
				type: 12,
				description:{
					es:"Alcohol",
					en:"Alcohol"
					},
					key:"alcohol"
			},
			{
			type: 13,

			description:{
				es:"Cafeina",
				en:"Caffeine"
				},
				key:"caffeine"
			},{	
				type: 14,

				description:{
					es:"Calcio",
					en:"Calcium"
				},
				key:"calcium"
			},
			{
				type: 15,

				description:{
					es:"Hierro",
					en:"Iron"
					},
				key:"iron"
			},
			{
				type: 16,

				description:{
					es:"Calorías",
					en:"Calories"
					},
				key:"calories"
			}
	];
var nutrientSchema = new Schema({
	calories:{type:Number},
	total_fat:{type:Number},
	saturated_fat:{type:Number},
	cholesterol:{type:Number},
	sodium:{type:Number},
	total_carbohydrate:{type:Number},
	dietary_fiber:{type:Number},
	sugars:{type:Number},
	protein:{type:Number},
	potassium:{type:Number},
	phosphorus:{type:Number},
	water:{type:Number},
	alcohol:{type:Number},
	caffeine:{type:Number},
	calcium:{type:Number},
	iron:{type:Number},
},  { versionKey: false ,
  usePushEach: true
});
nutrientSchema.statics.getNutrientTypes = function () {
	return NutrientsTypes;
}
nutrientSchema.statics.isValidNutrienType = function (nutrient) {
	for (i=0;i<NutrientsTypes.length;i++){
		if(NutrientsTypes[i].type==nutrient) return true;
	}
	return false;
}
nutrientSchema.statics.getNutrientName = function (nutrient,language) {
	for (i=0;i<NutrientsTypes.length;i++){
		if(NutrientsTypes[i].type==nutrient) return NutrientsTypes[i].description[language];
	}
	return false;
}
module.exports = mongoose.model('Nutrient',nutrientSchema);