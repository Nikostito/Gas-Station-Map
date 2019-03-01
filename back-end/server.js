'use strict';
const port = process.env.PORT; //  Set the server port in nodemon.json
if (!port) {
  console.log('Please set the server port in nodemon.json"');
  console.log('Please start the server with "npm start"');
  return -1;
}
const https = require('https');
const app = require('./app');
const fs = require('fs')


const server = https.createServer({
  key: fs.readFileSync('server.key'),
 cert: fs.readFileSync('server.cert')},
 app);
server.listen(port);
