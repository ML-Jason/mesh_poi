const jwt = require('~root/server/module/jwt');
const SKError = require('~server/module/errorHandler/SKError');
const AccessToken = require('~root/server/app/model/access_tokens');
const cookie = require('~server/module/cookie');
/**
 * 解析jwt token的middleware，會優先檢查header裡的Authorization，再檢查cookies。即使header的token錯誤，也不會檢查cookies，除非header裡沒有Authorization。
 *
 * 解析後的payload會放到`res.locals.__jwtPayload`裡。
 * 如果解析錯誤，錯誤會被放到`res.locals.__jwtError`裡。
 *
 * 若是`autoRefresh=true`，會驗證該token是否已經被refresh過，已經被refresh過的token會在15秒後完全失效(無法再被refresh)。
 * 新的token會在response header的 {"Authorization":"Bearer new_token"}} 回傳。
 * 新的token會繼承舊token的payload以及生命長度。
 *
 *
 * @param {String=} cookieName - jwt存在cookies裡的變數名稱，如果沒有值，就不檢查cookies
 * @param {String} secret - jwt加密的secret
 * @param {Boolean=} autoRefresh - token過期後是否自動在response header裡給予新的token，預設true
 * @param {Object=} cookieOptions - 寫入cookie的參數
 * @returns {Function} Express middleware
*/
const jwtAutoRefresh = ({
  cookieName, cookieOptions = {}, secret, autoRefresh = true,
} = { autoRefresh: true }) => {
  const mw = async (req, res, next) => {
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
      let payload = jwt.verify(token, secret, { ignoreExpiration: true });
      const nowtime = Math.floor((new Date()).getTime() / 1000);
      // 如果token過期
      if (payload.exp <= nowtime) {
        if (!autoRefresh) throw new SKError('E001005');

        const oldAccessToken = await AccessToken.findOne({ access_token: token }).lean().exec();
        // 舊的token不存在於資料庫，可能是被revoke掉了
        if (!oldAccessToken) throw new SKError('E001004');
        // 已經被revoked
        if (oldAccessToken.revoked) throw new SKError('E001004');

        if (oldAccessToken.refresh_at) {
          // 如果已經refresh過
          // 如果從上次更新token開始算起15秒，就不再允許使用這個token進行autoRefresh
          if (oldAccessToken.refresh_at < (nowtime - 15) * 1000) throw new SKError('E001005');

          // 取得已經更新的token
          token = oldAccessToken.new_access_token;
          payload = jwt.verify(token, secret);
        } else {
          // 取得原本token的生命週期
          const tokenlife = payload.exp - payload.iat;
          payload.iat = nowtime;
          payload.exp = nowtime + tokenlife;
          // 重新sign一個新的token
          token = jwt.sign({ payload, secret });

          await AccessToken.updateOne({
            access_token: oldAccessToken.access_token,
          }, { new_access_token: token, refresh_at: nowtime * 1000 }).exec();
          const newAccessToken = new AccessToken({ user_id: payload.i, access_token: token, refresh_token: oldAccessToken.refresh_token });
          await newAccessToken.save();
        }
        res.set('Authorization', `Bearer ${token}`);
        if (cookieName) cookie.setCookie(req, res, cookieName, token, cookieOptions);
      }
      res.locals.__jwtPayload = payload;
    } catch (e) {
      if (!(e instanceof SKError)) {
        next(e);
        return;
      }
      res.locals.__jwtError = e;
    } finally {
      res.locals.__jwtAccessToken = token;
    }

    next();
  };
  return mw;
};

module.exports = jwtAutoRefresh;
