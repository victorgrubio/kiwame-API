var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
var mongooseI18n = require('mongoose-i18n-localize');
var Config=require('../helpers/config.js');
var foodSchema = new Schema({
	user:{ type: String },
	composition:{ type: Schema.Types.ObjectId, ref: 'Nutrient' },
	ingredients:[{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
	name:{ type: String, i18n: true },
	created:{ type: Date }
},  { versionKey: false ,
  usePushEach: true
});
foodSchema.plugin(mongooseI18n, {
	locales: global.gConfig.languages
});

module.exports = mongoose.model('Food',foodSchema);