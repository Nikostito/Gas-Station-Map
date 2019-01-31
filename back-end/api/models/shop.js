/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
  // Non strings do not throw validation error, but are coerced!!!!!!!!!!!!!!!!
  id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true},
  address: {type: String, required: true},
  lng: {type: Number, required: true},
  lat: {type: Number, required: true},
  // NO empty tag array allowed, BUT accepts integers that are the casted to strings
  tags: {type: [String], validate: v => v == null || v.length > 0},
  withdrawn: { type: Boolean, default: false },
});

module.exports = mongoose.model('Shop', shopSchema);
