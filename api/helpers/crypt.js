var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var Config=require('./config.js');

module.exports =  {
  encrypt,
  decrypt
}

function encrypt(text){
  const iv =  Buffer.from(crypto.randomBytes(16));
  var cipher = crypto.createCipheriv(algorithm,getKey(),iv)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return `${iv.toString('hex')}:${crypted.toString()}`;;
}
 
function decrypt(text){
    const textParts = text.split(':');

    //extract the IV from the first half of the value
    const IV =  Buffer.from(textParts.shift(), 'hex');

    //extract the encrypted text without the IV
    const encryptedText =  Buffer.from(textParts.join(':'), 'hex');

    //decipher the string
    const decipher = crypto.  createDecipheriv(algorithm,getKey(), IV);
    let decrypted = decipher.update(encryptedText,  'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted.toString();

}

function getKey(){

   return crypto.createHash('sha256').update(String(global.gConfig.secret)).digest('hex').substr(0, 32);

}


