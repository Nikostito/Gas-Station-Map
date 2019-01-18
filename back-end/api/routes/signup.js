/* eslint-disable comma-dangle */
'use strict';
// TODO:
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AUser = require('../models/auth_user');


router.post('/', (req, res, next) => {
  // Check if user is already in db
  AUser.findOne({ username: req.body.username })
    .exec()
    .then(user => {
      if (user) {
        return res.status(409).json({
          message: 'User already exists'
        });
      } else {
        // Check for empty strings
        if (!req.body.username || !req.body.password)
          return res.status(400).json({
            message: 'Empty username or password'
          });
        bcrypt.hash(req.body.password, 12, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const authUser = new AUser({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              password: hash,
              token: false, // No token gets created at signup
              admin: false, // Admin status can be given by an existing admin
            });

            // Save user in database
            authUser
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'User created'
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

module.exports = router;
// TODO
