/* eslint-disable comma-dangle */
'use strict';
// TODO:
const express = require('express');
const router = express.Router();

// GET list of prices
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'price get',
    lol: 'd'
  });
});

// POST a new price for a given product in a given shop
router.post('/', (req, res, next) => {
  res.status(200).json({
    message: 'price post'
  });
});

module.exports = router;
// TODO
