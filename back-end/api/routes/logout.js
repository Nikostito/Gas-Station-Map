/* eslint-disable comma-dangle */
'use strict';
// TODO:
const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const AUser = require('../models/auth_user');

router.post('/', checkAuth, (req, res, next) => {
  // Invalidate token
  AUser.findOne({ username: req.userDataTakenFromJwtToken.username })
    .exec()
    .then(user => {
      if (!user.tokens.id(req.jwtTokenID)){
        console.log('No authenticated user matches the token');
        console.log('This should be handled by check-auth');
        return res.status(500).json({
          error: 'Server Error'
        });
      }

      user.tokens.id(req.jwtTokenID).remove();
      user
        .save()
        .then(result => {
          console.log(result);
          res.status(200).json({
            message: 'OK' // API specs
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    });
});

module.exports = router;
// TODO
