var Sparkpost = require('../helpers/sparkpost.js');

module.exports =  {

  getTemplates

}


function getTemplates(req, res) {
  sparkpost= new Sparkpost();
  sparkpost.getTemplates(function(err,data){
    if(!err){
        res.status(200);
        console.log(data.result);
        response={message:"success",statusCode:200,templates:data.results}
        res.json(response);
    }else{
      res.status(500);
      response={message:err.message,statusCode:500}
      res.json(response);
    }
  })
}
