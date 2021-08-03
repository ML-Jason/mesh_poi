const poiListAll = require('~server/app/function/poi/poi_list_all');
const vcheck = require('~server/module/vartool/vcheck');
const SKError = require('~server/module/errorHandler/SKError');

const controller = async (req, res, next) => {
  try {
    const _user = vcheck.str(req.query.user);
    const _pwd = vcheck.str(req.query.password);
    if (_user !== 'hinet' || _pwd !== 'vo6YyBuFQB') {
      throw new SKError('E001001');
    }

    const rs = await poiListAll({
      offset: req.query.offset,
      limit: req.query.limit,
      fields: req.query.fields,
    });

    res.json({
      status: 'OK', data: rs,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = controller;
