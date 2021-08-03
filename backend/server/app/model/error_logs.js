const mongoose = require('mongoose');
const paginate = require('./plugin/paginate');

const _schema = new mongoose.Schema({
  title: { type: String },
  message: { type: String },
  created_at: { type: Date, default: Date.now },
});

_schema.plugin(paginate);

const model = mongoose.model('errorlogs', _schema);
module.exports = model;
