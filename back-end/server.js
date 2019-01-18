'use strict';
const port = process.env.PORT; //  Set the server port in nodemon.json
if (!port) {
  console.log('Please set the server port in nodemon.json"');
  console.log('Please start the server with "npm start"');
  return -1;
}
const http = require('http');
const app = require('./app');


const server = http.createServer(app);

server.listen(port);
