const events = require('events');
const types = require('./type');
const SKEvent = require('./SKEvent');

const emitter = new events.EventEmitter();

const __export = {
  // 觸發事件
  fire: (e) => {
    // if (process.env.APP_ENV === 'development') {
    //   console.log('\x1b[1m\x1b[35m%s\x1b[0m', '========== event dispatched ==========');
    //   console.log('\x1b[35m');
    //   console.log(e);
    //   console.log('\x1b[1m\x1b[35m%s\x1b[0m', '======================================');
    // }

    emitter.emit(e.type, e);
  },
  // 註冊錯誤監聽事件
  on: (type, callback) => {
    emitter.on(type, callback);
    return __export;
  },
  // 取消監聽事件
  off: (type, callback) => {
    emitter.removeListener(type, callback);
    return __export;
  },

  types,
  SKEvent,
};

module.exports = __export;
