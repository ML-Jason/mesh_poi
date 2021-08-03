const rateLimit = require('express-rate-limit');
const SKError = require('~server/module/errorHandler/SKError');

/**
 * 說明:
 * 簡化RateLimit寫法
 *
 * 使用:
 * ratelimit({windowMs, max, whiteOrigin}):Middleware
 *
 * - 參數:
 *  - windowMs: 每多少毫秒重新reset一次，預設60000
 *  - max: 在windowMs這個區間內允許的呼叫次數，預設50
 *  - whiteOrigin: 如果呼叫是從哪些origin來的就不列入計算，直接pass (Array)
 *  - whiteQuery: 如果在網址裡帶某個參數的話就不列入計算，直接pass (Object)
 *
 * @example
 * 範例:
 * const limiter = ratelimit({
 *  windowMs: 60000,
 *  max: 50,
 *  whiteOrigin:['localhost:8080'],
 *  whiteQuery: { test: 1 },
 * });
 *
 * router.use('/api', limiter);
 *
 * @param {Object} options - 參數
 * @param {Number} options.windowMs - 每多少毫秒重新reset一次，預設60000
 * @param {Number} options.max - 在windowMs這個區間內允許的呼叫次數，預設50
 * @param {String[]=} options.whiteOrigin - 如果呼叫是從哪些origin來的就不列入計算，直接pass (Array)
 * @param {Object=} options.whiteQuery - 如果在網址裡帶某個參數的話就不列入計算，直接pass (Object)
 * @returns {Function} middleware function
*/
module.exports = ({
  windowMs = 60000, max = 50, whiteOrigin, whiteQuery,
} = {}) => {
  const wms = Number(windowMs);
  if (Number.isNaN(wms)) throw new Error('windowMs must be a Integer');
  if (wms <= 0) throw new Error('windowMs must be larger than 0');
  const tmax = Number(max);
  if (Number.isNaN(tmax)) throw new Error('max must be Integer');
  if (tmax <= 0) throw new Error('max must be larger than 0');

  let worigin = [];
  if (whiteOrigin) {
    if (Array.isArray(whiteOrigin)) {
      worigin = whiteOrigin;
    } else {
      worigin = [whiteOrigin.toString()];
    }
  }

  const limiter = rateLimit({
    windowMs: Math.round(wms),
    max: Math.round(tmax),
    handler: (req, res, next) => {
      next(new SKError('E001002'));
    },
    skip: (req) => {
      if (worigin.length > 0) {
        const origin = (req.headers.origin || req.headers.Origin || req.headers.host).replace('http://', '').replace('https://', '');
        const found = worigin.find((f) => f === origin);
        if (found) return true;
      }

      if (whiteQuery) {
        let pass = false;
        Object.keys(whiteQuery).forEach((v) => {
          pass = (req.query[v] || '').toString() === whiteQuery[v].toString();
        });
        if (pass) return true;
      }
      return false;
    },
  });

  return limiter;
};

// module.exports = skRateLimit;
