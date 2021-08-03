const vcheck = require('~server/module/vartool/vcheck');
const config = require('~server/config');
// const cookie = require('~server/module/cookie');

const __public = {};

__public.detect = (req, res, next) => {
  let clang = vcheck.str(req.cookies.lang) || req.acceptsLanguages(config.LANGS) || 'en';
  if (clang === 'zh-TW') clang = 'zh';
  if (!config.LANGS.includes(clang)) clang = 'en';

  // cookie.setCookie(req, res, '__lang', clang, { httpOnly: false });

  res.locals.__lang = clang;

  next();
};

module.exports = __public;
