var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var messageSchema = new Schema(
	{
		sender:{type: Schema.ObjectId, ref: 'User'},
		receiver:{type: Schema.ObjectId, ref: 'User'},
		message: {type:String},
		created: { type: Date },
		updated: { type:Date},
		viewed:{type:Boolean}
	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

module.exports = mongoose.model('Message', messageSchema);