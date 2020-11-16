var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var userSchema = new Schema(
	{
		user:{ type: String },
		email:{ type: String },
		password:{ type: String },
		role:{type:String},
		enabled:{type:Boolean},
		valid:{type:Date},
		verfied:{type:Boolean},
		push:{ type: Schema.Types.ObjectId, ref: 'Push' },
		created:{ type: Date },
		updated:{ type: Date },
		language:{ type: String}
	},
	{ 
		versionKey: false ,
		usePushEach: true
	}
);

module.exports = mongoose.model('User', userSchema);
