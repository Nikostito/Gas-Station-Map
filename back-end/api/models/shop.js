/* eslint-disable comma-dangle */
'use strict';

const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

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
  location: {
    type: pointSchema,
    required: true
  }
});

shopSchema.index({location: '2dsphere'});

function lngValidator(val) {
  return Math.abs(val) <= 180;
}
shopSchema.path('lng').validate(lngValidator, 'validation of `{PATH}` failed with absolute value `{VALUE}` > 180');

function latValidator(val) {
  return Math.abs(val) <= 90;
}
shopSchema.path('lat').validate(latValidator, 'validation of `{PATH}` failed with absolute value `{VALUE}` > 90');

module.exports = mongoose.model('Shop', shopSchema);
