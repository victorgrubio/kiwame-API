var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
var mongooseI18n = require('mongoose-i18n-localize');
var Config=require('../helpers/config.js');


var ingredientSchema = new Schema({
	name:{ type: String, i18n: true },
	created: { type: Date },
	updated: { type:Date},
},  { versionKey: false ,
  usePushEach: true
});
ingredientSchema.plugin(mongooseI18n, {
	locales: global.gConfig.languages
});

module.exports = mongoose.model('Ingredient',ingredientSchema);