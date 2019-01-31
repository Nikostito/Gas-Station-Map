/* eslint-disable comma-dangle */
// (Everything in JSON format, 400 bad request in case of xml)
// TODO
'use strict';
const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Shop = require('../models/shop');

function shopWrapper(){
  var newShop = {
    id: this._id,
    name: this.name,
    address: this.address,
    lng: this.lng,
    lat: this.lat,
    tags: this.tags,
    withdrawn: this.withdrawn
  };
  return newShop;
}

function countUpdatedFields(prod){
  let i = 0;
  for (var field in prod){
    if (prod[field]){
      i++;
    }
  }
  return i;
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

// GET list of shops
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'GEEEET',
    lol: 'd'
  });
});

// Create a shop
router.post('/', checkAuth, (req, res, next) => {
  // numbers & booleans will be coerced to strings if model type is string
  // booleans will be coerced to numbers if model type is number
  // SOS / TODO / Should withdrawn be set at creation?

  // Unfortunately custom validation sucks in mongoose, so we do a workaround,
  // if not, a single string as a tag will be coerced to an array
  if (!req.body.tags || !Array.isArray(req.body.tags)){
    return res.status(400).json({
      error: '400 - Bad Request',
      message: 'Tags missing'
    });
  }
  const shop = new Shop({
    name: req.body.name,
    address: req.body.address,
    lng: req.body.lng,
    lat: req.body.lat,
    tags: req.body.tags
  });
  shop.id = shop._id; //     //     //     //     // Should we keep user generated id????
  shop
    .save()
    .then(resultedShop => {
      res.status(200).json(
        shopWrapper.call(resultedShop)
      );
    })
    .catch(err => {
      // Check empty strings
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError'){
          console.log(err);
          return res.status(400).json({
            error: '400 - Bad Request',
            message: err.name
          });
        }
      }
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// GET a shop's details
router.get('/:shopId', (req, res, next) => {
  const id = req.params.shopId;
  Shop.findById(id)
    .select('-_id id name address lng lat tags withdrawn')
    .exec()
    .then(shop => {
      if (!shop){
        const error = new Error();
        error.name = 'Null shop';
        throw error;
      }
      res.status(200).json(
        shop
      );
    }
    )
    .catch(err => {
      if (err.name === 'CastError' || err.name === 'Null shop'){
        return res.status(404).json({
          message: '404 - id doesn\'t match any shop'
        });
      }
      res.status(500).json({
        error: err
      });
    });
});

// Update EVERY attribute!      //Should we also update withdrawn?
router.put('/:shopId', checkAuth, (req, res, next) => {
  // Unfortunately custom validation sucks in mongoose, so we do a workaround
  if (!req.body.tags || !Array.isArray(req.body.tags)){
    return res.status(400).json({
      error: '400 - Bad Request',
      message: 'Tags missing'
    });
  }
  const id = req.params.shopId;
  const updatedShop = {
    name: req.body.name,
    address: req.body.address,
    lng: req.body.lng,
    lat: req.body.lat,
    tags: req.body.tags
  };
  Shop
    .findByIdAndUpdate(
      id,
      { $set: updatedShop},
      {new: true, runValidators: true}
    )
    .select('-_id id name address lng lat tags withdrawn')
    .exec()
    .then(resultedShop => {
      if (!resultedShop){
        const error = new Error();
        error.name = 'Null shop';
        throw error;
      }
      console.log(resultedShop);
      res.status(200).json({
        resultedShop
      });
    })
    .catch(err => {
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'
        || err.name === 'CastError' || err.name === 'Null shop') {
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

// Patch ONLY ONE attribute!      //Should we also update withdrawn?
router.patch('/:shopId', checkAuth, (req, res, next) => {
  const id = req.params.shopId;
  const updatedShop = {
    name: req.body.name,
    address: req.body.address,
    lng: req.body.lng,
    lat: req.body.lat,
    tags: req.body.tags
  };
  let updatedField;
  // Should implement custom validation to prevent boolean and integer coercion
  // in case of either zero input or >1 fields
  if (countUpdatedFields(updatedShop) !== 1){
    return res.status(400).json({
      error: '400 - Bad Request',
      message: 'Zero, or more than one fields specified'
    });
  } else {
    updatedField = uniqueField(updatedShop);
  }
  if (updatedField.tags){
  // Unfortunately custom validation sucks in mongoose, so we do a workaround
    if (!Array.isArray(req.body.tags)){
      return res.status(400).json({
        error: '400 - Bad Request',
        message: 'Tags missing'
      });
    }
  }
  Shop
    .findByIdAndUpdate(
      id,
      { $set: updatedField},
      {new: true, runValidators: true}
    )
    .select('-_id id name address lng lat tags withdrawn')
    .exec()
    .then(resultedShop => {
      if (!resultedShop){
        const error = new Error();
        error.name = 'Null shop';
        throw error;
      }
      console.log(resultedShop);
      res.status(200).json({
        resultedShop
      });
    })
    .catch(err => {
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'
        || err.name === 'CastError' || err.name === 'Null shop') {
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

// DELETE shop
router.delete('/:shopId', checkAuth, (req, res, next) => {
  const id = req.params.shopId;
  // find if authorized user has admin priviledges
  if (req.userHasAdminPriviledges){
    Shop.deleteOne({ _id: id })
      .exec()
      .then(result => {
        console.log('admin delete');
        console.log(result);
        // if nothing was deleted
        if (result.n === 0){
          const error = new Error();
          error.name = 'Null shop';
          throw error;
        }
        // TODO: Delete all prices that match the shop
        //       What about products that aren't sold at any other shops?
        //       Delete them as well?
        res.status(200).json({
          message: 'OK'
        });
      })
      .catch(err => {
        if (err.hasOwnProperty('name')){
          if (err.name === 'CastError' || err.name === 'Null shop') {
            console.log(err);
            return res.status(400).json({
              error: '400 - Bad Request',
              message: 'No shop with this id. Note to devs: is this error supposed to be 401 not authorized?)'
            });
          }
        }
        console.log(err);
        res.status(524).json({
          error: err
        });
      });
  } else {
    Shop
      .updateOne({_id: id}, {$set: {withdrawn: true}})
      .exec()
      .then(result => {
        console.log('user delete');
        console.log(result);
        // if nothing was deleted
        if (result.n === 0){
          const error = new Error();
          error.name = 'Null shop';
          throw error;
        }
        // if shop was withdrawn previously
        if (result.nModified === 0){
          const error = new Error();
          error.name = 'Shop already withdrawn';
          throw error;
        }
        res.status(200).json({
          message: 'OK'
        });
      })
      .catch(err => {
        if (err.hasOwnProperty('name')){
          if (err.name === 'CastError' || err.name === 'Null shop') {
            console.log(err);
            return res.status(400).json({
              error: '400 - Bad Request',
              message: 'No shop with this id. Note to devs: is this error supposed to be 401 not authorized?)'
            });
          }
          if (err.name === 'Shop already withdrawn'){
            return res.status(401).json({
              error: '401 - Not Authorized', // Check if this is the correct error code
              message: err.name
            });
          }
        }
        console.log(err);
        return res.status(525).json({
          error: err,
        });
      });
  }
});

module.exports = router;
