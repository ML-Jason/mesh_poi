const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: { type: String, index: true },
  email: String,
});

const model = mongoose.model('users', _schema);
module.exports = model;

// 移除index方法
// model.collection.dropIndex({ account_id: 1 });
