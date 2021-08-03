const skylensPoiAllUpdate = require('~server/app/function/skylens/poi_all_update');

const call = async (req, res, next) => {
  try {
    if (res.locals.__jwtError) throw res.locals.__jwtError;

    await skylensPoiAllUpdate();

    res.json({ status: 'OK' });
  } catch (e) {
    next(e);
  }
};

module.exports = call;
