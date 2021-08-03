const __public = {};

__public.getCookie = (req) => req.cookies;
__public.getSignedCookie = (req) => req.signedCookies;

/**
 * 說明：
 * 寫入cookie
 *
 * - 參數：
 *  - req: express req
 *  - res: express res
 *  - name: cookie name
 *  - val: cookie value
 *  - signed: 是否加密，預設為false
 *  - httpOnly: 是否httpOnly，預設為false
 *  - expires: Date, 過期的日期，如果設定為0，則是session cookie
 *  - maxAge: 從現在開始多少milliseconds之後過期，若是maxAge與expires都有設定，會以maxAge為優先
 *  - secure: 是否為ssl，預設為true，如果NODE_ENV不是production，則強制為false
 *  - sameSite: sameSite設定，預設為'none'
 * @param {String} name - cookie name
 * @param {Any} val - cookie value
 * @param {Object=} options - 參數
 * @param {Boolean=} options.signed - 是否加密，預設為false
 * @param {Boolean=} options.httpOnly - 是否httpOnly，預設為true
 * @param {Date=} options.expires - Date, 過期的日期，如果設定為0，則是session cookie
 * @param {Number=} options.maxAge - 從現在開始多少milliseconds之後過期，若是maxAge與expires都有設定，會以maxAge為優先
 * @param {Boolean=} options.secure - 是否為ssl，預設為true，如果NODE_ENV不是production，則強制為false
 * @param {String=} options.sameSite - sameSite設定，預設為'none'
*/
__public.setCookie = (req, res, name, val, {
  domain, path = '/', signed = false, httpOnly = true, expires = 0, maxAge = 0, secure = true, sameSite = 'none',
} = {}) => {
  let issecure = secure;
  let _sameSite = sameSite;
  if (process.env.NODE_ENV !== 'production') issecure = false;
  /*
  如果sameSite='none'，secure必須要為true，否則會被阻擋。
  因此如果判斷sameSite='none'且!secure，則fallback到Lax。
  */
  if (!issecure && sameSite === 'none') _sameSite = 'Lax';

  const opt = {
    path, signed, httpOnly, secure: issecure, sameSite: _sameSite,
  };

  if (maxAge === 0) {
    opt.expires = expires;
  } else {
    opt.maxAge = maxAge;
  }

  if (domain) opt.domain = domain;
  res.cookie(name, val, opt);
};
__public.clearCookie = (res, name) => {
  res.clearCookie(name);
};

module.exports = __public;
