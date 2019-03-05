/* eslint-disable comma-dangle */
/* ALWAYS USE res.json() to ensure that the Content-Type is
/* application/json; charset=utf-8
/* as requested by the api specs  */
'use strict';

// Import modules
const mongoose = require('../node_modules/mongoose');
const Product = require('../api/models/product');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost/test");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongoose connected!');
});

var product = new Product({
  name: 'e95',
  description: '-',
  category: '-',
  tags: ['']
});
product.id = product._id;
product
  .save()
  .then(resultedProduct => {
    console.log(resultedProduct);
  })
  .catch(err => {
    console.log(err);
  });

product = new Product({
  name: 'e100',
  description: '-',
  category: '-',
  tags: ['']
});
product.id = product._id;
product
  .save()
  .then(resultedProduct => {
    console.log(resultedProduct);
  })
  .catch(err => {
    console.log(err);
  });
product = new Product({
  name: 'Diesel',
  description: '-',
  category: '-',
  tags: ['']
});
product.id = product._id;
product
  .save()
  .then(resultedProduct => {
    console.log(resultedProduct);
  })
  .catch(err => {
    console.log(err);
  });
product = new Product({
  name: 'LPG',
  description: '-',
  category: '-',
  tags: ['']
});
product.id = product._id;
product
  .save()
  .then(resultedProduct => {
    console.log(resultedProduct);
  })
  .catch(err => {
    console.log(err);
  });
