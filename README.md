# LPS BIGGER API REST FOR BUSINESS RULE ENGINE

1. Clone the project
2. install mongoDB if not installed `sudo apt-get install mongodb`
3. install project `npm install`
4. Execute node api_generator.js
5. Create user and get the api key

```
node api_generator.js 
connected to Database.
 
prompt: username:  fran
prompt: email:  fmg@gatv.ssr.upm.es
{ _id: 57bff09c598c32a63023d75c,
  updated: Fri Aug 26 2016 09:32:44 GMT+0200 (CEST),
  created: Fri Aug 26 2016 09:32:44 GMT+0200 (CEST),
  key: '879fd013-5605-4208-9a85-a262fffc468a',
  email: 'fmg@gatv.ssr.upm.es',
  user: 'fran' }
New User: fran Api Key:879fd013-5605-4208-9a85-a262fffc468a


```
6. Copy the Api Key
7. Modify api/helpers/rule_writer.js "PATH" to specify the path where to save the drl files
8. Install swagger for node JS `npm install -g swagger`
9. Modify node_modules/swagger-tools/middleware/swagger-ui/index.html. Change addApiKeyAuthorization function with this one
```
function addApiKeyAuthorization(){
          
          var key = encodeURIComponent($('#input_apiKey')[0].value);
          if(key && key.trim() != "") {
            var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("x-api-key", key, "header");
            window.swaggerUi.api.clientAuthorizations.add("x-api-key", apiKeyAuth);
            log("added key " + key);
          }
        }
```
10. execute swagger project start
11. go to localhost:10010/docs and paste the Api Key on the box on the right up corner, then browse through the API
