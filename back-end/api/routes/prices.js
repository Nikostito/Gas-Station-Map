/* eslint-disable comma-dangle */
'use strict';
// TODO:
const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const moment = require('moment');
const lodash = require('lodash');
const mongoose = require('mongoose');

const Product = require('../models/product');
const Shop = require('../models/shop');
const Price = require('../models/price');

function fixDate(date){
  var d = date.toString();
  return d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8);
}

function priceWrapper(price, query){
  return price.map(p => {
    return {
      price: p.price,
      date: fixDate(p.date),
      productName: p.productId.name,
      productId: p.productId.id,
      productTags: p.productId.tags,
      shopId: p.shopId.id,
      shopName: p.shopId.name,
      shopTags: p.shopId.tags,
      shopAddress: p.shopId.address,
      shopDist: Math.round(p.distance),
    };
  });
}

function resultWrapper(rawResult, query){
  var result = {};
  result.start = query.start;
  result.count = query.count;
  result.total = rawResult[0][0].total;
  result.prices = priceWrapper(rawResult[1], query);
  return result;
}

function getGeoQueryUnsorted(query){
  return Shop
    .find({
      location: {
        $geoWithin: {
          /* https://docs.mongodb.com/manual/tutorial/
calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/*/
          $centerSphere: [
            [ query.geoLng, query.geoLat ], query.geoDist / 6378.1
          ]
        }
      }
    })
    .select('_id')
    .lean()
    .exec();
/*  .then(result => {
      const ids = result.map(x => x._id);
      console.log(ids);
    });*/
}
function getGeoQuerySorted(query){
  /* https://docs.mongodb.com/manual/reference/
operator/aggregation/geoNear/#pipe._S_geoNear*/
  return Shop
    .aggregate([
      { $geoNear: {
        near: {
          type: 'Point',
          coordinates: [ query.geoLng, query.geoLat ]
        },
        maxDistance: query.geoDist * 1000,
        spherical: true,
        distanceField: 'distance',
        // limit: should be TOTAL shop count to account for reverse order
        limit: 999999,
        distanceMultiplier: 0.001 // m to km
      }}
    ])
    .project('_id distance')
    .exec();
/*    .then(r => {
    console.log(r);
    res.status(200).json(r);
  });*/
}

function quikError(status, message){
  const error = new Error();
  error.status = status;
  error.message = message;
  return error;
}

function priceValidationAndTransformation(p){
  if (!p.price || !p.dateFrom || !p.dateTo || !p.productId || !p.shopId){
    const error = new Error();
    error.status = 400;
    error.message = 'Validation error: empty field';
    throw error;
  }
  // Number.isFinite() does NOT accept strings
  if (p.price <= 0 || !Number.isFinite(p.price)){ // let zero prices???????????????????????
    const error = new Error();
    error.status = 400;
    error.message = 'Validation error: price';
    throw error;
  }

  if (moment(p.dateFrom, 'YYYY-M-D', true).isValid() === false ||
  moment(p.dateTo, 'YYYY-M-D', true).isValid() === false){
    const error = new Error();
    error.status = 400;
    error.message = 'Validation error: date';
    throw error;
  }
  const dFrom = moment(p.dateFrom, 'YYYY-M-D'); // dateFrom wrapper
  const dTo = moment(p.dateTo, 'YYYY-M-D'); // dateTo wrapper

  if (moment(dFrom).isSame(dTo, 'day')){
    let newPrice = {
      price: p.price,
      date: moment(dFrom).format('YYYYMMDD'), /// EASY COMPARISON
      productId: p.productId,
      shopId: p.shopId
    };
    return [newPrice];
  }
  let newPrices = [];
  let tempDay = dFrom;
  if (moment(dTo).isBefore(dFrom)){
    const error = new Error();
    error.status = 400;
    error.message = 'Invalid date range';
    throw error;
  } else {
    while (!moment(tempDay).isSame(dTo, 'day')){
      newPrices.push(
        {
          price: p.price,
          date: moment(tempDay).format('YYYYMMDD'), /// EASY COMPARISON
          productId: p.productId,
          shopId: p.shopId
        }
      );
      tempDay = moment(tempDay).add(1, 'd');
    }
    newPrices.push(
      {
        price: p.price,
        date: moment(tempDay).format('YYYYMMDD'), /// EASY COMPARISON
        productId: p.productId,
        shopId: p.shopId
      }
    );
    return newPrices;
  }
}

function priceQueryValidator(q){
  var newQuery = {
    start: 0,
    count: 20,
    dateFrom: moment().format('YYYYMMDD'),
    dateTo: moment().format('YYYYMMDD'),
    shops: [],
    products: [],
    tags: [],
    geoDist: -1,
    geoLng: 0,
    geoLat: 0,
    sortby: 'price',
    sort: 1 // sort: +1 for ascending
  };
  if (q.geoDist || q.geoLat || q.geoLng){
    if (!q.geoDist || !q.geoLat || !q.geoLng){
      throw quikError(
        400,
        'Validation error: all location options must be filled (or none)'
      );
    } else {
      if (!isFinite(q.geoDist) || q.geoDist <= 0
      || !isFinite(q.geoLng || !isFinite(q.geoLat))){
        throw quikError(400, 'Validation error: geolocation');
      }
      newQuery.geoDist = Number.parseFloat(q.geoDist);
      newQuery.geoLng = Number.parseFloat(q.geoLng);
      newQuery.geoLat = Number.parseFloat(q.geoLat);
    }
  }
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
  if (q.dateFrom || q.dateTo){
    if (moment(q.dateFrom, 'YYYY-M-D', true).isValid() === false ||
    moment(q.dateTo, 'YYYY-M-D', true).isValid() === false){
      const error = new Error();
      error.status = 400;
      error.message = 'Validation error: date';
      throw error;
    }
    const dFrom = moment(q.dateFrom, 'YYYY-M-D'); // dateFrom wrapper
    const dTo = moment(q.dateTo, 'YYYY-M-D'); // dateTo wrapper
    if (moment(dTo).isSameOrAfter(dFrom)){
      newQuery.dateFrom = dFrom.format('YYYYMMDD');
      newQuery.dateTo = dTo.format('YYYYMMDD');
    } else {
      const error = new Error();
      error.status = 400;
      error.message = 'Invalid date range';
      throw error;
    }
  }
  // if q.products is a single query, q.products comes as a string, else as an array
  if (q.products){//////////////////////////////////////////////////////////////////fix as shops
    if (!Array.isArray(q.products)){
      q.products = [q.products];
    }
    newQuery.products = q.products;
  }
  if (q.shops){/////////////////////////////////////////// validate ids
    if (!Array.isArray(q.shops)){
      q.shops = [q.shops];
    }
    newQuery.shops = q.shops;
  }
  if (q.tags){
    if (!Array.isArray(q.tags)){
      q.tags = [q.tags];
    }
    newQuery.tags = q.tags;
  }
  if (q.sort){
    const temp = q.sort.toLowerCase().split('|');
    const condition1 = (temp.length === 2);
    const condition2 = (temp[0] === 'dist' || temp[0] === 'date' || temp[0] === 'price');
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

// GET list of prices
router.get('/', (req, res, next) => {
  const query = priceQueryValidator(req.query);
  const geoQueryUnsorted = getGeoQueryUnsorted(query);
  const geoQuerySorted = getGeoQuerySorted(query);
  var mongoQuery = Price
    .find()
    .skip(query.start)
    .limit(query.count)
    .where('date').gte(query.dateFrom).lte(query.dateTo);

  if (query.geoDist > 0){ // product + shops + !tags! + geoQuery...
    if (query.sortby === 'dist'){ // product + shops + !tags! + geoQuery Sorted
      let arrShopId = [];
      let arrShopDist = [];
      geoQuerySorted
        .then(result => {
          for (const key in result) {
            arrShopId.push(result[key]._id);
            arrShopDist.push(result[key].distance);
          }
          try { // SHOULD VALIDATE IN FUNCTION !
            query.shops = query.shops.map(mongoose.Types.ObjectId);
          } catch (error) {
            throw quikError(400, 'wrong shops id(s)');
          }

          if (query.shops.length > 0){
            arrShopId = lodash.intersectionBy(query.shops, arrShopId, lodash.toString);
          }
          var priceQuery = Price
            .aggregate()
            .match({
              shopId: { $in: arrShopId },
              date: {$gte: parseInt(query.dateFrom, 10), $lte: parseInt(query.dateTo, 10)}
            })
//            .match({ shopId: { $in: arrShopId }})
//            .match({date: {$gte: parseInt(query.dateFrom, 10), $lte: parseInt(query.dateTo, 10)}})
            .addFields({distance: { $arrayElemAt: [ arrShopDist, { $indexOfArray: [ arrShopId, '$shopId' ] } ] }})
            .sort({distance: query.sort})
            .lookup({ from: 'shops', localField: 'shopId', foreignField: '_id', as: 'shopId' })
            .lookup({ from: 'products', localField: 'productId', foreignField: '_id', as: 'productId' })
            .skip(query.start)
            .limit(query.count)
            .unwind('shopId', 'productId');
          if (query.tags.length > 0){
            priceQuery = priceQuery
              .match({ $or: [
                {'shopId.tags': { $in: query.tags }},
                {'productId.tags': { $in: query.tags }}
              ]});
          }
          
          const promisePrice = priceQuery
            .project({
              _id: 0,
              price: 1,
              date: 1,
              distance: 1,
              'shopId.id': 1,
              'shopId.name': 1,
              'shopId.tags': 1,
              'shopId.address': 1,
              'productId.id': 1,
              'productId.name': 1,
              'productId.tags': 1,
            })
            .exec();
          // 'promisePrice' & 'promisePriceCount' are NOT independent objects.
          // As a side effect, that means that they should NOT change order.
          const promisePriceCount = priceQuery.count('total').exec();
          return Promise.all([promisePriceCount, promisePrice]);
        })
        .then(result => {
          console.log(result[1]); ///////////////////////////////////////////////// to be deleted
          return res.status(200).json(resultWrapper(result, query));
        })
        .catch(err => {
          console.log(err);
          if (err.status && err.message){
            return res.status(err.status).json({
              error: err
            });
          }
          if (err.name === 'CastError'){
            return res.status(400).json({
              message: err.name,
              err: err.message
            });
          }
          res.status(500).json({
            error: err
          });
        });

      
    } else { // product + shops + !tags! + geoQuery Unsorted
      geoQueryUnsorted
        .then(result => {
          if (!result.length > 0){
            throw quikError(404, 'empty search'); //
          }
          const geoIds = result.map(x => x._id.toString());
          var shopIds;
          if (query.shops.length > 0){
            shopIds = lodash.intersection(query.shops, geoIds);
          } else {
            shopIds = geoIds;
          }
          mongoQuery = mongoQuery.where('shopId').in(shopIds); // implement also tags
          if (query.products.length > 0){
            mongoQuery = mongoQuery.where('productId').in(query.products);
          }
          if (query.sortby === 'price' || query.sortby === 'date'){
            mongoQuery = mongoQuery.sort({[query.sortby]: query.sort});
          }
          return mongoQuery
            .select('-_id -__v')
            .populate({
              path: 'productId',
              select: '-_id id name tags',
            })
            .populate({
              path: 'shopId',
              select: '-_id id name tags address',
            })
            .exec();
        })
        .then(prices => {
          res.status(200).json(
            prices
          );
        })
        .catch(err => {
          console.log(err);
          if (err.name === 'CastError' || err.status === 404){
            return res.status(404).json({
              message: 'Wrong id(s)',
              err: err.message
            });
          }
          res.status(500).json({
            error: err
          });
        });
    }
  } else {
    // product + shops + !tags!

  }
  ///////////////////////////////////////////////////////////////////
  /*
  if (query.tags.length > 0){
        mongoQuery = mongoQuery
      .populate
    //TODO -TO_ASK
    //also check with sortby dist
  }
  if (query.products.length > 0){
    mongoQuery = mongoQuery.where('productId').in(query.products);
  }
  if (query.shops.length > 0){
    mongoQuery = mongoQuery.where('shopId').in(query.shops);
  }
  if (query.sortby === 'price' || query.sortby === 'date'){
    mongoQuery = mongoQuery.sort({[query.sortby]: query.sort});
  }
  if (query.geoDist > 0){////
    console.log('not sorting by distance');
    mongoQuery = mongoQuery
      .populate({
        path: 'shopId',
        select: '-_id id name tags address',
        match: {
          location: {
            $geoWithin: {
              // https://docs.mongodb.com/manual/tutorial/calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/
              $centerSphere: [
                [ query.geoLng, query.geoLat ], query.geoDist / 6378.1
              ]
            }
          }
        }
      });
  }
  //    .sort({[query.sortby]: query.sort})
  
  mongoQuery
    .select('-_id -__v')
    .populate({
      path: 'productId',
      select: '-_id id name tags',

    })
    .exec()
    .then(prices => {
      res.status(200).json(
        prices
      );
    })
    .catch(err => {
      console.log(err);
      if (err.name === 'CastError' || err.status === 404){
        return res.status(404).json({
          message: 'Wrong id(s)',
          err: err.message
        });
      }
      res.status(500).json({
        error: err
      });
    });*/
});

// POST a new price for a given product in a given shop
router.post('/', checkAuth, (req, res, next) => {
  const priceArray = priceValidationAndTransformation(req.body);
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        const error = new Error();
        error.status = 404;
        error.message = 'Product id not found';
        throw error;
      }
      return Shop.findById(req.body.shopId); // ///////////////////////////
    })
    .then(shop => {
      if (!shop) {
        const error = new Error();
        error.status = 404;
        error.message = 'Shop id not found';
        throw error;
      }
      return Price.insertMany(priceArray);
    })
    .then(result => {
      // FIND OUT HOW TO PRESENT PRICE RESULTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      if (err.name === 'CastError' || err.status === 404){
        return res.status(404).json({
          message: 'Wrong id',
          err: err.message
        });
      }
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
// TODO
