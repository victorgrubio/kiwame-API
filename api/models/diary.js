var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var diarySchema = new Schema({
	user:{ type: String },
	nutrients:{ type: Schema.Types.ObjectId, ref: 'Nutrient' },
	created:{ type: Date }
},  { versionKey: false ,
  usePushEach: true
});

module.exports = mongoose.model('Diary',diarySchema);