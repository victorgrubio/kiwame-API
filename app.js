'use strict';

var app = require('express')();

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var mongoose = require('mongoose');
var User = require('./api/models/user.js');
var Auth =require('./api/helpers/auth.js');
var Config=require('./api/helpers/config.js');
var Kafka =require('./api/helpers/kafka.js');
var bb = require('express-busboy');
var morganBody= require ('morgan-body');

 
bb.extend(app, {
	upload: true,
	allowedPath: /./
});
// request things
module.exports = app; // for testing


mongoose.connect(global.gConfig.database, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
})
.then(function(){
	console.log('connected to Database.');
	var config = {
		appRoot: __dirname,
		cors:true,
		swaggerSecurityHandlers: {
			ApiKey:Auth.verifyApiKey,
			Bearer:Auth.verifyToken
		}
	};

	var producer=Kafka.start(global.gConfig.kafkaBroker,100000,global.gConfig.consumerTopics);

	SwaggerExpress.create(config, function(err, swaggerExpress) {
		if (err) { throw err; }

		 // install middleware

		app.set('producer',producer);

		app.use(SwaggerUi(swaggerExpress.runner.swagger));
		morganBody(app,{ filterParameters:['password','repeatPassword','token','refreshToken','code']});
		swaggerExpress.register(app);
		// add swagger-ui

		var port =global.gConfig.node_port;
		app.listen(port);

		 if (swaggerExpress.runner.swagger.paths['/hello']) {
			 console.log('try this:\ncurl http://127.0.0.1:' + port  	);
		 }
	})
})
.catch(err => {
		console.log('ERROR: connecting to Database. ' + err);
});

