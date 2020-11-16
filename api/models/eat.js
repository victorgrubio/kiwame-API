var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var eatSchema = new Schema({
	user:{ type: String },
	food:{ type: Schema.Types.ObjectId, ref: 'Food' },
	volume:{type:Number},
	recognised:{type:Boolean},
	verified:{type:Boolean},
	created:{ type: Date }
},  { versionKey: false ,
  usePushEach: true
});

module.exports = mongoose.model('Eat',eatSchema);