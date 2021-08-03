/* 負責處理log的設定 */

/* eslint prefer-destructuring:0 */
const log4js = require('log4js');
const path = require('path');
const ifaces = require('os').networkInterfaces();

let address;
Object.keys(ifaces).forEach((dev) => {
  ifaces[dev].forEach((details) => {
    if (details.family === 'IPv4' && details.internal === false) {
      address = details.address;
    }
  });
});

let log;

const getOptions = (category, logPath) => {
  // log4js的输出级别6個: trace, debug, info, warn, error, fatal
  let appenders = { console: { type: 'console' } };
  let categories = {
    default: { appenders: ['console'], level: 'error' },
    development: { appenders: ['console'], level: 'trace' },
  };

  /*
  開發時不用輸出file，可是如果在configure裡有file的appender，一樣會產生0Kb的file。(BUG!)
  所以確定非開發狀態才把appenders加進去。
  */
  if (category !== 'development' && logPath) {
    appenders = {
      ...appenders,
      ...{
        everything: {
          type: 'file',
          filename: path.join(logPath, `log.${address}.log`),
          maxLogSize: 1024 * 400,
          backups: 1024,
          daysToKeep: 30,
          pattern: 'yyyy_MM_dd_hh',
          alwaysIncludePattern: true,
          keepFileExt: true,
        },
        errors: {
          type: 'file',
          filename: path.join(logPath, `error.${address}.log`),
          maxLogSize: 1024 * 400,
          backups: 1024,
          daysToKeep: 30,
          pattern: 'yyyy_MM_dd_hh',
          alwaysIncludePattern: true,
          keepFileExt: true,
        },
        only_errors: { type: 'logLevelFilter', appender: 'errors', level: 'error' },
      },
    };

    categories = {
      ...categories,
      ...{
        stage: { appenders: ['console', 'everything', 'only_errors'], level: 'trace' },
        production: { appenders: ['everything', 'only_errors'], level: 'trace' },
      },
    };
  }

  return { appenders, categories };
};

const __export = {
  init: ({
    app,
    env = 'development',
    logPath = path.join('server', 'log'),
  }) => {
    log4js.configure(getOptions(env, logPath));
    log = log4js.getLogger(env);

    if (app) app.use(log4js.connectLogger(log, null));

    return log;
  },
  getLogger: () => log,
};

module.exports = __export;
