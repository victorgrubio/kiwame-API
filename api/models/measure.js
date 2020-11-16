var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;
	measureTypes=[
		{
			type: 1,
			description:{
				es:"Peso (kg)",
				en:"Weight (kg)"
				}
			},
		{
			type: 4,
			description:{
				es:"Altura (m)",
				en:"Height (m)"
			}
		},
		{
			type: 5,
			description:{
				es:"Masa libre de grasa (kg)",
				en:"Fat Free Mass (kg)"
			}
		},
		{
			type: 6,
			description:{
				es:"Porcentaje de grasa(%)",
				en:"Fat Ratio (%)"
			}
		},
		{
			type: 8,
			description:{
				es:"Peso de grasa(kg)",
				en:"Fat Mass Weight (kg)"
			}
		},
		{
			type: 9,
			description:{
				es:"Presión arterial diastólica(mmHg)",
				en:"Diastolic Blood Pressure (mmHg)"
			}
		},
		{
			type: 10,
			description:{
				es:"Presión arterial sistólica (mmHg)",
				en:"Systolic Blood Pressure (mmHg)"
			}
		},
		{
			type: 11,
			description:{
				es:"Pulso (bpm)",
				en:"Heart Pulse (bpm)"
			}
		},
		{
			type:12,
			description:{
				es:"Temperatura (celsius)",
				en:"Temperature (celsius)"
			}
		},
		{
			type: 52,
			description:{
				es:"SpO2 (%)",
				en:"SpO2 (%)"
			}
		},
		{
			type: 71,
			description:{
				es:"Temperatra corporal (celsius)",
				en:"Body Temperature (celsius)"
			}
		},
		{
			type: 73,
			description:{
				es:"Temperatura de la piel (celsius)",
				en:"Skin Temperature (celsius)"
			}
		},
		{
			type: 76,
			description:{
				es:"Masa muscular (kg)",
				en:"Muscle Mass (kg)"
			}
		},
		{
			type: 77,
			description:{
				es:"Hidratación (kg)",
				en:"Hydration (kg)"
			}
		},
		{
			type: 88,
			description:{
				es:"Peso oseo (kg)",
				en:"Bone Mass (kg)"
			}
		},
		{
			type: 91,
			description:{
				es:"Velocidad de onda de pulso (m/s)",
				en:"Pulse Wave Velocity (m/s)"
			}
		},
		{
			type:92,
			description:{
				es:"Creatinina(mg/dl)",
				en:"Creatinine (mg/dl)"
			}
		},
		{
			type: 93,
			description:{
				es:"Potasio(mEq/l)",
				en:"Potassium (mEq/l)"
			}
		},
		{
			type: 94,
			description:{
				es:"Fosforo (mg/dl)",
				en:"Phosphate (mg/dl)"
			}
		},
		{
			type: 95,
			description:{
				es:"Bicarbonato (mmol/l)",
				en:"Bicarbonate (mmol/l)"
			}
		},
		{
			type:96,
			description:{
				en:"glycaemia (mg/dl)" ,
				es:"glucemia (mg/dl)"
			}
		},
		{
			type:97,
			description:{
				en:"Cockcroft-Gault" ,
				es:"Cockcroft-Gault"
			}
		},
		{
			type:98,
			description:{
				en:"CKD-EPI" ,
				es:"CKD-EPI"
			}
		},
		{
			type:99,
			description:{
				en:"MDRD-4" ,
				es:"MDRD-4"
			}
		},
		{
			type:100,
			description:{
				en:"BMI" ,
				es:"IMC"
			}
		},
		{
			type:101,
			description:{
				en:"Daily stpes" ,
				es:"Pasos diarios"
			}
		}
	];

var measureSchema = new Schema({
	type:{ type: Number },
	user:{ type: String },
	value:{ type: String },
	created:{ type: Date },	
	}, { versionKey: false ,
		usePushEach: true
});

measureSchema.statics.getTypes = function () {
	return measureTypes;
}
measureSchema.statics.isValidType = function (measure) {
	for (i=0;i<measureTypes.length;i++){
		if(measureTypes[i].type==measure) return true;
	}
	return false;
}
measureSchema.statics.getMeasureName = function (measure,language) {
	for (i=0;i<measureTypes.length;i++){
		if(measureTypes[i].type==measure) return measureTypes[i].description[language];
	}
	return false;
}
module.exports = mongoose.model('Measure', measureSchema);
