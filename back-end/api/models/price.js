/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const priceSchema = mongoose.Schema({
  price: {type: Number, required: true},
  date: {type: Date, required: true},
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true
  }
});

module.exports = mongoose.model('Shop', priceSchema);
