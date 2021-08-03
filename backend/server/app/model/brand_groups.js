const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  c2_id: { type: String },
  brand_id: { type: String, index: true },
  name: { type: String },

  created_at: { type: Date, default: Date.now },
});

_schema.plugin(paginate);

const model = mongoose.model('brand_groups', _schema);
module.exports = model;
