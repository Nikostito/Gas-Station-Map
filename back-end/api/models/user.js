/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
  _id: 'string'
});

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {type: String, required: true, unique: true},
  password: { type: String, required: true },
  tokens: [tokenSchema],
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
