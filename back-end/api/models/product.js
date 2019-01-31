/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  // Non strings do not throw error, but are coerced!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  id: mongoose.Schema.Types.ObjectId,
  // product name unique (?)
  name: {type: String, required: true, unique: true},
  description: { type: String, required: true },
  category: { type: String, required: true },
  // NO empty tag array allowed, BUT accepts integers that are the casted to strings
  tags: {type: [String], validate: v => v == null || v.length > 0},
  withdrawn: { type: Boolean, default: false },
});

module.exports = mongoose.model('Product', productSchema);
