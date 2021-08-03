const ErrorLogs = require('~server/app/model/error_logs');

const call = async ({
  title,
  message,
}) => {
  const _updates = {
    title,
    message: message.toString(),
  };

  await ErrorLogs.create(_updates);
};

module.exports = call;
