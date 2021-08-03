const AccessTokens = require('~server/app/model/access_tokens');
const SKError = require('~server/module/errorHandler/SKError');
const Users = require('~server/app/model/users');

const middleware = async (req, res, next) => {
  try {
    if (res.locals.__jwtError) {
      next();
      return;
    }
    const _user_id = (res.locals.__jwtPayload || {}).i;
    const _token = res.locals.__jwtAccessToken || '';

    const rs = await AccessTokens.findOne({ user_id: _user_id, access_token: _token }).select('_id').lean().exec();
    if (!rs) throw new SKError('E001004');
    if (rs.revoked) throw new SKError('E001004');

    const _user = await Users.findOne({ sky_id: _user_id }).select('role email status').lean().exec();
    if (!_user) throw new SKError('E001004');
    if (_user.status === 'stop') throw new SKError('E002012');

    res.locals.__jwtPayload.email = _user.email;
    res.locals.__jwtPayload.role = _user.role;

    next();
  } catch (e) {
    res.locals.__jwtPayload = null;
    res.locals.__jwtError = e;
    next();
  }
};

module.exports = middleware;
