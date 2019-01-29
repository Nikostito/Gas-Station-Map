/* eslint-disable comma-dangle */
// (Everything in JSON format, 400 bad request in case of xml)
// TODO
'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Product = require('../models/product');

function productWrapper(){
  var newProduct = {
    id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    tags: this.tags
  };
  return newProduct;
}

function isUniqueFieldUpdate(prod){
  let i = 0;
  for (var field in prod){
    if (prod[field]){
      i++;
    }
  }
  if (i === 1)
    return true;
  else
    return false;
}

function uniqueField(prod){
  let result = {};
  for (var field in prod){
    if (prod[field]){
      result[field] = prod[field];
    }
  }
  return result;
}

function queryValidator(q){
  var newQuery = {
    start: 0,
    count: 20,
    getWithdrawn: false,
    getAll: false,
    sortby: 'id',
    sort: -1 // sort: -1 for descending
  };

  if (q.start){
    q.start = Number.parseFloat(q.start);
    if (Number.isInteger(q.start) && q.start >= 0){
      newQuery.start = parseInt(q.start, 10);
    } else {
      const error = new Error();
      error.status = 400;
      error.message = 'Validation error: query start invalid';
      throw error;
    }
  }
  if (q.count){
    q.count = Number.parseFloat(q.count);
    if (Number.isInteger(q.count) && q.count >= 1){
      newQuery.count = parseInt(q.count, 10);
    } else {
      const error = new Error();
      error.status = 400;
      error.message = 'Validation error: query count invalid';
      throw error;
    }
  }
  if (q.status){
    if (isFinite(q.status))
      q.status = 'nil';

    const tmp = q.status.toUpperCase();
    if (tmp === 'ALL'){
      newQuery.getAll = true;
    } else if (tmp === 'WITHDRAWN'){
      newQuery.getWithdrawn = true;
    } else if (tmp === 'ACTIVE'){
      newQuery.getWithdrawn = false;
    } else {
      const error = new Error();
      error.status = 400;
      error.message = 'Validation error: query status invalid';
      throw error;
    }
  }
  if (q.sort){
    const temp = q.sort.toLowerCase().split('|');
    const condition1 = (temp.length === 2);
    const condition2 = (temp[0] === 'id' || temp[0] === 'name');
    const condition3 = (temp[1] === 'asc' || temp[1] === 'desc');
    if (condition1 && condition2 && condition3){
      newQuery.sortby = temp[0];
      if (temp[1] === 'asc'){
        newQuery.sort = 1;
      } else {
        newQuery.sort = -1;
      }
    } else {
      const error = new Error();
      error.status = 400;
      error.message = 'Validation error: query sort invalid';
      throw error;
    }
  }

  return newQuery;
}

// GET list of products
router.get('/', (req, res, next) => {
  const query = queryValidator(req.query);
  // console.log(query);
  let tempQuery = {
    withdrawn: query.getWithdrawn
  };
  if (query.getAll){
    delete tempQuery.withdrawn;
  }
  Product
    .find(tempQuery)
    .skip(query.start)
    .limit(query.count)
    .sort({[query.sortby]: query.sort})
    .select('-_id id name description category tags withdrawn')
    .lean() // experiment
    .exec()
    .then(product => {
      if (!product.length > 0){
        const error = new Error();
        error.message = 'No products';
        error.status = 404;
        throw error;
      }
      Product
        .where(tempQuery)
        .countDocuments()
        .lean()
        .exec()
        .then(count => {
          res.status(200).json(
            {
              start: query.start,
              count: query.count,
              total: count,
              products: product
            });
        });
    })
    .catch(err => {
      next(err);
    });

});

// Create a product
router.post('/', checkAuth, (req, res, next) => {
  // a single string as a tag will be ACCEPTED as an array with that string
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags
  });
  product.id = product._id;
  product
    .save()
    .then(resultedProduct => {
      res.status(200).json(
        productWrapper.call(resultedProduct)
      );
    })
    .catch(err => {
      // Check empty strings OR name not unique
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'){
          console.log(err);
          return res.status(400).json({
            error: '400 - Bad Request'
          });
        }
      }
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// GET a product's details
router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('-_id id name description category tags withdrawn')
    .exec()
    .then(product => {
      if (!product){
        const error = new Error();
        error.name = 'Null product';
        throw error;
      }
      res.status(200).json(
        product
      );
    }
    )
    .catch(err => {
      if (err.name === 'CastError' || err.name === 'Null product'){
        return res.status(404).json({
          message: '404 - id doesn\'t match any product'
        });
      }
      res.status(500).json({
        error: err
      });
    });
});

// Update EVERY attribute!
router.put('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags
  };
  partialUpdateProductValidation(updatedProduct);
  Product
    .findByIdAndUpdate(
      id,
      { $set: updatedProduct},
      {new: true, runValidators: true}
    )
    .select('-_id id name description category tags withdrawn')
    .exec()
    .then(resultedProduct => {
      console.log(resultedProduct);
      res.status(200).json({
        resultedProduct
      });
    })
    .catch(err => {
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'){
          console.log(err);
          return res.status(400).json({
            error: '400 - Bad Request',
            message: err.codeName ? err.codeName : err.name
          });
        }
      }
      res.status(500).json({
        error: err
      });
    });
});

// Patch ONLY ONE attribute!
router.patch('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags
  };
  let updatedField;
  // in case of either zero input or >1 fields
  if (!isUniqueFieldUpdate(updatedProduct)){
    return res.status(400).json({
      error: '400 - Bad Request',
      message: 'Zero, or more than one fields specified'
    });
  } else {
    updatedField = uniqueField(updatedProduct);
  }
  Product
    .findByIdAndUpdate(
      id,
      { $set: updatedField},
      {new: true}
    )
    .select('-_id id name description category tags withdrawn')
    .exec()
    .then(resultedProduct => {
      console.log(resultedProduct);
      res.status(200).json({
        resultedProduct
      });
    })
    .catch(err => {
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'){
          console.log(err);
          return res.status(400).json({
            error: '400 - Bad Request',
            message: err.codeName ? err.codeName : err.name
          });
        }
      }
      res.status(500).json({
        error: err
      });
    });
});

// DELETE product
router.delete('/:productId', checkAuth, (req, res, next) => {
  res.status(200).json({
    message: 'Deleted product!'
  });
});

module.exports = router;
