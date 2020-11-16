var Config=require('../helpers/config.js');
var SparkPost = require('sparkpost');

function SparkPostTemplateSender() {

    this.sparkpost_client = new SparkPost(global.gConfig.sparkport_api_key);
}

SparkPostTemplateSender.prototype.getTemplates = function(callback) {
  this.sparkpost_client.templates.list().then(data => {
    return callback(null,data);
  })
  .catch(err => {
    console.log('Whoops! Something went wrong');
    callback (err)
  });
}


SparkPostTemplateSender.prototype.sendTemplate = function(template_id, emailAddresses, variables, callback) {

    if (typeof variables == 'function')
        callback = variables;

    var _emailAddresses = [];

    if (typeof emailAddresses == 'string') {
        _emailAddresses.push({address: emailAddresses})
    }

    if (typeof emailAddresses == Array) {

        emailAddresses.forEach(function(emailAddress){
            _emailAddresses.push({address: emailAddress})
        });
    }
    this.sparkpost_client.transmissions.send({
      content: {
          template_id: template_id,
      },
      substitution_data:variables,
      recipients: _emailAddresses
    }).then(data => {
      return callback(null,data);
    })
    .catch(err => {
      console.log('Whoops! Something went wrong');
      callback (err)
    });

}


module.exports = SparkPostTemplateSender
