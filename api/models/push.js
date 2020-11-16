var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var pushSchema = new Schema({
	os:{ type: String },
	token:{ type: String },
	created:{ type: Date },
	updated:{ type: Date }
},	{ versionKey: false ,
	usePushEach: true
});

module.exports = mongoose.model('Push',pushSchema);
