/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {type: String, required: true, unique: true},
  password: { type: String, required: true },
  token: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
