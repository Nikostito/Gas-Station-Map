/* eslint-disable comma-dangle */
// (Everything in JSON format, 400 bad request in case of xml)
// TODO
'use strict';
const express = require('express');
const router = express.Router();

// GET list of shops
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'GEEEET',
    lol: 'd'
  });
});

// Create a shop
router.post('/', (req, res, next) => {
  res.status(201).json({
    message: 'POOST',
    lol: 'p'
  });
});

// GET a shop's details
router.get('/:shopId', (req, res, next) => {
  const id = req.params.shopId;
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
router.put('/:shopId', (req, res, next) => {
  res.status(200).json({
    message: 'FULLY Updated shop!'
  });
});

// Patch ONLY ONE attribute!
router.patch('/:shopId', (req, res, next) => {
  res.status(200).json({
    message: 'PARTIALLY Updated shop!'
  });
});

// DELETE shop
router.delete('/:shopId', (req, res, next) => {
  res.status(200).json({
    message: 'Deleted shop!'
  });
});

module.exports = router;
