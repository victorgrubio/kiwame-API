
var admin = require("firebase-admin");
var Config=require('./config.js');

var serviceAccount = require(global.gConfig.firebaseJsonPath);


function FirebaseManager() {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL:  global.gConfig.firebaseDBUrl
		});
	}
}

FirebaseManager.prototype.sendNotification = function(title,body,registrationToken){

	var message = {
		notification: {title: title, body: body},
		token: registrationToken
	};
	console.log(message);
	admin.messaging().send(message)
		.then((response) => {
			console.log('Successfully sent message:', response);
		})
		.catch((error) => {
			console.log('Error sending message:', error);
		});

}

module.exports = FirebaseManager
