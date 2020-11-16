var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var groupSchema = new Schema(
	{
		name:{ type: String },
		created:{ type: Date },
	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

module.exports = mongoose.model('Group', groupSchema);