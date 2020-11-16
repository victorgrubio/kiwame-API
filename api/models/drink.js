var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;
	containerTypes=[
		{
			type: 1,
			description:{
				es:"Botella pequeña",
				en:"Little bottle"
			},
			capacity:50
		},
		{
			type: 2,
			description:{
				es:"Taza",
				en:"Cup"
			},
			capacity:25
		},
		{
			type: 3,
			description:{
				es:"Vaso pequeño",
				en:"Small glass"
			},
			capacity:20
		},
		{
			type: 4,
			description:{
				es:"Vaso grande",
				en:"Big glass"
			},
			capacity:30
		},
		{
			type: 5,
			description:{
				es:"Jarra",
				en:"Pint"
			},
			capacity:50
		},
		{
			type: 6,
			description:{
				es:"Lata",
				en:"Can"
			},
			capacity:33
		}
		
	];
mongoose.Schema;
	drinkTypes=[
		{
			type: 1,
			name:{
				es:"Agua",
				en:"Water"
			},
			nutrients: {calories: 0, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.4, total_carbohydrate: 0.0, dietary_fiber: 0.0, sugars: 0.0, protein: 0.0, potassium: 0, phosphorus: 0, water: 9995.8, alcohol: 0.0, caffeine: 0, calcium: 0.3002, iron: 0}
		},
		{
			type: 2,
			name:{
				es:"Cerveza",
				en:"Beer"
			},
			nutrients:{calories: 8.45, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.4, total_carbohydrate: 260.0, dietary_fiber: 0.0, sugars: 60.0, protein: 10.0, potassium: 12.63, phosphorus: 2.2865, water: 8598.1, alcohol: 1053.8, caffeine: 0, calcium: 0.7953, iron: 0.0457}
		},
		{
			type: 3,
			name:{
				es:"Vino tinto",
				en:"Red wine"
			},
			nutrients: {total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.4, total_carbohydrate: 260.0, dietary_fiber: 0.0, sugars: 60.0, protein: 10.0, potassium: 12.63, phosphorus: 2.2865, water: 8598.1, alcohol: 1053.8, caffeine: 0, calcium: 0.7953, iron: 0.0457}
		},
		{
			type: 4,
			name:{
				es:"Café",
				en:"Coffe"
			},
			nutrients: {calories: 0.1, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.2, total_carbohydrate: 0.0, dietary_fiber: 0.0, sugars: 0.0, protein: 10.0, potassium: 4.91, phosphorus: 0.3005, water: 9955.2, alcohol: 0.0, caffeine: 4.0065, calcium: 0.2003, iron: 0.001}
		},
		{
			type: 5,
			name:{
				es:"Té",
				en:"Tea"
			},
			nutrients: {calories: 0.1, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0, total_carbohydrate: 30.0, dietary_fiber: 0.0, sugars: 0.0, protein: 0.0, potassium: 2.1, phosphorus: 0.1002, water: 9990.0, alcohol: 0.0, caffeine: 2.004, calcium: 0, iron: 0.001}
		},
		{
			type: 6,
			name:{
				es:"Zumo de naranja",
				en:"Orange juice"
			},
			nutrients:{calories: 4.72, total_fat: 20.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.1, total_carbohydrate: 1090.0, dietary_fiber: 20.0, sugars: 880.0, protein: 70.0, potassium: 20.96, phosphorus: 1.782, water: 9255.8, alcohol: 0.0, caffeine: 0, calcium: 1.153, iron: 0.021}
		},
		{
			type: 7,
			name:{
				es:"Bebida energética",
				en:"Energy drink"
			},
			nutrients:{calories: 6.29, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 4.87, total_carbohydrate: 1520.0, dietary_fiber: 0.0, sugars: 1390.0, protein: 40.0, potassium: 1.01, phosphorus: 0, water: 8573.8, alcohol: 0.0, caffeine: 3.8547, calcium: 0, iron: 0}
		},
		{
			type: 8,
			name:{
				es:"Combinado alcohólico",
				en:"Highball"
			},
			nutrients: {calories: 14.09, total_fat: 10.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.14, total_carbohydrate: 860.0, dietary_fiber: 10.0, sugars: 820.0, protein: 20.0, potassium: 3.65, phosphorus: 0.8042, water: 7401.6, alcohol: 1569.7, caffeine: 0, calcium: 0.3877, iron: 0.0114}
		},
		{
			type: 9,
			name:{
				es:"Alcohol destilado",
				en:"Spirit Drink"
			},
			nutrients:{calories: 17, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.07, total_carbohydrate: 0.0, dietary_fiber: 0.0, sugars: 0.0, protein: 0.0, potassium: 0.15, phosphorus: 0.2944, water: 4902.3, alcohol: 2458.5, caffeine: 0, calcium: 0, iron: 0.0029}
		},
		{
			type:10,
			name:{
				es:"Refresco de cola",
				en:"Cola Soda"
			},
			nutrients:{calories: 4.36, total_fat: 30.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.31, total_carbohydrate: 1080.0, dietary_fiber: 0.0, sugars: 1030.0, protein: 0.0, potassium: 0.52, phosphorus: 0.9343, water: 9276.2, alcohol: 0.0, caffeine: 0.9343, calcium: 0.1038, iron: 0.0021}
		},
		{
			type: 11,
			name:{
				es:"Zumo de piña",
				en:"Pineapple juice"
			},
			nutrients:{calories: 5.61, total_fat: 10.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.21, total_carbohydrate: 1360.0, dietary_fiber: 20.0, sugars: 1060.0, protein: 40.0, potassium: 13.75, phosphorus: 0.8462, water: 9136.2, alcohol: 0.0, caffeine: 0, calcium: 1.3751, iron: 0.0328}
		},
		{
			type: 12,
			name:{
				es:"Zumo de manzana",
				en:"Apple juice"
			},
			nutrients:{calories: 4.82, total_fat: 10.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.42, total_carbohydrate: 1180.0, dietary_fiber: 20.0, sugars: 1010.0, protein: 10.0, potassium: 10.59, phosphorus: 0.7338, water: 9249.5, alcohol: 0.0, caffeine: 0, calcium: 0.8386, iron: 0.0126}		},
		{
			type: 13,
			name:{
				es:"Zumo de tomate",
				en:"Tomato juice"
			},
			nutrients:{calories: 1.74, total_fat: 30.0, saturated_fat: 0.0, cholesterol: 0, sodium: 25.96, total_carbohydrate: 360.0, dietary_fiber: 40.0, sugars: 260.0, protein: 90.0, potassium: 22.27, phosphorus: 1.9497, water: 9670.4, alcohol: 0.0, caffeine: 0, calcium: 1.0262, iron: 0.04}
		},
		{
			type: 14,
			name:{
				es:"Cerveza sin",
				en:"Light Beer"
			},
			nutrients: {calories: 3.7, total_fat: 10.0, saturated_fat: 0.0, cholesterol: 0, sodium: 1.3, total_carbohydrate: 810.0, dietary_fiber: 0.0, sugars: 810.0, protein: 20.0, potassium: 0.8, phosphorus: 1.6019, water: 9125.6, alcohol: 30.0, caffeine: 0, calcium: 0.7008, iron: 0.006}
		},
		{
			type: 15,
			name:{
				es:"Vino Rosado",
				en:"Rose Wine"
			},
			nutrients:{calories: 8.5, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.51, total_carbohydrate: 390.0, dietary_fiber: 0.0, sugars: 390.0, protein: 40.0, potassium: 6.04, phosphorus: 1.8442, water: 8852.1, alcohol: 983.6, caffeine: 0, calcium: 1.0246, iron: 0.0205}
		},
		{
			type: 16,
			name:{
				es:"Vino Blanco",
				en:"White Wine"
			},
			nutrients: {calories: 8.15, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.5, total_carbohydrate: 260.0, dietary_fiber: 0.0, sugars: 100.0, protein: 10.0, potassium: 7.06, phosphorus: 1.7894, water: 8634.9, alcohol: 1023.9, caffeine: 0, calcium: 0.8947, iron: 0.0268}
		},
		{
			type:17,
			name:{
				es:"Refresco",
				en:"Soda"
			},
			nutrients: {calories: 4.36, total_fat: 30.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.31, total_carbohydrate: 1080.0, dietary_fiber: 0.0, sugars: 1030.0, protein: 0.0, potassium: 0.52, phosphorus: 0.9343, water: 9276.2, alcohol: 0.0, caffeine: 0.9343, calcium: 0.1038, iron: 0.0021}
		},
		{
			type:18,
			name:{
				es:"Refresco de cola Light",
				en:"Diet Cola Soda"
			},
			nutrients:{calories: 0, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 1.6, total_carbohydrate: 10.0, dietary_fiber: 0.0, sugars: 0.0, protein: 0.0, potassium: 0.4, phosphorus: 1.101, water: 9988.8, alcohol: 0.0, caffeine: 1.101, calcium: 0.4004, iron: 0.002}
		},
		{
			type:19,
			name:{
				es:"Refresco Zero",
				en:"Soda Zero"
			},
			nutrients: {total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.8, total_carbohydrate: 30.0, dietary_fiber: 0.0, sugars: 0.0, protein: 10.0, potassium: 0.8, phosphorus: 0.9008, water: 9962.8, alcohol: 0.0, caffeine: 1.2011, calcium: 0.3003, iron: 0.011}
		},
		{
			type:20,
			name:{
				es:"Refresco Light",
				en:"Diet Soda"
			},
			nutrients:{calories: 0.2, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.8, total_carbohydrate: 30.0, dietary_fiber: 0.0, sugars: 0.0, protein: 10.0, potassium: 0.8, phosphorus: 0.9008, water: 9962.8, alcohol: 0.0, caffeine: 1.2011, calcium: 0.3003, iron: 0.011}
		},
		{
			type:21,
			name:{
				es:"Leche",
				en:"Milk"
			},
			nutrients:{calories: 5.28, total_fat: 200.0, saturated_fat: 120.0, cholesterol: 0.83, sodium: 5.38, total_carbohydrate: 510.0, dietary_fiber: 0.0, sugars: 0.0, protein: 360.0, potassium: 16.77, phosphorus: 10.3545, water: 9201.0, alcohol: 0.0, caffeine: 0, calcium: 13.2538, iron: 0.0052}
		},
		{
			type:22,
			name:{
				es:"Refresco de cola zero",
				en:"Zero soda Cola "
			},
			nutrients:{calories: 0.2, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.8, total_carbohydrate: 30.0, dietary_fiber: 0.0, sugars: 0.0, protein: 10.0, potassium: 0.8, phosphorus: 0.9008, water: 9962.8, alcohol: 0.0, caffeine: 1.2011, calcium: 0.3003, iron: 0.011}
		},
		{
			type:23,
			name:{
				es:"Té de hierbas",
				en:"Herbal Tea "
			},
			nutrients:{calories: 0.1, total_fat: 0.0, saturated_fat: 0.0, cholesterol: 0, sodium: 0.1, total_carbohydrate: 20.0, dietary_fiber: 0.0, sugars: 0.0, protein: 0.0, potassium: 0.9, phosphorus: 0, water: 9990.0, alcohol: 0.0, caffeine: 0, calcium: 0.2004, iron: 0.008}
		}

	];
var drinkSchema = new Schema({
	type:{ type: Number },
	volume:{ type: Number },
	user:{ type: String },
	created:{ type: Date },	
	}, { versionKey: false ,
		usePushEach: true
});


drinkSchema.statics.getDrinkTypes = function () {
	return drinkTypes;
}
drinkSchema.statics.isValidDrinkType = function (drink) {
	for (i=0;i<drinkTypes.length;i++){
		if(drinkTypes[i].type==drink) return true;
	}
	return false;
}
drinkSchema.statics.getDrinkType = function (drink) {
	for (i=0;i<drinkTypes.length;i++){
		if(drinkTypes[i].type==drink) return drinkTypes[i];
	}
	return null;
}

module.exports = mongoose.model('drink', drinkSchema);
