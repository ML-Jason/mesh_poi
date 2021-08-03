const config = require('~server/config');
const vcheck = require('~server/module/vartool/vcheck');

const middleware = async (req, res, next) => {
  try {
    if (!res.locals.__jwtError) {
      next();
      return;
    }
    let _user = '';
    let _password = '';
    if (req.headers.authorization) {
      [_user, _password] = req.headers.authorization.replace('Bearer ', '').split(':');
    }
    if (!_user || !_password) {
      _user = vcheck.str(req.query.user);
      _password = vcheck.str(req.query.password);
    }

    const _found = config.API_USER.find((f) => _user === f.user && _password === f.password);
    if (!_found) {
      next();
      return;
    }

    res.locals.__jwtError = null;
    res.locals.__jwtPayload = {
      email: _user,
      role: _found.role,
    };

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = middleware;
