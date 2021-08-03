const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  name: { type: String },
  category_id: { type: String },
  parent: { type: String },
});

_schema.plugin(paginate);

const model = mongoose.model('categories', _schema);
module.exports = model;
