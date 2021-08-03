const AccessToken = require('~root/server/app/model/access_tokens');
const SKError = require('~server/module/errorHandler/SKError');
const jwt = require('~server/module/jwt');
const cookie = require('~server/module/cookie');

/**
 * 自動更新access_token。jwtAutoRefresh等於jwtVerify+jwtRefresh，把jwtRefresh拆開是為了在refresh access_token之前，有必要時可以再加入其他驗證用的middleware。
 *
 * 解析後的payload會放到`res.locals.__jwtPayload`裡。
 * 如果解析錯誤，錯誤會被放到`res.locals.__jwtError`裡。
 *
 * 新的token會在response header的 {"Authorization":"Bearer new_token"}} 回傳。
 * 新的token會繼承舊token的payload以及生命長度。
 *
 * @param {String} secret - jwt加密的secret
 * @param {String=} cookieName - jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 * @param {Object=} cookieOptions - 寫入cookie的參數
 * @returns {Function} Express middleware
*/

const jwtRefresh = ({ cookieName, cookieOptions = {}, secret } = {}) => {
  const wm = async (req, res, next) => {
    if (res.locals.__jwtError && res.locals.__jwtError.code === 'E001005') {
      try {
        const old_token = res.locals.__jwtAccessToken;
        const nowtime = Math.floor((new Date()).getTime() / 1000);
        const oldAccessToken = await AccessToken.findOne({ access_token: old_token }).lean().exec();
        // 舊的token不存在於資料庫
        if (!oldAccessToken) throw new SKError('E001004');
        // 已經被revoked
        if (oldAccessToken.revoked) throw new SKError('E001004');

        let token = '';
        let payload = {};

        if (oldAccessToken.refresh_at) {
          // 如果已經refresh過
          // 如果從上次更新token開始算起15秒，就不再允許使用這個token進行autoRefresh
          if (oldAccessToken.refresh_at < (nowtime - 15) * 1000) throw new SKError('E001005');

          // 取得已經更新的token
          token = oldAccessToken.new_access_token;
          payload = jwt.verify(token, secret);
        } else {
          payload = res.locals.__jwtPayload;
          // 取得原本token的生命週期
          const tokenlife = payload.exp - payload.iat;
          payload.iat = nowtime;
          payload.exp = nowtime + tokenlife;
          // 重新sign一個新的token
          token = jwt.sign({ payload, secret });

          await AccessToken.updateOne({
            access_token: oldAccessToken.access_token,
          }, { new_access_token: token, refresh_at: nowtime * 1000 }).exec();
          const newAccessToken = new AccessToken({ access_token: token, refresh_token: oldAccessToken.refresh_token });
          await newAccessToken.save();
        }
        res.set('Authorization', `Bearer ${token}`);
        res.locals.__jwtError = null;
        res.locals.__jwtPayload = payload;

        if (cookieName) cookie.setCookie(req, res, cookieName, token, cookieOptions);
      } catch (e) {
        if (!(e instanceof SKError)) {
          next(e);
          return;
        }
        res.locals.__jwtError = e;
      }
    }
    next();
  };

  return wm;
};

module.exports = jwtRefresh;
