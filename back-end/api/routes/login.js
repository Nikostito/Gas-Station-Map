/* eslint-disable max-len */
/* eslint-disable comma-dangle */
'use strict';
// TODO:
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AUser = require('../models/auth_user');

router.post('/', (req, res, next) => {
  AUser.findOne({ username: req.body.username })
    .exec()
    .then(user => {
      if (!user) {
        console.log('User doesn\'t exist');
        return res.status(400).json({
          message: '400 - Bad Request' // According to API specs
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          console.log('error in handling bcrypt');
          return res.status(400).json({
            message: '400 - Bad Request' // According to API specs
          });
        }
        if (result) {
          const jwtToken = jwt.sign(
            {
              username: user.username,
              userId: user._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: '1h'
            }
          );
          // Token success, insert token in database for future invalidation purposes
          AUser.updateOne(
            { _id: user._id },
            { $push: { tokens: {_id: jwtToken} } },
            (err) => {
              if (err){
                console.log(err);
                return res.status(500).json({
                  error: err
                });
              }
              return res.status(200)
                .header(process.env.AUTH_HEADER, jwtToken).json();

            }
          );
          /* Possible non-atomic push? (also look @ mongoose _v)
           user.tokens.push({ _id: jwtToken });
            user
            .save()
            .then((resul) => {
              return res.status(200)
                .header(process.env.AUTH_HEADER, jwtToken).json();
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
            */
        } else {
          console.log('Wrong password');
          res.status(400).json({
            message: '400 - Bad Request'
          });
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
// TODO
