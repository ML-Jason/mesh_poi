const ErrorLogs = require('~server/app/model/error_logs');
const vcheck = require('~server/module/vartool/vcheck');

const call = async (errlog_id) => {
  const _id = vcheck.mongoID(errlog_id);

  if (!_id) return;

  await ErrorLogs.deleteOne({ _id });
};

module.exports = call;
