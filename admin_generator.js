'use strict';

var mongoose = require('mongoose');
var User = require('./api/models/user.js');
var Key = require('./api/models/key.js');
var uuid = require('uuid');
var bcrypt = require('bcrypt');
const saltRounds = 10;

function createAdminUser(result) {
	console.log("creating admin user");
	if (result.repeat_password == result.password) {
		bcrypt.hash(result.password, saltRounds, function (err, hash) {
			if (!err) {
				User.findOne({ user: result.username, email: result.email }, function (err, user) {
					var action = ""
					if (err) {
						return onErr(err);
					}
					else if (!user) {
						action = "New";
						var user = new User({
							user: result.username,
							email: result.email,
							password: hash,
							role: 'admin',
							enabled: true,
							valid: new Date(),
							created: new Date(),
							updated: new Date(),
						});

					} else {
						action = "Update";
						user.valid = new Date();
						user.password = hash;
						user.updated = new Date();
						user.role = 'admin';
						user.enabled = true;
					}
					user.save(function (err, user) {
						if (err) {
							return onErr(err);
						} else {
							console.log(action + ' User: ' + user.user + ' Role: admin');
							process.exit(-1)
						}
					});
					createDefaultKey('cvm_key')
					createDefaultKey('DAM')
				});
			} else {
				console.log(err);
				return onErr(err);
			}
		});//bcrypt
	}else{
		console.log("Passwords do not match")
	}
}

const createDefaultKey = function(keyName) {
	Key.findOne({'name': keyName}, function(err, key) {
		if(!err) {
			if(key) {
				console.log(keyName + 'id: ' + key.id)
			}else{
				var key = new Key({
					key:uuid.v4(),
					name:keyName,
					enabled:true,
					created: new Date()
				});
				key.save(function(err,item) {
					if(!err) {
						console.log(keyName + 'id: ' + key.id)
					} else {
						console.log(err)
					}
				});
			}
		}else {
			console.log(err)
		}
	});
}
mongoose.connect('mongodb://mongo:27017/kiwame', { useNewUrlParser: true }, function (err, res) {
	if (err) {
		return onErr(err);
	}
	else {
		console.log('connected to Database.\n ');
		console.log("Creting result");
		var result = {username: "admin", email: "vgr@gatv.ssr.upm.es", password: "gatvgatv", repeat_password: "gatvgatv"}
		createAdminUser(result);
	}
});


function onErr(err) {
	console.log("err:" + err);
	process.exit(-1)
}
