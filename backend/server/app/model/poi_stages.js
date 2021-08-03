const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  name: { type: String },
  brand_group: { type: String },
  category1: { type: String },
  category2: { type: String },
  address: { type: String },
  phone: { type: String },
  city: { type: String },
  district: { type: String },
  loc: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
    },
    coordinates: {
      type: Array,
    },
  },
  created_at: { type: Date, default: Date.now },
});

_schema.plugin(paginate);

_schema.index({ loc: '2dsphere' });
const model = mongoose.model('poi_stages', _schema);
module.exports = model;
