var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var keySchema = new Schema({
	name:{ type: String },
	key:{ type: String },
	created:{ type: Date },
	enabled:{type:Boolean},
},	{ versionKey: false ,
	usePushEach: true
});

module.exports = mongoose.model('Key',keySchema);
