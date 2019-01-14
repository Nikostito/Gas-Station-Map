/* eslint-disable comma-dangle */
// (Everything in JSON format, 400 bad request in case of xml)
// TODO
'use strict';
const express = require('express');
const router = express.Router();

// GET list of products
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'GEEEET',
    lol: 'd'
  });
});

// Create a product
router.post('/', (req, res, next) => {
  res.status(201).json({
    message: 'POOST',
    lol: 'p'
  });
});

// GET a product's details
router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  if (id === 'special') {
    res.status(200).json({
      message: 'You discovered the special ID',
      id: id
    });
  } else {
    res.status(200).json({
      message: 'You passed an ID'
    });
  }
});

// Update EVERY attribute!
router.put('/:productId', (req, res, next) => {
  res.status(200).json({
    message: 'FULLY Updated product!'
  });
});

// Patch ONLY ONE attribute!
router.patch('/:productId', (req, res, next) => {
  res.status(200).json({
    message: 'PARTIALLY Updated product!'
  });
});

// DELETE product
router.delete('/:productId', (req, res, next) => {
  res.status(200).json({
    message: 'Deleted product!'
  });
});

module.exports = router;
