const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  user_id: { type: String, index: true },
  access_token: { type: String, index: true },
  refresh_token: { type: String, index: true },
  new_access_token: { type: String },
  created_at: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // 一星期後刪除
  refresh_at: { type: Date },
  revoked: { type: Boolean },
});

const model = mongoose.model('access_tokens', _schema);
module.exports = model;

// 移除index方法
// model.collection.dropIndex({ account_id: 1 });
