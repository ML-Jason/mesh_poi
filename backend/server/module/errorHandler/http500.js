/*
處理HTTP 500
通常都會被errorMiddleware攔截，所以很少有錯誤會真的到這裡來
*/

const skevent = require('~server/module/skevent');

module.exports = (err, req, res, next) => {
  // 會到這裡的都是重大錯誤，需回報
  skevent.fire({ type: skevent.types.REPORT_ERROR, data: err });

  if (res.headersSent) {
    // 如果標頭已經傳送，則委派給Express預設的error handler處理(通常不會跑到這裡)
    return next(err);
  }

  // 如果是開發階段，就顯示所有錯誤
  if (process.env.NODE_ENV === 'development') {
    let errstr = '';
    try {
      errstr = err.stack || err.toString();
    } catch (e) {
      errstr = err.toString();
    }
    return res.status(500).send(errstr);
  }
  // 如果是production階段，就只顯示HTTP 500
  return res.status(500).send('HTTP 500');
};
