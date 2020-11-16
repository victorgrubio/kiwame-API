var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var raceTypes=[
		{
			type: 1,
			description:{
				es:"Mongólico o amarillo",
				en:"Asian"
				}
			},
		{
			type: 2,
			description:{
				es:"Nativo americano",
				en:"American Indian "
			}
		},
		{
			type: 3,
			description:{
				es:"caucasico o blanco",
				en:"White"
			}
		},
		{
			type: 4,
			description:{
				es:"malayo o pardo (del sudeste de Asia)",
				en:"Pacific Islander"
			}
		},
		{
			type: 5,
			description:{
				es:"Etiópico o negro.",
				en:"Black"
			}
		}
]

var genderTypes= [
		{
			type: 1,
			description:{
				es:"Mujer",
				en:"Female"
				}
			},
		{
			type: 2,
			description:{
				es:"Hombre",
				en:"Male"
			}
		}
]
var profileSchema = new Schema(
	{
		user:{ type: String },
		name:{ type: String },
		surname:{ type: String },
		sex:{type:Number},
		age:{type:Number},
		race:{type:Number},
		diabetes:{type: Boolean},
		htn:{type:Boolean},
		dyslipidemia:{type:Boolean},
		hyperuricemia:{type:Boolean},
		height:{type:Number},
		specialty:{type:String}
	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

profileSchema.statics.getRaceTypes = function () {
	return raceTypes;
}
profileSchema.statics.getGenderTypes = function () {
	return genderTypes;
}

module.exports = mongoose.model('Profile', profileSchema);
