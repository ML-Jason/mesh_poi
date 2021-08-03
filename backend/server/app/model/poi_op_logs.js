const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  email: { type: String, index: true },
  operation: { type: String }, // create, delete
  poi_id: { type: String },
  poi_name: { type: String },
  category1: { type: String },
  category2: { type: String },
  brand_group: { type: String },
  created_at: { type: Date, default: Date.now },
});

_schema.plugin(paginate);

const model = mongoose.model('poi_op_logs', _schema);
module.exports = model;
