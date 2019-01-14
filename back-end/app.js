/* eslint-disable comma-dangle */

'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
try {
  const morgan = require('morgan');
  app.use(morgan('dev'));
} catch (e){
  /* Morgan is not a dependency in production mode and will not load */
}

const baseURL = '/observatory/api';


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

const productRoutes = require('./api/routes/products');
const shopRoutes = require('./api/routes/shops');

const loginRoute = require('./api/routes/login');
const logoutRoute = require('./api/routes/logout');

//  Routes handling requests
app.use(baseURL + '/products', productRoutes);
app.use(baseURL + '/shops', shopRoutes);

app.use(baseURL + '/login', loginRoute);
app.use(baseURL + '/logout', logoutRoute);

//  Default matching throws 404
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});
//  Error handling
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
