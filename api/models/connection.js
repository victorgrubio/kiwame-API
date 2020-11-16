var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var connectionSchema = new Schema(
	{
		patient:{type: Schema.ObjectId, ref: 'User'},
		profesional:{type: Schema.ObjectId, ref: 'User'},
		created:{ type: Date },
	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

module.exports = mongoose.model('Connection', connectionSchema);