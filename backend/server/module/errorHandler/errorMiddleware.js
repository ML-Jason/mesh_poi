/* eslint no-console:0 */
/*
這個MiddleWare負責處理所有controller產生的錯誤。

所有的router或middleware如果next(err)，都會先到這裡來。
主要會做幾件事：
1. 統一錯誤輸出格式
2. 將錯誤訊息轉換成i18n

錯誤的輸出格式統一為：
{ status:'ERROR', message:'錯誤訊息', code:'錯誤代碼' }
其中
status通常為'ERROR'，但是跟登入有關的錯誤訊息，為了前端識別方便，會獨立為'UNAUTHORIZED'
code的錯誤代碼會對應到 /server/module/errorCodes.js
*/

const SKError = require('./SKError');
const skevent = require('~server/module/skevent');

module.exports = (err, req, res, next) => {
  if (err) {
    let errmsg = '';
    let httpStatus = 500;
    let code = '500';
    let status = 'ERROR';
    // 判斷err是否為物件
    if (err instanceof Error) {
      if (err instanceof SKError) {
        httpStatus = err.httpStatus || 500;
        errmsg = err.toLang(res.locals.__lang || 'zh').message;
        code = err.code;

        // 把token相關的錯誤獨立出來一個status，方便前端過濾處理
        if (code === 'E001004' || code === 'E001005') status = 'UNAUTHORIZED';
      } else {
        // 如果是原生Error，直接將err.message取出
        errmsg = err.message;

        // 因為是原生Error，可能會是重大錯誤，所以需要回報。
        // 回報機制需額外編寫，監聽skevent.types.REPORT_ERROR事件。
        skevent.fire({ type: skevent.types.REPORT_ERROR, data: err });

        console.log('\x1b[1m\x1b[33m%s\x1b[0m', '===== /module/errorHandler/errorMiddle =====');
        console.log('\x1b[33m');
        console.log(err);
        console.log('\x1b[1m\x1b[33m%s\x1b[0m', '============================================');
      }
    } else {
      errmsg = err;
    }
    res.status(httpStatus).json({
      status,
      message: errmsg,
      code,
    });
  } else {
    next();
  }
};
