var express = require('express');
const bodyParser = require('body-parser');
var https = require('https');
const axios = require("axios");
var fs = require('fs');

var router = express.Router();

router.use(bodyParser.json());



function UpdateStatusAsync (entityType, idList) {
  if (Array.isArray(idList)) {
    let obj = []

    let requestsRemaining = idList.length;

    for (const entry of idList) {
      const url = "https://httpbin.org/anything/v1/" + entityType + '/' + entry;

      const getData = async url => {
        try {
          const response = await axios.get(url);
          const data = response.data;

          obj.push(data);
          requestsRemaining -= 1;

          if (requestsRemaining == 0) {
            fs.writeFile(entityType + '_status_' + Date.now() + '.json', JSON.stringify(obj, null, 4), 'utf8', () =>{});
          }
        } catch (error) {
          console.log(error);
        }
      };
      
      getData(url);
    }
  }
}



function UpdateStatusByCallbacks (entityType, idList) {
  if (Array.isArray(idList)) {
    let obj = []

    let requestsRemaining = idList.length;

    for (const entry of idList) {
      const options = {
        hostname: "httpbin.org",
        path: '/anything/v1/' + entityType + '/' + entry
      }
      
      const req = https.request(options, resp => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          obj.push(JSON.parse(data));
          requestsRemaining -= 1;

          if (requestsRemaining == 0) {
            fs.writeFile(entityType + '_status_' + Date.now() + '.json', JSON.stringify(obj, null, 4), 'utf8', () =>{});
          }
        })
      })
      
      req.end()
    }
  }
}



router.route('/document/status')
.post((req, res, next) => {
  //UpdateStatusByCallbacks("document", req.body);
  UpdateStatusAsync("document", req.body);
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json("success");
});



router.route('/project/status')
.post((req, res, next) => {
  //UpdateStatusByCallbacks("project", req.body);
  UpdateStatusAsync("project", req.body);
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json("success");
});



module.exports = router;
