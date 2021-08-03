const jwt = require('~root/server/module/jwt');
const SKError = require('~server/module/errorHandler/SKError');
/**
 * 解析jwt token的middleware，會優先檢查header裡的Authorization，再檢查cookies。即使header的token錯誤，也不會檢查cookies，除非header裡沒有Authorization。
 *
 * 解析後的payload會放到`res.locals.__jwtPayload`裡。
 * 如果解析錯誤，錯誤會被放到`res.locals.__jwtError`裡。
 *
 *
 * - 參數:
 *  - cookieName: jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 *
 * @param {String=} cookieName - jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 * @param {String=} secret - jwt加密的secret
 * @returns {Function} Express middleware
*/
module.exports = ({ cookieName, secret } = {}) => {
  const mw = (req, res, next) => {
    let token = '';
    // 從header取得token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1] || '';
    }
    // 如果header沒有token而cookieName有值，就檢查cookies
    if (token === '' && cookieName) {
      token = req.signedCookies[cookieName] || req.cookies[cookieName] || '';
    }
    // 開發模式下允許用?access_token帶入
    if (token === '' && process.env.APP_ENV === 'development') {
      token = req.query.access_token || '';
    }

    try {
      const payload = jwt.verify(token, secret, { ignoreExpiration: true });
      const nowtime = Math.floor((new Date()).getTime() / 1000);
      res.locals.__jwtPayload = payload;

      // 如果token過期
      if (payload.exp <= nowtime) throw new SKError('E001005');
    } catch (e) {
      res.locals.__jwtError = e;
    } finally {
      res.locals.__jwtAccessToken = token;
    }

    next();
  };
  return mw;
};
