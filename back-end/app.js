/* eslint-disable comma-dangle */
/* ALWAYS USE res.json() to ensure that the Content-Type is
/* application/json; charset=utf-8
/* as requested by the api specs  */
'use strict';

// Import modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const check_xml = require('./api/middleware/check-xml');
// Morgan is not a dependency in production mode and will not load
if (process.env.NODE_ENV !== 'production'){
  const morgan = require('morgan');
  app.use(morgan('dev'));
}


const baseURL = '/observatory/api';

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_CONNECTION_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongoose connected!');
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Allow CORS
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

// Reject XML requests (team size <7)
app.use(check_xml);

const productRoutes = require('./api/routes/products');
const shopRoutes = require('./api/routes/shops');
const priceRoutes = require('./api/routes/prices');
const signupRoute = require('./api/routes/signup');
const loginRoute = require('./api/routes/login');
const logoutRoute = require('./api/routes/logout');

//  Routes handling requests
app.use(baseURL + '/products', productRoutes);
app.use(baseURL + '/shops', shopRoutes);
app.use(baseURL + '/prices', priceRoutes);
app.use(baseURL + '/signup', signupRoute);
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
  res.status(error.status || 501);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
