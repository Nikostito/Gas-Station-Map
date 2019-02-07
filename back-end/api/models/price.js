/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

const priceSchema = mongoose.Schema({
  price: {type: Number, required: true},
  // better to pass Date as a Number and validate in the backend with momentjs
  date: {
    type: Number,
    required: true,
    get: v => { return moment(v.toString()).format('YYYY-MM-DD'); }
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true
  }
},
{
  id: false
});

priceSchema.set('toObject', { getters: true });
priceSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Price', priceSchema);
