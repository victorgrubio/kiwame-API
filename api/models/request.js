var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var requestSchema = new Schema(
	{
		patient:{type: Schema.ObjectId, ref: 'User'},
		profesional:{type: Schema.ObjectId, ref: 'User'},
		approved:{ type: Boolean },
		created:{ type: Date },
		updated:{ type: Date },
		message:{type:String}

	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

module.exports = mongoose.model('Request', requestSchema);