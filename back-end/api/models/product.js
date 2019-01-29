/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true, unique: true},
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{type: String, required: true}],
  withdrawn: { type: Boolean, default: false },
});

module.exports = mongoose.model('Product', productSchema);
