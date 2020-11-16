var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var tokenSchema = new Schema({
	token:{ type: String },
	type:{type:String},
	expires:{ type: Date }
},  {versionKey: false ,
  usePushEach: true
});

module.exports = mongoose.model('Token',tokenSchema);
