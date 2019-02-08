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

// GET list of shops
router.get('/', (req, res, next) => {
  const query = queryValidator(req.query);
  // console.log(query);
  let tempQuery = {
    withdrawn: query.getWithdrawn
  };
  if (query.getAll){
    delete tempQuery.withdrawn;
  }
  Shop
    .find(tempQuery)
    .skip(query.start)
    .limit(query.count)
    .sort({[query.sortby]: query.sort})
    .select('-_id id name address lng lat tags withdrawn')
    .lean() // experiment
    .exec()
    .then(shop => {
      if (!shop.length > 0){
        const error = new Error();
        error.message = 'No shops';
        error.status = 404;
        throw error;
      }
      Shop
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
              shops: shop
            });
        });
    })
    .catch(err => {
      next(err);
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
  const coords = { type: 'Point', coordinates: [req.body.lng, req.body.lat] }; // FIX PATCH/PUT COORDS
  const shop = new Shop({
    name: req.body.name,
    address: req.body.address,
    lng: req.body.lng,
    lat: req.body.lat,
    tags: req.body.tags,
    location: coords,
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
            message: err.name,
            details: err
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
  const coords = { type: 'Point', coordinates: [req.body.lng, req.body.lat] };
  const updatedShop = {
    name: req.body.name,
    address: req.body.address,
    lng: req.body.lng,
    lat: req.body.lat,
    tags: req.body.tags,
    location: coords
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
      res.status(200).json(
        resultedShop
      );
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
  // update internal geoJson lng and lat
  if (updatedField.lng){
    if (Math.abs(updatedField.lng) <= 180){
      updatedField['location.coordinates.0'] = updatedField.lng;
    }
  }
  if (updatedField.lat){
    if (Math.abs(updatedField.lat) <= 90){
      updatedField['location.coordinates.1'] = updatedField.lat;
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
      res.status(200).json(
        resultedShop
      );
    })
    .catch(err => {
      if (err.hasOwnProperty('name')){
        if (err.name === 'ValidationError' || err.codeName === 'DuplicateKey'
        || err.name === 'CastError' || err.name === 'Null shop') {
          console.log(err);
          return res.status(400).json({
            error: '400 - Bad Request',
            message: err.codeName ? err.codeName : err.name,
            details: err
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
