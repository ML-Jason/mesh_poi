const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  poi_id: { type: String, index: true },
  cht_poiid: { type: String },
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
  updated_at: { type: Date, default: Date.now },
  checked_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, index: true, default: false },
});

_schema.plugin(paginate);

// module.exports = mongoose.model('accounts', _schema);
_schema.index({ loc: '2dsphere' });
const model = mongoose.model('pois', _schema);
module.exports = model;
