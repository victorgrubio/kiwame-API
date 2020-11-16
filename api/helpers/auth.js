
var jwt = require("jsonwebtoken");
var Config=require('./config.js');
var Key = require('../models/key.js');
var User = require('../models/user');
var url = require('url');

//Here we setup the security checks for the endpoints
//that need it (in our case, only /protected). This
//function will be called every time a request to a protected
//endpoint is received
exports.verifyToken = function(req, authOrSecDef, token, callback) {
  //these are the scopes/roles defined for the current endpoint
  var currentScopes = req.swagger.operation["x-security-scopes"];
  function sendError() {

    return new Error("Access Denied");

  }
  //validate the 'Authorization' header. it should have the following format:
  //'Bearer tokenString'
  if (token && token.indexOf("Bearer ") == 0) {

    var tokenString = token.split(" ")[1];

    jwt.verify(tokenString, global.gConfig.authSecret,{ignoreExpiration:true}, function(
      verificationError,
      decodedToken
    ) {
      //check if the JWT was verified correctly
      if (
        verificationError == null &&
        Array.isArray(currentScopes) &&
        decodedToken &&
        decodedToken.role
      ) {

      var path = url.parse(req.url).pathname.split("/");
      var endpoint="";
      for(i=path.length-1;i>=0;i--){
        if(path[i]!=""){
          endpoint=path[i];
          break;
        }
      }
        User.findById(decodedToken.sub,function(err, user) {
          if(!err){
            if(user){
              // check if the role is valid for this endpoint
              var roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
              // check if the issuer matches
              var issuerMatch = decodedToken.iss == global.gConfig.issuer;
              var validJwt = decodedToken.iat >= Math.floor(user.valid.getTime() / 1000) ;
              var expired= decodedToken.exp<= Math.floor(Date.now() / 1000)

              if (issuerMatch && roleMatch && validJwt && endpoint =="refreshtoken"){
                 req.auth = decodedToken;
                 return callback(null);
              }else if (roleMatch && issuerMatch && validJwt && !expired ) {
                //add the token to the request so that we
                //can access it in the endpoint code if necessary
                req.auth = decodedToken;
                //if there is no error, just return null in the callback
                return callback(null);
              } else {
                //return the error in the callback if there is one
                return callback(sendError());
              }
            }else{
              return callback(null);
            }
          }else{
            console.log(err);

            return callback(sendError());
          }
        });



      } else {
        //return the error in the callback if the JWT was not verified
        return callback(sendError());
      }
    });
  } else {
    //return the error in the callback if the Authorization header doesn't have the correct format
    return callback(sendError());
  }
};

exports.verifyApiKey=function(req, def, scopes, callback){
    if(!req.headers['x-api-key']){
      callback(new Error('Not API key provided'));
    }else{
      Key.findOne({key:req.headers['x-api-key']},function(err, key) {
        if (err) {
          callback(new Error('Error during authentication'));
        } else if (!key) {
          callback(new Error('Failed to authenticate'));
        } else if(key.key==req.headers['x-api-key'] && key.enabled) {
           req.auth={key:key};
           callback();
        }else{
           callback(new Error('Api Key is not enabled'));
        }
      });
    }
};

exports.issueToken = function(id, role, expiration,issuedAt) {
  var token = jwt.sign(
    {
      exp:expiration,
      sub: id,
      iss:  global.gConfig.issuer,
      role: role,
      iat:issuedAt
    },
    global.gConfig.authSecret
  );
  return token;
};
