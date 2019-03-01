/* eslint-disable comma-dangle */
'use strict';

const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
  res.status(200).json({
    message: 'OK'
  });
});

router.post('/', checkAuth, (req, res, next) => {
  res.status(200).json({
    message: 'OK'
  });
});

module.exports = router;
