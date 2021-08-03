const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');
const Users = require('~server/app/model/users');
const AccessTokens = require('~server/app/model/access_tokens');
const jwt = require('~server/module/jwt');
const config = require('~server/config');
const cookies = require('~server/module/cookie');

const controller = async (req, res, next) => {
  try {
    const _token = vcheck.str(req.query.access_token);

    const rs = await axios.get(`https://skyid.cc/api/1.0/user/me?access_token=${_token}`);

    if (rs.data.status !== 'OK') throw new Error(rs.data.message);

    const { sky_id, email } = rs.data.data;
    const domain = email.split('@')[1];
    if (domain !== 'medialand.tw' && domain !== 'meshplus.com.tw') {
      if (email !== 'peilingchang1105@gmail.com') throw new Error('不允許的帳號');
    }

    const _old = await Users.findOne({ email }).lean().exec();
    if (!_old) await Users.create({ sky_id, email });

    const _access_token = jwt.sign({
      payload: { i: sky_id }, secret: config.JWT_SECRET, tokenlife: '3d',
    });
    const _refresh_token = jwt.sign({
      payload: { i: sky_id }, secret: config.JWT_SECRET, tokenlife: '300d',
    });
    await AccessTokens.create({
      user_id: sky_id,
      access_token: _access_token,
      refresh_token: _refresh_token,
    });

    cookies.setCookie(req, res, '__MPOI', _access_token, { signed: true, httpOnly: true, secure: true });

    res.redirect('/');
  } catch (e) {
    next(e);
  }
};

module.exports = controller;
