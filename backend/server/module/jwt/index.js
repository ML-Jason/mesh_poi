const jsonwebtoken = require('jsonwebtoken');
const SKError = require('~server/module/errorHandler/SKError');

const jwt = {};

/**
 * 說明：
 * 生成jwt token
 *
 * - 參數：
 *  - payload: payload
 *  - secret: 加密的secret
 *  - tokenlife: token的生命長度，預設為'7d'。如果payload裡有exp，就忽略tokenlife
 * @param {Object} options - 參數
 * @param {Object=} options.payload - 要被編碼的物件
 * @param {String} options.secret - jwt的secret
 * @param {(String|Number)=} options.tokenlife - token的存活時間
 * @returns {String} jwt token
*/
jwt.sign = ({ payload, secret, tokenlife = '7d' }) => {
  let options = { expiresIn: tokenlife };
  // 如果payload裡有exp，就忽略tokenlife
  if (payload.exp && !Number.isNaN(Number(payload.exp))) options = {};
  const token = jsonwebtoken.sign(payload, secret, options);
  return token;
};

/**
 * 解析jwt token，解析錯誤會throw SKError。
 * E001004=解析錯誤，E001005=過期。
 *
 * - 參數
 *  - token: 要被解析的token
 *  - secret: 加密的secret，預設值可用jwt.secret設定，預設會使用config.JWT_SECRET
 *  - options: 同jwtwebtoken的options
 *
 * @param {String} token - jwt token
 * @param {String=} secret - jwt的secret
 * @param {Object=} options - jwtwebtoken的option
 * @returns {Object} payload
 */
jwt.verify = (token, secret, options) => {
  try {
    if (!token) {
      const e = new Error('JsonWebTokenError');
      e.name = 'JsonWebTokenError';
      throw e;
    }
    const decoded = jsonwebtoken.verify(token, secret, options);
    return decoded;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      if (err.message === 'jwt signature is required') throw err;
      throw new SKError('E001004');
    }
    if (err.name === 'TokenExpiredError') {
      throw new SKError('E001005');
    }
  }
  return '';
};

module.exports = jwt;
